import { requireAdmin } from "@/lib/supabase-server";
import Window from "@/app/components/Window";

export const dynamic = "force-dynamic";

export default async function Users() {
    const supabase = await requireAdmin();
    if (!supabase) return null;

    const [{ data: profiles }, { data: entries }, { data: votes }] = await Promise.all([
        supabase.from("profiles").select("id, first_name, last_name, avatar_url, registered_at, is_superadmin").order("registered_at", { ascending: false }),
        supabase.from("entries").select("user_id"),
        supabase.from("votes").select("voter_id"),
    ]);
    const postCount = new Map<string, number>();
    (entries ?? []).forEach((e) => postCount.set(e.user_id, (postCount.get(e.user_id) ?? 0) + 1));
    const voteCount = new Map<string, number>();
    (votes ?? []).forEach((v) => voteCount.set(v.voter_id, (voteCount.get(v.voter_id) ?? 0) + 1));

    return (
        <Window url="admin.humorproject.com/users">
            <h1 className="label title">Users ({profiles?.length ?? 0}):</h1>
            <div className="table-wrap">
                <table className="admin-table">
                    <thead>
                    <tr><th>User</th><th>Joined</th><th>Posts</th><th>Votes cast</th><th>Role</th></tr>
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
                            <td>{new Date(p.registered_at).toLocaleDateString()}</td>
                            <td>{postCount.get(p.id) ?? 0}</td>
                            <td>{voteCount.get(p.id) ?? 0}</td>
                            <td>{p.is_superadmin ? <span className="you-tag">Admin</span> : "User"}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </Window>
    );
}
