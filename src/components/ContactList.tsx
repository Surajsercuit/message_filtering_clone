import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Settings } from "lucide-react";

interface ContactWithProfile {
  contact_user_id: string;
  display_name: string;
  unique_code: string;
  avatar_url: string | null;
}

const ContactList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<ContactWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchContacts = async () => {
      // Get contacts where user is either side
      const { data } = await supabase
        .from("contacts")
        .select("user_id, contact_user_id")
        .or(`user_id.eq.${user.id},contact_user_id.eq.${user.id}`);

      if (data && data.length > 0) {
        // Get the other person's ID for each contact row
        const otherIds = [...new Set(data.map((c) =>
          c.user_id === user.id ? c.contact_user_id : c.user_id
        ))];

        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, unique_code, avatar_url")
          .in("user_id", otherIds);

        if (profiles) {
          setContacts(
            profiles.map((p) => ({
              contact_user_id: p.user_id,
              display_name: p.display_name,
              unique_code: p.unique_code,
              avatar_url: p.avatar_url,
            }))
          );
        }
      }
      setLoading(false);
    };
    fetchContacts();
  }, [user]);

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const getAvatarUrl = (path: string | null) =>
    path ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${path}` : null;

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Parallel</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Focus your conversation.</p>
        </div>
        <button
          onClick={() => navigate("/settings")}
          className="p-2.5 rounded-xl hover:bg-secondary transition-colors text-foreground"
        >
          <Settings size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">No contacts yet</p>
            <p className="text-xs text-muted-foreground">
              Go to Settings and add friends using their 10-digit code
            </p>
            <button
              onClick={() => navigate("/settings")}
              className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-elevated"
            >
              Add your first contact
            </button>
          </div>
        ) : (
          contacts.map((contact) => {
            const avatar = getAvatarUrl(contact.avatar_url);
            return (
              <button
                key={contact.contact_user_id}
                onClick={() => navigate(`/chat/${contact.contact_user_id}`)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/60 transition-colors text-left border-b border-border/50"
              >
                {avatar ? (
                  <img src={avatar} alt="" className="w-12 h-12 rounded-full object-cover shrink-0 shadow-card" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-secondary-foreground shrink-0 shadow-card">
                    {getInitials(contact.display_name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm text-foreground">{contact.display_name}</span>
                  <p className="text-xs text-muted-foreground">Tap to chat</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ContactList;
