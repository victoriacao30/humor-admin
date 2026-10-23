import { requireAdmin } from "@/lib/supabase-server";
import Window from "@/app/components/Window";
import { adminByEmail, setAdmin } from "./actions";

export const dynamic = "force-dynamic";

function countBy(ids: string[]) {
    const m = new Map<string, number>();
    ids.forEach((id) => m.set(id, (m.get(id) ?? 0) + 1));
    return m;
}

export default async function Users({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
    const { msg } = await searchParams;
    const supabase = await requireAdmin();
    if (!supabase) return null;

    const [{ data: profiles }, { data: entries }, { data: votes }, { data: emails }, { data: me }] = await Promise.all([
        supabase
            .from("profiles")
            .select("id, first_name, last_name, avatar_url, registered_at, is_superadmin")
            .order("registered_at", { ascending: false }),
        supabase.from("entries").select("user_id"),
        supabase.from("votes").select("voter_id"),
        supabase.rpc("list_user_emails"),
        supabase.auth.getUser(),
    ]);

    const emailOf = new Map(((emails ?? []) as { id: string; email: string }[]).map((e) => [e.id, e.email]));
    const posts = countBy((entries ?? []).map((e) => e.user_id));
    const votesCast = countBy((votes ?? []).map((v) => v.voter_id));
    const myId = me.user?.id;

    return (
        <div className="stack">
            <Window url="admin.humorproject.com/users/add-admin" className="narrow">
                <p className="label">Make someone an admin:</p>
                <form action={adminByEmail} className="promote-form">
                    <input name="email" type="email" required placeholder="name@gmail.com" className="field admin-field" />
                    <button className="btn btn-primary">Make admin</button>
                </form>
                <p className="leader-meta share-hint">
                    Works even if they haven&apos;t signed in yet. They&apos;ll become an admin on their first sign-in.
                </p>
                {msg && <p className="status share-hint">{msg}</p>}
            </Window>

            <Window url="admin.humorproject.com/users">
                <h1 className="label title">Users ({profiles?.length ?? 0}):</h1>
                <div className="table-wrap">
                    <table className="admin-table">
                        <thead>
                        <tr><th>User</th><th>Email</th><th>Joined</th><th>Posts</th><th>Votes</th><th>Role</th></tr>
                        </thead>
                        <tbody>
                        {(profiles ?? []).map((p) => (
                            <tr key={p.id}>
                                <td>
                    <span className="user-cell">
                      {p.avatar_url ? <img src={p.avatar_url} alt="" /> : <span className="chip-initial">{p.first_name?.[0] ?? "?"}</span>}
                        {`${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || <em>No name yet</em>}
                    </span>
                                </td>
                                <td>{emailOf.get(p.id) ?? "—"}</td>
                                <td>{new Date(p.registered_at).toLocaleDateString()}</td>
                                <td>{posts.get(p.id) ?? 0}</td>
                                <td>{votesCast.get(p.id) ?? 0}</td>
                                <td>
                                    <div className="role-cell">
                                        {p.is_superadmin ? <span className="you-tag">Admin</span> : <span>User</span>}
                                        {p.id !== myId && (
                                            <form action={setAdmin.bind(null, p.id, !p.is_superadmin)}>
                                                <button className="btn btn-sm">{p.is_superadmin ? "Remove admin" : "Make admin"}</button>
                                            </form>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </Window>
        </div>
    );
}
