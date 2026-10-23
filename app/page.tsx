import { requireAdmin } from "@/lib/supabase-server";
import { addDays, hourLabel, nyDate, nyHour, shortDay } from "@/lib/dates";
import Window from "@/app/components/Window";
import ActivityChart from "@/app/components/charts/ActivityChart";
import HoursChart from "@/app/components/charts/HoursChart";
import TopChart from "@/app/components/charts/TopChart";

export const dynamic = "force-dynamic";

function topCounts(values: string[], n = 8) {
  const counts = new Map<string, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([name, count]) => ({ name, count }));
}

export default async function Dashboard() {
  const supabase = await requireAdmin();
  if (!supabase) return null;

  const [{ data: entries }, { data: votes }, { data: profiles }, { data: groups }] = await Promise.all([
    supabase.from("entries").select("id, user_id, battle_date, created_at, song_title, song_artist, meme_url, caption"),
    supabase.from("votes").select("id, voter_id, winner_id, loser_id, created_at"),
    supabase.from("profiles").select("id, first_name, last_name"),
    supabase.from("groups").select("id"),
  ]);
  const posts = entries ?? [];
  const allVotes = votes ?? [];
  const names = new Map((profiles ?? []).map((p) => [p.id, `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Unnamed"]));
  const today = nyDate(new Date());

  const daily = Array.from({ length: 30 }, (_, i) => {
    const d = addDays(today, i - 29);
    return {
      label: shortDay(d),
      posts: posts.filter((p) => p.battle_date === d).length,
      votes: allVotes.filter((v) => nyDate(v.created_at) === d).length,
    };
  });

  const hours = Array.from({ length: 24 }, (_, h) => ({
    label: hourLabel(h),
    posts: posts.filter((p) => nyHour(p.created_at) === h).length,
    votes: allVotes.filter((v) => nyHour(v.created_at) === h).length,
  }));

  const record = new Map<number, { wins: number; matchups: number }>();
  allVotes.forEach((v) => {
    const w = record.get(v.winner_id) ?? { wins: 0, matchups: 0 };
    w.wins++;
    w.matchups++;
    record.set(v.winner_id, w);
    const l = record.get(v.loser_id) ?? { wins: 0, matchups: 0 };
    l.matchups++;
    record.set(v.loser_id, l);
  });
  const hallOfFame = posts
      .map((p) => ({ ...p, ...(record.get(p.id) ?? { wins: 0, matchups: 0 }) }))
      .filter((p) => p.matchups >= 2)
      .sort((a, b) => b.wins / b.matchups - a.wins / a.matchups || b.matchups - a.matchups)
      .slice(0, 3);
  const topVoters = topCounts(allVotes.map((v) => names.get(v.voter_id) ?? "Unknown"), 5);

  const tiles = [
    { label: "users", value: profiles?.length ?? 0 },
    { label: "posts", value: posts.length },
    { label: "votes", value: allVotes.length },
    { label: "groups", value: groups?.length ?? 0 },
    { label: "posts today", value: posts.filter((p) => p.battle_date === today).length },
    { label: "votes per post", value: posts.length ? ((allVotes.length * 2) / posts.length).toFixed(1) : "0" },
  ];

  return (
      <div className="stack">
        <Window url="admin.humorproject.com/dashboard">
          <h1 className="label title">At a glance:</h1>
          <div className="stat-grid admin-tiles">
            {tiles.map((t) => (
                <div key={t.label} className="frame stat-tile">
                  <span className="stat-num">{t.value}</span>
                  <span className="stat-label">{t.label}</span>
                </div>
            ))}
          </div>
        </Window>

        <Window url="admin.humorproject.com/charts/activity">
          <p className="label">Activity over time:</p>
          <ActivityChart days={daily} />
        </Window>

        <Window url="admin.humorproject.com/charts/hours">
          <p className="label">When are people active?</p>
          <HoursChart hours={hours} />
        </Window>

        <Window url="admin.humorproject.com/charts/music">
          <p className="label">What&apos;s everyone listening to?</p>
          <TopChart
              artists={topCounts(posts.map((p) => p.song_artist))}
              songs={topCounts(posts.map((p) => `${p.song_title} · ${p.song_artist}`))}
          />
        </Window>

        <div className="admin-two-col">
          <Window url="admin.humorproject.com/hall-of-fame">
            <p className="label">Hall of fame 👑 (best win rate):</p>
            {hallOfFame.length === 0 ? (
                <p>Not enough votes yet.</p>
            ) : (
                <ol className="stack">
                  {hallOfFame.map((p) => (
                      <li key={p.id} className="frame fame-row">
                        <img src={p.meme_url} alt="" />
                        <div>
                          <p className="caption-text">“{p.caption}”</p>
                          <p className="leader-meta">
                            {names.get(p.user_id)} · {Math.round((p.wins / p.matchups) * 100)}% of {p.matchups} matchups
                          </p>
                        </div>
                      </li>
                  ))}
                </ol>
            )}
          </Window>
          <Window url="admin.humorproject.com/top-voters">
            <p className="label">Most active voters:</p>
            {topVoters.length === 0 ? (
                <p>No votes yet.</p>
            ) : (
                <ol className="rank-list">
                  {topVoters.map((v) => (
                      <li key={v.name}><span>{v.name}</span><span className="leader-meta">{v.count} votes</span></li>
                  ))}
                </ol>
            )}
          </Window>
        </div>
      </div>
  );
}
