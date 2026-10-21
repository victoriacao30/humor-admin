"use client";
import { createClient } from "@/lib/supabase-browser";

export function SignInButton() {
    return (
        <button
            className="btn btn-primary"
            onClick={() =>
                createClient().auth.signInWithOAuth({
                    provider: "google",
                    options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                        queryParams: { prompt: "select_account" },
                    },
                })
            }
        >
            Sign in with Google
        </button>
    );
}

export function SignOutButton() {
    return (
        <button
            className="btn btn-sm"
            onClick={async () => {
                await createClient().auth.signOut();
                window.location.href = "/login";
            }}
        >
            Sign out
        </button>
    );
}
