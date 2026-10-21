import { requireAdmin } from "@/lib/supabase-server";
import Window from "@/app/components/Window";

export const dynamic = "force-dynamic";

const nyDate = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
const addDays = (date: string, n: number) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const shortDay = (date: string) =>
    new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "numeric", day: "numeric", timeZone: "UTC" });

function topCounts(values: string[], n = 5) {
  const counts = new Map<string, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

export default async function Dashboard() {
  const supabase = await requireAdmin();
  if (!supabase) return null;

  const [{ data: entries }, { data: votes }, { data: profiles }, { data: groups }] = await Promise.all([
    supabase.from("entries").select("id, user_id, battle_date, created_at, song_title, song_artist, meme_url, caption"),
    supabase.from("votes").select("id, voter_id, winner_id, loser_id"),
    supabase.from("profiles").select("id, first_name, last_name"),
    supabase.from("groups").select("id"),
  ]);
  const posts = entries ?? [];
  const allVotes = votes ?? [];
  const names = new Map((profiles ?? []).map((p) => [p.id, `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Unnamed"]));
  const today = nyDate(new Date());

  // Posts per day, last 14 days
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));
  const perDay = days.map((d) => ({ label: shortDay(d), count: posts.filter((p) => p.battle_date === d).length }));
  const maxDay = Math.max(1, ...perDay.map((d) => d.count));

  // Posting hour (New York time)
  const hours = Array.from({ length: 24 }, (_, h) => ({
    label: h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`,
    count: posts.filter(
        (p) =>
            Number(new Date(p.created_at).toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/New_York" })) % 24 === h
    ).length,
  }));
  const maxHour = Math.max(1, ...hours.map((h) => h.count));
  const busiest = hours.reduce((a, b) => (b.count > a.count ? b : a));

  // Tops
  const topArtists = topCounts(posts.map((p) => p.song_artist));
  const topSongs = topCounts(posts.map((p) => `${p.song_title} · ${p.song_artist}`));
  const topVoters = topCounts(allVotes.map((v) => names.get(v.voter_id) ?? "Unknown"));
  const maxArtist = Math.max(1, ...topArtists.map(([, c]) => c));

  // Hall of fame: best win rate (min 2 matchups)
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

  const tiles = [
    { label: "users", value: profiles?.length ?? 0 },
    { label: "posts", value: posts.length },
    { label: "votes", value: allVotes.length },
    { label: "groups", value: groups?.length ?? 0 },
    { label: "posts today", value: posts.filter((p) => p.battle_date === today).length },
    { label: "votes per post", value: posts.length ? (allVotes.length * 2 / posts.length).toFixed(1) : "0" },
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

        <Window url="admin.humorproject.com/charts/posts-per-day">
          <p className="label">Posts per day (last 14 days):</p>
          <div className="bar-chart">
            {perDay.map((d) => (
                <div key={d.label} className="bar-col">
                  <span className="bar-value">{d.count || ""}</span>
                  <div className="bar" style={{ height: `${(d.count / maxDay) * 100}%` }} />
                  <span className="bar-label">{d.label}</span>
                </div>
            ))}
          </div>
        </Window>

        <Window url="admin.humorproject.com/charts/posting-hours">
          <p className="label">When do people post? (busiest: {busiest.count ? busiest.label : "n/a"})</p>
          <div className="bar-chart bar-chart-tight">
            {hours.map((h) => (
                <div key={h.label} className="bar-col">
                  <div className="bar bar-alt" style={{ height: `${(h.count / maxHour) * 100}%` }} title={`${h.count} posts`} />
                  <span className="bar-label">{h.label}</span>
                </div>
            ))}
          </div>
        </Window>

        <div className="admin-two-col">
          <Window url="admin.humorproject.com/charts/artists">
            <p className="label">Top artists:</p>
            {topArtists.length === 0 ? <p>No posts yet.</p> : (
                <ul className="hbar-list">
                  {topArtists.map(([name, count]) => (
                      <li key={name}>
                        <span className="hbar-name">{name}</span>
                        <div className="hbar"><div style={{ width: `${(count / maxArtist) * 100}%` }} /></div>
                        <span className="hbar-count">{count}</span>
                      </li>
                  ))}
                </ul>
            )}
          </Window>
          <Window url="admin.humorproject.com/charts/songs">
            <p className="label">Most-posted songs:</p>
            <ol className="rank-list">
              {topSongs.map(([song, count]) => (
                  <li key={song}><span>{song}</span><span className="leader-meta">{count}×</span></li>
              ))}
            </ol>
          </Window>
        </div>

        <div className="admin-two-col">
          <Window url="admin.humorproject.com/hall-of-fame">
            <p className="label">Hall of fame 👑 (best win rate):</p>
            {hallOfFame.length === 0 ? <p>Not enough votes yet.</p> : (
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
            <ol className="rank-list">
              {topVoters.map(([name, count]) => (
                  <li key={name}><span>{name}</span><span className="leader-meta">{count} votes</span></li>
              ))}
            </ol>
          </Window>
        </div>
      </div>
  );
}
