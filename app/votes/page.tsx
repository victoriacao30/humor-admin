import { requireAdmin } from "@/lib/supabase-server";
import Window from "@/app/components/Window";

export const dynamic = "force-dynamic";

export default async function Votes() {
    const supabase = await requireAdmin();
    if (!supabase) return null;

    const [{ data: votes }, { data: entries }, { data: profiles }] = await Promise.all([
        supabase.from("votes").select("id, voter_id, winner_id, loser_id, battle_date, created_at").order("created_at", { ascending: false }),
        supabase.from("entries").select("id, meme_url, caption"),
        supabase.from("profiles").select("id, first_name"),
    ]);
    const posts = new Map((entries ?? []).map((e) => [e.id, e]));
    const names = new Map((profiles ?? []).map((p) => [p.id, p.first_name ?? "Someone"]));

    return (
        <Window url="admin.humorproject.com/votes">
            <h1 className="label title">Votes ({votes?.length ?? 0}):</h1>
            <div className="table-wrap">
                <table className="admin-table">
                    <thead>
                    <tr><th>When</th><th>Voter</th><th>Picked 👑</th><th>Over</th></tr>
                    </thead>
                    <tbody>
                    {(votes ?? []).map((v) => {
                        const winner = posts.get(v.winner_id);
                        const loser = posts.get(v.loser_id);
                        return (
                            <tr key={v.id}>
                                <td>{new Date(v.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" })}</td>
                                <td>{names.get(v.voter_id)}</td>
                                <td><span className="vote-cell">{winner && <img src={winner.meme_url} alt="" />}“{winner?.caption}”</span></td>
                                <td><span className="vote-cell">{loser && <img src={loser.meme_url} alt="" />}“{loser?.caption}”</span></td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </Window>
    );
}
