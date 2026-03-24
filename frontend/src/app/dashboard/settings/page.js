"use client";

import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="animate-fade-in-up">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Account Settings</h1>
        <p style={{ color: "var(--text-secondary)" }}>Manage your account, billing, and profile.</p>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        {/* Clerk handles the entire settings UI elegantly */}
        <UserProfile routing="hash" />
      </div>
    </div>
  );
}
