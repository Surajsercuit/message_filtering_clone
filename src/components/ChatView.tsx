import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Shield, ShieldOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ContextBar from "./ContextBar";
import MessageBubble from "./MessageBubble";
import ContactProfileSheet from "./ContactProfileSheet";

const ChatView = () => {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeContext, setActiveContext] = useState("all");
  const [hideSecure, setHideSecure] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [contactName, setContactName] = useState("");
  const [contactAvatar, setContactAvatar] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contactId) return;
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", contactId)
      .single()
      .then(({ data }) => {
        if (data) {
          setContactName(data.display_name);
          setContactAvatar(data.avatar_url);
        }
      });
  }, [contactId]);

  useEffect(() => {
    if (!user || !contactId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as any;
          if (
            (msg.sender_id === user.id && msg.receiver_id === contactId) ||
            (msg.sender_id === contactId && msg.receiver_id === user.id)
          ) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, contactId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeContext]);

  const filteredMessages =
    activeContext === "all"
      ? messages.filter((m) => (hideSecure ? m.context_id !== "private" : true))
      : messages.filter((m) => m.context_id === activeContext);

  const handleSend = async () => {
    if (!inputValue.trim() || !user || !contactId || sending) return;
    setSending(true);
    const contextToSend = activeContext === "all" ? "social" : activeContext;
    await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: contactId,
      context_id: contextToSend,
      text: inputValue.trim(),
    });
    setInputValue("");
    setSending(false);
  };

  const handleParentalToggle = () => {
    setHideSecure(!hideSecure);
    if (!hideSecure && activeContext === "private") setActiveContext("all");
  };

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const avatarUrl = contactAvatar
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${contactAvatar}`
    : null;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-card border-b border-border">
        <button onClick={() => navigate("/")} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-foreground">
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={() => setProfileOpen(true)}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover shadow-card" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-secondary-foreground shadow-card">
              {getInitials(contactName || "?")}
            </div>
          )}
          <div className="flex-1 min-w-0 text-left">
            <h2 className="font-semibold text-sm text-foreground">{contactName || "..."}</h2>
            <p className="text-xs text-muted-foreground">Tap for info</p>
          </div>
        </button>
        <button onClick={handleParentalToggle} className="p-2 rounded-lg hover:bg-secondary transition-colors" title={hideSecure ? "Show private" : "Hide private"}>
          {hideSecure ? <Shield size={18} className="text-accent-green" /> : <ShieldOff size={18} className="text-muted-foreground" />}
        </button>
      </div>

      <ContextBar
        activeContext={activeContext}
        onContextChange={setActiveContext}
        availableContexts={["study", "movies", "social", "private"]}
        hideSecure={hideSecure}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeContext}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {filteredMessages.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={{
                    id: msg.id,
                    text: msg.text,
                    contextId: msg.context_id,
                    sender: msg.sender_id === user?.id ? "me" : "them",
                    timestamp: formatTime(msg.created_at),
                  }}
                  showContextDot={activeContext === "all"}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="px-4 pb-8 pt-2 bg-card border-t border-border">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-secondary rounded-full px-4 py-2.5 shadow-card">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={`Message in ${activeContext === "all" ? "General" : activeContext}...`}
              maxLength={2000}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={sending || !inputValue.trim()}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-elevated transition-transform active:scale-95 disabled:opacity-50"
          >
            <Send size={16} className="text-primary-foreground" />
          </button>
        </div>
      </div>

      <ContactProfileSheet
        contactId={contactId || null}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
};

export default ChatView;
