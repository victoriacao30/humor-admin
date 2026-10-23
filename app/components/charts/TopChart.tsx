"use client";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COLORS, tooltipStyle } from "./chartTheme";

type Item = { name: string; count: number };

export default function TopChart({ artists, songs }: { artists: Item[]; songs: Item[] }) {
    const [view, setView] = useState<"artists" | "songs">("artists");
    const data = view === "artists" ? artists : songs;

    return (
        <div>
            <div className="chart-controls">
                <div className="seg">
                    {(["artists", "songs"] as const).map((v) => (
                        <button key={v} type="button" className={`btn btn-sm${view === v ? " btn-primary" : ""}`} onClick={() => setView(v)}>
                            Top {v}
                        </button>
                    ))}
                </div>
            </div>
            {data.length === 0 ? (
                <p>No posts yet.</p>
            ) : (
                <div className="chart-box">
                    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 46)}>
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="#00000022" horizontal={false} />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 13 }} />
                            <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 13 }} />
                            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#a9b8f033" }} />
                            <Bar dataKey="count" name="Posts" fill={COLORS.peri} stroke={COLORS.ink} strokeWidth={2} radius={[0, 6, 6, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
