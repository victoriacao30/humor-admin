import { requireAdmin } from "@/lib/supabase-server";
import Window from "@/app/components/Window";
import { addDays, nyDate, shortDay } from "@/lib/dates";
import VotesTimeline from "@/app/components/charts/VotesTimeline";

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

    const perDay = new Map<string, number>();
    (votes ?? []).forEach((v) => {
        const d = nyDate(v.created_at);
        perDay.set(d, (perDay.get(d) ?? 0) + 1);
    });
    const firstDay = [...perDay.keys()].sort()[0];
    const today = nyDate(new Date());
    const points: { label: string; votes: number; total: number }[] = [];
    let running = 0;
    for (let d = firstDay; d && d <= today; d = addDays(d, 1)) {
        running += perDay.get(d) ?? 0;
        points.push({ label: shortDay(d), votes: perDay.get(d) ?? 0, total: running });
    }

    return (
        <div className="stack">
            <Window url="admin.humorproject.com/votes/timeline">
                <p className="label">Votes over time:</p>
                <VotesTimeline points={points} />
            </Window>
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
        </div>
    );
}
