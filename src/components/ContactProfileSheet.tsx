import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User, Copy, Check } from "lucide-react";

interface ContactProfileSheetProps {
  contactId: string | null;
  open: boolean;
  onClose: () => void;
}

interface Profile {
  display_name: string;
  bio: string;
  avatar_url: string | null;
  unique_code: string;
}

const ContactProfileSheet = ({ contactId, open, onClose }: ContactProfileSheetProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!contactId || !open) return;
    supabase
      .from("profiles")
      .select("display_name, bio, avatar_url, unique_code")
      .eq("user_id", contactId)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data as Profile);
      });
  }, [contactId, open]);

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const copyCode = () => {
    if (profile) {
      navigator.clipboard.writeText(profile.unique_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const avatarUrl = profile?.avatar_url
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`
    : null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="bg-background border-border w-80">
        <SheetHeader>
          <SheetTitle className="text-foreground">Contact Info</SheetTitle>
        </SheetHeader>

        {profile && (
          <div className="flex flex-col items-center mt-6 space-y-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt={profile.display_name} className="w-24 h-24 rounded-full object-cover shadow-card" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center shadow-card">
                <User size={36} className="text-muted-foreground" />
              </div>
            )}

            <h3 className="text-lg font-bold text-foreground">{profile.display_name}</h3>

            {profile.bio && (
              <p className="text-sm text-muted-foreground text-center px-4">{profile.bio}</p>
            )}

            <div className="w-full bg-card rounded-xl p-3 mt-4">
              <p className="text-xs text-muted-foreground mb-1">Unique Code</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm tracking-wider text-foreground">{profile.unique_code}</span>
                <button onClick={copyCode} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-foreground">
                  {copied ? <Check size={14} className="text-accent-green" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ContactProfileSheet;
