import Link from "next/link";
import { requireAdmin } from "@/lib/supabase-server";
import Window from "@/app/components/Window";
import DeleteButton from "@/app/components/DeleteButton";
import { deleteMeme } from "./actions";

export const dynamic = "force-dynamic";

export default async function Memes() {
    const supabase = await requireAdmin();
    if (!supabase) return null;

    const [{ data: entries }, { data: profiles }, { data: votes }] = await Promise.all([
        supabase
            .from("entries")
            .select("id, user_id, battle_date, meme_url, caption, song_title, song_artist")
            .order("battle_date", { ascending: false })
            .order("id", { ascending: false }),
        supabase.from("profiles").select("id, first_name"),
        supabase.from("votes").select("winner_id, loser_id"),
    ]);
    const names = new Map((profiles ?? []).map((p) => [p.id, p.first_name ?? "Someone"]));
    const wins = new Map<number, number>();
    const games = new Map<number, number>();
    (votes ?? []).forEach((v) => {
        wins.set(v.winner_id, (wins.get(v.winner_id) ?? 0) + 1);
        games.set(v.winner_id, (games.get(v.winner_id) ?? 0) + 1);
        games.set(v.loser_id, (games.get(v.loser_id) ?? 0) + 1);
    });

    return (
        <Window url="admin.humorproject.com/memes">
            <div className="admin-head">
                <h1 className="label title">AI memes ({entries?.length ?? 0}):</h1>
                <Link href="/memes/new" className="btn btn-primary">＋ New meme</Link>
            </div>
            <ul className="meme-grid">
                {(entries ?? []).map((e) => (
                    <li key={e.id} className="frame meme-card">
                        <img src={e.meme_url} alt="" />
                        <p className="caption-text">“{e.caption}”</p>
                        <p className="leader-meta">
                            ♫ {e.song_title} · {e.song_artist}
                            <br />
                            by {names.get(e.user_id)} · {e.battle_date} · {wins.get(e.id) ?? 0}/{games.get(e.id) ?? 0} wins
                        </p>
                        <div className="actions">
                            <Link href={`/memes/${e.id}`} className="btn btn-sm">Edit</Link>
                            <form action={deleteMeme.bind(null, e.id)}>
                                <DeleteButton />
                            </form>
                        </div>
                    </li>
                ))}
            </ul>
        </Window>
    );
}
