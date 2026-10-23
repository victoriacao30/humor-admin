"use client";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COLORS, tooltipStyle } from "./chartTheme";

type Hour = { label: string; posts: number; votes: number };

export default function HoursChart({ hours }: { hours: Hour[] }) {
    const [metric, setMetric] = useState<"posts" | "votes">("posts");
    const busiest = hours.reduce((a, b) => (b[metric] > a[metric] ? b : a));

    return (
        <div>
            <div className="chart-controls">
                <div className="seg">
                    {(["posts", "votes"] as const).map((m) => (
                        <button key={m} type="button" className={`btn btn-sm${metric === m ? " btn-primary" : ""}`} onClick={() => setMetric(m)}>
                            {m}
                        </button>
                    ))}
                </div>
            </div>
            <p className="leader-meta">
                Busiest hour for {metric}: {busiest[metric] ? `${busiest.label} (${busiest[metric]})` : "n/a"}
            </p>
            <div className="chart-box">
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={hours} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="4 4" stroke="#00000022" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={1} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#ffd6cc55" }} />
                        <Bar
                            dataKey={metric}
                            name={metric === "posts" ? "Posts" : "Votes"}
                            fill={metric === "posts" ? COLORS.pink : COLORS.peri}
                            stroke={COLORS.ink}
                            strokeWidth={2}
                            radius={[6, 6, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
