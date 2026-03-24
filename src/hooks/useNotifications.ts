import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useNotifications = () => {
  const { user } = useAuth();
  const permissionRef = useRef<NotificationPermission>("default");

  useEffect(() => {
    if (!("Notification" in window)) return;
    permissionRef.current = Notification.permission;
    if (Notification.permission === "default") {
      Notification.requestPermission().then((p) => {
        permissionRef.current = p;
      });
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const msg = payload.new as { sender_id: string; receiver_id: string; text: string };
          if (msg.receiver_id !== user.id || msg.sender_id === user.id) return;
          if (document.hasFocus()) return;

          if (permissionRef.current === "granted") {
            const { data: profile } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("user_id", msg.sender_id)
              .single();

            new Notification(profile?.display_name || "New message", {
              body: msg.text.length > 100 ? msg.text.slice(0, 100) + "…" : msg.text,
              icon: "/favicon.ico",
              tag: `msg-${msg.sender_id}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
};
