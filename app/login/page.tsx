import { createClient } from "@/lib/supabase-server";
import Window from "@/app/components/Window";
import { SignInButton, SignOutButton } from "@/app/components/AuthButtons";

export default async function Login({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
    const { denied } = await searchParams;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <Window url="admin.humorproject.com/login" className="narrow">
            <h1 className="label title">Admin panel 🔒</h1>
            {denied && user ? (
                <div className="form">
                    <p className="error">{user.email} is not an admin.</p>
                    <p>Only accounts marked as superadmin in the database can enter.</p>
                    <SignOutButton />
                </div>
            ) : (
                <div className="form">
                    <p>Sign in with an admin Google account to continue.</p>
                    <SignInButton />
                </div>
            )}
        </Window>
    );
}
