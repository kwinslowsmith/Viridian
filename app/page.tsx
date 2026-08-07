"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { colors } from "@/app/design/colors";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ color: colors.text, fontSize: "32px", fontWeight: "bold", marginBottom: "16px" }}>
            Welcome to Viridian
          </h1>
          <p style={{ color: colors.text2, fontSize: "16px", marginBottom: "24px" }}>
            Sign in to continue
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            style={{
              backgroundColor: colors.v600,
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: colors.text, fontSize: "32px", fontWeight: "bold", marginBottom: "24px" }}>
        Dashboard
      </h1>
      <p style={{ color: colors.text2, marginBottom: "24px" }}>
        Welcome back, {session.user?.name}. The LMS is being rebuilt with new architecture.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
        <div
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: "8px",
            padding: "16px",
            cursor: "pointer",
          }}
          onClick={() => router.push("/organization")}
        >
          <h2 style={{ color: colors.text, fontWeight: "600", marginBottom: "8px" }}>Organizations</h2>
          <p style={{ color: colors.text2, fontSize: "14px" }}>Manage your schools and organizations</p>
        </div>

        <div
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: "8px",
            padding: "16px",
            cursor: "pointer",
          }}
          onClick={() => router.push("/communities")}
        >
          <h2 style={{ color: colors.text, fontWeight: "600", marginBottom: "8px" }}>Communities</h2>
          <p style={{ color: colors.text2, fontSize: "14px" }}>Discover and join learning communities</p>
        </div>

        <div
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: "8px",
            padding: "16px",
            cursor: "pointer",
          }}
          onClick={() => router.push("/polymath")}
        >
          <h2 style={{ color: colors.text, fontWeight: "600", marginBottom: "8px" }}>Polymath</h2>
          <p style={{ color: colors.text2, fontSize: "14px" }}>Explore articles, modules, and collections</p>
        </div>
      </div>
    </div>
  );
}
