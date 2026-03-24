import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) setError(err.message);
    else {
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    }
    setLoading(false);
  };

  if (!isRecovery) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <p className="text-muted-foreground">Invalid or expired reset link.</p>
          <button onClick={() => navigate("/auth")} className="mt-4 text-primary font-medium text-sm">
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Parallel</h1>
          <p className="text-sm text-muted-foreground mt-1">Set your new password</p>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-elevated">
          {success ? (
            <div className="text-center">
              <p className="text-accent-green font-medium">Password updated!</p>
              <p className="text-xs text-muted-foreground mt-1">Redirecting...</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-3">
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-elevated disabled:opacity-50"
              >
                {loading ? "..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
