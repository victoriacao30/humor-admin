"use client";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COLORS, tooltipStyle } from "./chartTheme";

type Day = { label: string; posts: number; votes: number };
type Metric = "posts" | "votes" | "both";

export default function ActivityChart({ days }: { days: Day[] }) {
    const [range, setRange] = useState(14);
    const [metric, setMetric] = useState<Metric>("posts");
    const data = days.slice(-range);
    const sum = (k: "posts" | "votes") => data.reduce((s, d) => s + d[k], 0);

    return (
        <div>
            <div className="chart-controls">
                <div className="seg">
                    {[7, 14, 30].map((r) => (
                        <button key={r} type="button" className={`btn btn-sm${range === r ? " btn-primary" : ""}`} onClick={() => setRange(r)}>
                            {r} days
                        </button>
                    ))}
                </div>
                <div className="seg">
                    {(["posts", "votes", "both"] as Metric[]).map((m) => (
                        <button key={m} type="button" className={`btn btn-sm${metric === m ? " btn-primary" : ""}`} onClick={() => setMetric(m)}>
                            {m}
                        </button>
                    ))}
                </div>
            </div>
            <p className="leader-meta">{sum("posts")} posts · {sum("votes")} votes in the last {range} days. Hover a bar for details.</p>
            <div className="chart-box">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="4 4" stroke="#00000022" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 13 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#a9b8f033" }} />
                        {metric === "both" && <Legend />}
                        {metric !== "votes" && (
                            <Bar dataKey="posts" name="Posts" fill={COLORS.peri} stroke={COLORS.ink} strokeWidth={2} radius={[6, 6, 0, 0]} />
                        )}
                        {metric !== "posts" && (
                            <Bar dataKey="votes" name="Votes" fill={COLORS.pink} stroke={COLORS.ink} strokeWidth={2} radius={[6, 6, 0, 0]} />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
