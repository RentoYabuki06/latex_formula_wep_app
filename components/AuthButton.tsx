"use client";

import { useEffect, useState } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";
import { useUser } from "@/lib/useUser";

export default function AuthButton() {
  const { user, authReady } = useUser();
  const [authError, setAuthError] = useState<string | null>(null);

  // /auth/callback から ?auth_error= 付きで戻された場合に表示する
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const err = params.get("auth_error");
    if (err) {
      setAuthError(err);
      params.delete("auth_error");
      const qs = params.toString();
      history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
    }
  }, []);

  if (!supabaseConfigured) {
    return <span className="auth-hint">Supabase未設定(履歴は無効)</span>;
  }
  if (!authReady) return null;

  if (!user) {
    return (
      <span className="auth-user">
        {authError && (
          <span className="auth-error" title={authError}>
            ログイン失敗: {authError}
          </span>
        )}
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
      </span>
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
