"use client";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COLORS, tooltipStyle } from "./chartTheme";

type Point = { label: string; votes: number; total: number };

export default function VotesTimeline({ points }: { points: Point[] }) {
    const [view, setView] = useState<"daily" | "total">("daily");
    if (points.length === 0) return <p>No votes yet. They&apos;ll appear here as people vote in the main app.</p>;

    return (
        <div>
            <div className="chart-controls">
                <div className="seg">
                    <button type="button" className={`btn btn-sm${view === "daily" ? " btn-primary" : ""}`} onClick={() => setView("daily")}>
                        Per day
                    </button>
                    <button type="button" className={`btn btn-sm${view === "total" ? " btn-primary" : ""}`} onClick={() => setView("total")}>
                        Running total
                    </button>
                </div>
            </div>
            <div className="chart-box">
                <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={points} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="4 4" stroke="#00000022" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 13 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area
                            type="monotone"
                            dataKey={view === "daily" ? "votes" : "total"}
                            name={view === "daily" ? "Votes that day" : "Total votes so far"}
                            stroke={COLORS.periDark}
                            strokeWidth={3}
                            fill={COLORS.peri}
                            fillOpacity={0.5}
                            dot={{ r: 4, stroke: COLORS.ink, strokeWidth: 2, fill: COLORS.cream }}
                            activeDot={{ r: 7 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
