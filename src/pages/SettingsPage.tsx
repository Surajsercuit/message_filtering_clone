import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, themes } from "@/contexts/ThemeContext";
import { ArrowLeft, Copy, Check, LogOut, Camera, Pencil } from "lucide-react";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<{
    display_name: string;
    unique_code: string;
    bio: string;
    avatar_url: string | null;
  } | null>(null);
  const [addCode, setAddCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adding, setAdding] = useState(false);

  // Editing state
  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, unique_code, bio, avatar_url")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(data as any);
          setNameInput(data.display_name);
          setBioInput((data as any).bio || "");
        }
      });
  }, [user]);

  const copyCode = () => {
    if (profile) {
      navigator.clipboard.writeText(profile.unique_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const addContact = async () => {
    setError("");
    setSuccess("");
    if (addCode.length !== 10 || !/^\d{10}$/.test(addCode)) {
      setError("Enter a valid 10-digit code");
      return;
    }
    if (profile && addCode === profile.unique_code) {
      setError("That's your own code!");
      return;
    }
    setAdding(true);

    const { data: contactProfile } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .eq("unique_code", addCode)
      .single();

    if (!contactProfile) {
      setError("No user found with this code");
      setAdding(false);
      return;
    }

    const { error: insertErr } = await supabase.from("contacts").insert({
      user_id: user!.id,
      contact_user_id: contactProfile.user_id,
    });

    if (insertErr) {
      if (insertErr.code === "23505") setError("Contact already added!");
      else setError("Failed to add contact");
    } else {
      setSuccess(`Added ${contactProfile.display_name}!`);
      setAddCode("");
    }
    setAdding(false);
  };

  const saveName = async () => {
    if (!nameInput.trim() || !user) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .update({ display_name: nameInput.trim() })
      .eq("user_id", user.id);
    setProfile((p) => p ? { ...p, display_name: nameInput.trim() } : p);
    setEditingName(false);
    setSaving(false);
  };

  const saveBio = async () => {
    if (!user) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .update({ bio: bioInput.trim() })
      .eq("user_id", user.id);
    setProfile((p) => p ? { ...p, bio: bioInput.trim() } : p);
    setEditingBio(false);
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB");
      return;
    }

    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      setError("Failed to upload avatar");
      return;
    }

    await supabase
      .from("profiles")
      .update({ avatar_url: path })
      .eq("user_id", user.id);

    setProfile((p) => p ? { ...p, avatar_url: path } : p);
  };

  const avatarUrl = profile?.avatar_url
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}?t=${Date.now()}`
    : null;

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-card border-b border-border">
        <button onClick={() => navigate("/")} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-foreground">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-semibold text-foreground">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Profile / Avatar */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Profile</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover shadow-card" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-secondary-foreground shadow-card">
                  {profile?.display_name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-elevated"
              >
                <Camera size={13} className="text-primary-foreground" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>
            <div className="flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    maxLength={50}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-secondary text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button onClick={saveName} disabled={saving} className="text-xs text-primary font-semibold">Save</button>
                  <button onClick={() => setEditingName(false)} className="text-xs text-muted-foreground">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{profile?.display_name}</p>
                  <button onClick={() => setEditingName(true)} className="p-1 rounded hover:bg-secondary text-muted-foreground">
                    <Pencil size={12} />
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Bio</p>
              {!editingBio && (
                <button onClick={() => setEditingBio(true)} className="p-1 rounded hover:bg-secondary text-muted-foreground">
                  <Pencil size={12} />
                </button>
              )}
            </div>
            {editingBio ? (
              <div className="space-y-2">
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  placeholder="Tell people about yourself..."
                />
                <div className="flex gap-2">
                  <button onClick={saveBio} disabled={saving} className="text-xs text-primary font-semibold">Save</button>
                  <button onClick={() => setEditingBio(false)} className="text-xs text-muted-foreground">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground">{profile?.bio || "No bio yet"}</p>
            )}
          </div>
        </div>

        {/* Your Code */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Unique Code</h3>
          <p className="text-xs text-muted-foreground mb-2">Share this with friends so they can add you</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-secondary rounded-xl px-4 py-3 font-mono text-lg tracking-[0.3em] text-foreground text-center">
              {profile?.unique_code || "..."}
            </div>
            <button onClick={copyCode} className="p-3 rounded-xl bg-secondary hover:bg-muted transition-colors text-foreground">
              {copied ? <Check size={18} className="text-accent-green" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        {/* Add Contact */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Add Contact</h3>
          <p className="text-xs text-muted-foreground mb-2">Enter their 10-digit code to start chatting</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={addCode}
              onChange={(e) => setAddCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="0000000000"
              maxLength={10}
              className="flex-1 px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-mono tracking-widest placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={addContact}
              disabled={adding}
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-elevated disabled:opacity-50"
            >
              Add
            </button>
          </div>
          {error && <p className="text-xs text-destructive mt-2">{error}</p>}
          {success && <p className="text-xs text-accent-green mt-2">{success}</p>}
        </div>

        {/* Theme */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Theme</h3>
          <div className="grid grid-cols-5 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                  theme === t.id ? "ring-2 ring-primary bg-secondary" : "hover:bg-secondary/60"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full shadow-card border-2"
                  style={{
                    backgroundColor: t.preview,
                    borderColor: theme === t.id ? "hsl(var(--primary))" : "transparent",
                  }}
                />
                <span className="text-[10px] font-medium text-foreground">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <button
            onClick={async () => { await signOut(); navigate("/"); }}
            className="flex items-center gap-2 text-sm text-destructive font-medium"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
