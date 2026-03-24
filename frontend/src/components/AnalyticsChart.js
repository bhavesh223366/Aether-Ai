"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

export default function AnalyticsChart({ videos }) {
  const data = useMemo(() => {
    // Generate last 7 days including today
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return { 
        dateKey: d.toISOString().split('T')[0], 
        name: d.toLocaleDateString("en-US", { weekday: "short" }),
        videos: 0,
        scenes: 0
      };
    }).reverse();

    // Fill with actual data
    videos.forEach(v => {
      const vDate = new Date(v.createdAt).toISOString().split('T')[0];
      const day = last7Days.find(d => d.dateKey === vDate);
      if (day) {
        day.videos += 1;
        day.scenes += v.scenes?.length || 0;
      }
    });

    return last7Days;
  }, [videos]);

  const maxVideos = Math.max(...data.map(d => d.videos), 1);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.8rem 1rem", borderRadius: "10px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginBottom: "0.4rem", textTransform: "uppercase" }}>{label}</p>
          <p style={{ color: "#6366f1", fontWeight: "bold", fontSize: "0.95rem" }}>{payload[0].value} Videos</p>
          <p style={{ color: "#f59e0b", fontWeight: "bold", fontSize: "0.95rem" }}>{payload[1]?.value} Scenes</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel" suppressHydrationWarning style={{ padding: "2rem", marginBottom: "3rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-primary)" }}>Activity (Last 7 Days)</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Video generation volume and scenes processed.</p>
      </div>
      
      <div style={{ height: "300px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: "0.8rem" }} dy={10} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: "0.8rem" }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
            
            <Bar dataKey="videos" name="Videos" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-videos-${index}`} fill={entry.videos === maxVideos ? "#818cf8" : "#4f46e5"} />
              ))}
            </Bar>
            
            <Bar dataKey="scenes" name="Scenes" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40}>
               {data.map((entry, index) => (
                <Cell key={`cell-scenes-${index}`} fill="#f59e0b" opacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
