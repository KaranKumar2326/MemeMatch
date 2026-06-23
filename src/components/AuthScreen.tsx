import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Sparkles, Flame, Eye, EyeOff, Mail, Lock, User, KeySquare, HelpCircle } from "lucide-react";
import { playMessageSound } from "../audioUtils";

interface AuthScreenProps {
  onAuthSuccess: (uid: string) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [useEmailAuth, setUseEmailAuth] = useState(false); // Default to prompt Google Sign-In
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Use signInWithPopup as highly recommended in workspace & iframe contexts
      const result = await signInWithPopup(auth, provider);
      playMessageSound();
      onAuthSuccess(result.user.uid);
    } catch (err: any) {
      console.error(err);
      let friendlyError = "Google Authentication failed. Please retry.";
      if (err.code === "auth/popup-closed-by-user") {
        friendlyError = "Sign-in popup was closed before completion.";
      } else if (err.code === "auth/operation-not-allowed") {
        friendlyError = "Google Login is not enabled. Please enable it in the Firebase console.";
      }
      setErrorMsg(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please provide all credentials required.");
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        playMessageSound();
        onAuthSuccess(userCredential.user.uid);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        playMessageSound();
        onAuthSuccess(userCredential.user.uid);
      }
    } catch (err: any) {
      console.error(err);
      let friendlyError = "Authentication failed. Check your credentials.";
      if (err.code === "auth/operation-not-allowed") {
        friendlyError = "Email/Password sign-in has not been enabled in your Firebase console yet. Try Google Sign-In instead!";
      } else if (err.code === "auth/invalid-credential") {
        friendlyError = "Incorrect password or email combination.";
      } else if (err.code === "auth/weak-password") {
        friendlyError = "Password should be at least 6 characters.";
      } else if (err.code === "auth/email-already-in-use") {
        friendlyError = "An account with this email already exists.";
      } else if (err.code === "auth/invalid-email") {
        friendlyError = "Please enter a valid email address.";
      }
      setErrorMsg(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 justify-between p-6 h-full text-slate-900 font-sans select-none bg-slate-50">
      
      {/* Brand & Concept Logo */}
      <div className="flex flex-col items-center text-center mt-6 gap-2 shrink-0">
        <div className="relative">
          <div className="w-14 h-14 rounded-3xl bg-rose-500 flex items-center justify-center shadow-lg text-white font-black text-3xl">
            M
          </div>
          <div className="absolute -bottom-1 -right-1 bg-yellow-400 p-1.5 rounded-full border border-white shadow">
            <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-600" />
          </div>
        </div>
        <h1 className="text-2.5xl font-black mt-2 text-slate-900 tracking-tight leading-none">
          MemeMatch
        </h1>
        <p className="text-[10px] uppercase tracking-widest font-black text-rose-500 font-mono">
          Market Launch Edition
        </p>
        <p className="text-[11px] font-semibold text-slate-500 max-w-xs leading-normal px-4">
          The world&apos;s first dynamic dating pool powered by real laughter sync and zero AI chatbots.
        </p>
      </div>

      {/* Auth Mode card panel */}
      <div className="flex-1 flex flex-col justify-center gap-3.5 my-4 w-full max-w-sm mx-auto bg-white p-5 rounded-[28px] border border-slate-100/80 shadow-sm relative shrink-0">
        
        {!useEmailAuth ? (
          // Recommended Google Sign-In Pane
          <div className="flex flex-col gap-4 text-center">
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 font-mono block mb-1">
                RECOMMENDED METHOD
              </span>
              <h3 className="text-sm font-extrabold text-slate-800 leading-tight">
                Instantly Match with Real Google Accounts
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal mt-1">
                Google Login is enabled by default. Secure authentication instantly without any password.
              </p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              type="button"
              className="w-full bg-slate-900 hover:bg-slate-850 text-white py-3.5 rounded-xl text-xs font-black shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
              id="google_auth_btn"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connecting to Google...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[9px] uppercase font-bold">
                <span className="bg-white px-2.5 text-slate-400 font-mono">OR FALLBACK</span>
              </div>
            </div>

            <button
              onClick={() => {
                setUseEmailAuth(true);
                setErrorMsg(null);
              }}
              type="button"
              className="w-full text-[10.5px] font-extrabold text-slate-500 hover:text-rose-500 transition py-1 cursor-pointer"
              id="show_email_auth_btn"
            >
              Use Email / Password instead
            </button>
          </div>
        ) : (
          // Fallback Email Auth Form
          <div className="flex flex-col gap-3">
            {/* Switch tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setErrorMsg(null);
                }}
                type="button"
                className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  isLogin ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                }`}
                id="auth_tab_login"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setErrorMsg(null);
                }}
                type="button"
                className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  !isLogin ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                }`}
                id="auth_tab_signup"
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3 text-left">
              {/* Email */}
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1 pl-1">
                  <Mail className="w-3.5 h-3.5 text-rose-500" />
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 outline-none focus:border-rose-300 transition"
                  disabled={isLoading}
                  id="auth_input_email"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1 pl-1">
                  <Lock className="w-3.5 h-3.5 text-rose-500" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs font-semibold pl-3 pr-9 py-2 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 outline-none focus:border-rose-300 transition"
                    disabled={isLoading}
                    id="auth_input_password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                    id="auth_btn_toggle_pw_visibility"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <p className="text-[10px] font-bold text-rose-600 text-center leading-normal animate-shake">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl text-xs font-black shadow-lg shadow-rose-500/10 flex items-center justify-center gap-1.5 transition disabled:bg-slate-250 disabled:text-slate-400 cursor-pointer"
                id="auth_submit_main"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : isLogin ? (
                  "Secure Log In ✨"
                ) : (
                  "Register & Start Vibe Quiz 🚀"
                )}
              </button>
            </form>

            <button
              onClick={() => {
                setUseEmailAuth(false);
                setErrorMsg(null);
              }}
              type="button"
              className="mt-1 text-[10px] font-extrabold text-slate-400 hover:text-slate-600 transition cursor-pointer"
              id="back_to_google_btn"
            >
              ← Back to Google Sign-In
            </button>
          </div>
        )}
      </div>

      {/* Detail warning of configuration if they use fallback */}
      <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200/50 max-w-sm mx-auto flex flex-col gap-1 text-left shrink-0">
        <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-slate-500 font-mono">
          Launch Deployment Info
        </span>
        <p className="text-[9.5px] font-medium text-slate-500 leading-relaxed">
          The pre-configured Google Authentication client works automatically. If you desire custom Email/Password logins, remember to enable &ldquo;Email/Password&rdquo; in the Firebase Identity Sign-In console.
        </p>
      </div>

      {/* Foot disclaimer */}
      <span className="text-[9px] font-bold text-slate-400 text-center mb-2 leading-none select-none">
        🔒 SSL Certified. Connected to live production Firestore database.
      </span>
    </div>
  );
}
