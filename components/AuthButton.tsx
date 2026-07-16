"use client";

import { createClient, supabaseConfigured } from "@/lib/supabase/client";
import { useUser } from "@/lib/useUser";

export default function AuthButton() {
  const { user, authReady } = useUser();

  if (!supabaseConfigured) {
    return <span className="auth-hint">Supabase未設定(履歴は無効)</span>;
  }
  if (!authReady) return null;

  if (!user) {
    return (
      <button
        className="btn"
        onClick={() => {
          const supabase = createClient();
          supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${location.origin}/auth/callback` },
          });
        }}
      >
        Googleでログイン
      </button>
    );
  }

  return (
    <span className="auth-user">
      {user.email}
      <button
        className="btn"
        onClick={async () => {
          await createClient().auth.signOut();
        }}
      >
        ログアウト
      </button>
    </span>
  );
}
