"use client";

import { useState } from "react";

/**
 * VideoActions — client component for copy/download script
 * Props: script (string), topic (string)
 */
export default function VideoActions({ script, topic }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = script || "";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const filename = `${topic?.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "script"}.txt`;
    const blob = new Blob([script || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", gap: "0.75rem" }}>
      <button
        onClick={handleCopy}
        className="btn btn-outline"
        style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
      >
        {copied ? "✅ Copied!" : "📋 Copy Script"}
      </button>
      <button
        onClick={handleDownload}
        className="btn btn-outline"
        style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
      >
        ⬇️ Download .txt
      </button>
    </div>
  );
}
