import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Capacitor } from "@capacitor/core";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-[-40%] left-[-20%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-20%] w-[400px] h-[400px] rounded-full bg-primary/6 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm space-y-8 relative z-10"
      >
        {/* Logo & Brand */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-[72px] h-[72px] rounded-[22px] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
              <path d="M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.8" />
              <path d="M2 9h20" stroke="currentColor" strokeWidth="1.8" />
              <path d="M6 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <h1 className="text-[26px] font-extrabold tracking-tight text-foreground">
              FinTrack
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isSignup ? "Create your account to get started" : "Welcome back to your finances"}
            </p>
          </motion.div>
        </div>

        {/* Social auth buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="space-y-3"
        >
          <Button
            type="button"
            variant="outline"
            className="w-full h-[52px] text-[15px] font-medium rounded-xl border-border/60 bg-card hover:bg-accent/50 transition-all duration-200"
            disabled={loading}
            onClick={async () => {
              setError("");
              const isNative = Capacitor.isNativePlatform();
              const redirectUri = isNative 
                ? "app.lovable.af0d5d1890d84ef29603e2e4ec5528f6://login" 
                : window.location.origin;
                
              const { error } = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: redirectUri,
              });
              if (error) setError(error.message);
            }}
          >
            <svg className="mr-2.5 h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-[52px] text-[15px] font-medium rounded-xl border-border/60 bg-card hover:bg-accent/50 transition-all duration-200"
            disabled={loading}
            onClick={async () => {
              setError("");
              const isNative = Capacitor.isNativePlatform();
              const redirectUri = isNative 
                ? "app.lovable.af0d5d1890d84ef29603e2e4ec5528f6://login" 
                : window.location.origin;

              const { error } = await lovable.auth.signInWithOAuth("apple", {
                redirect_uri: redirectUri,
              });
              if (error) setError(error.message);
            }}
          >
            <svg className="mr-2.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </Button>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="relative"
        >
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 text-muted-foreground/70 tracking-wider text-[11px]">
              or continue with email
            </span>
          </div>
        </motion.div>

        {/* Email form */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-3.5"
        >
          <AnimatePresence mode="popLayout">
            {isSignup && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Input
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-[52px] bg-card border-border/50 rounded-xl px-4 text-[15px] placeholder:text-muted-foreground/50 focus-visible:ring-primary/30 focus-visible:border-primary/40"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-[52px] bg-card border-border/50 rounded-xl px-4 text-[15px] placeholder:text-muted-foreground/50 focus-visible:ring-primary/30 focus-visible:border-primary/40"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="h-[52px] bg-card border-border/50 rounded-xl px-4 text-[15px] placeholder:text-muted-foreground/50 focus-visible:ring-primary/30 focus-visible:border-primary/40"
          />

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-destructive text-sm text-center bg-destructive/10 rounded-lg py-2.5 px-3"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            className="w-full h-[52px] text-[15px] font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary/75 shadow-lg shadow-primary/20 transition-all duration-200"
            disabled={loading}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
              />
            ) : isSignup ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </Button>
        </motion.form>

        {/* Toggle signup/login */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-muted-foreground"
        >
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => { setIsSignup(!isSignup); setError(""); }}
            className="text-primary font-semibold hover:underline underline-offset-2 transition-all"
          >
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
}
