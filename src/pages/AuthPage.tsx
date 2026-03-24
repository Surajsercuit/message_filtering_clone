import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

const AuthPage = () => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const switchMode = (m: "login" | "signup" | "forgot") => {
    setMode(m);
    setError("");
    setSuccess("");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (err) setError(err.message);
    else setSuccess("Check your email for a password reset link!");
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (mode === "signup" && !displayName.trim()) {
      setError("Please enter your name");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (mode === "login") {
      const { error: err } = await signIn(email, password);
      if (err) setError(err);
    } else {
      const { error: err } = await signUp(email, password, displayName);
      if (err) setError(err);
      else setSuccess("Check your email to confirm your account!");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Parallel</h1>
          <p className="text-sm text-muted-foreground mt-1">Focus your conversation.</p>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-elevated">
          {mode === "forgot" ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => switchMode("login")} className="p-1 rounded-lg hover:bg-secondary text-foreground">
                  <ArrowLeft size={18} />
                </button>
                <h2 className="text-lg font-semibold text-card-foreground">Reset password</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
                {success && <p className="text-xs text-accent-green">{success}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-elevated disabled:opacity-50"
                >
                  {loading ? "..." : "Send reset link"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-card-foreground mb-4">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "signup" && (
                  <input
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={50}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  />
                )}
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={128}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {error && <p className="text-xs text-destructive">{error}</p>}
                {success && <p className="text-xs text-accent-green">{success}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-elevated transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "..." : mode === "login" ? "Sign in" : "Sign up"}
                </button>
              </form>

              {mode === "login" && (
                <button
                  onClick={() => switchMode("forgot")}
                  className="text-xs text-primary font-medium mt-3 block w-full text-center"
                >
                  Forgot password?
                </button>
              )}

              <p className="text-xs text-muted-foreground text-center mt-4">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                  className="text-primary font-medium"
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
