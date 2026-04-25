import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            letterSpacing: 14,
            lineHeight: 1,
          }}
        >
          ATHLEX
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginTop: 24,
          }}
        >
          <div style={{ width: 110, height: 2, background: "rgba(255,255,255,0.35)" }} />
          <div
            style={{
              fontSize: 32,
              fontWeight: 500,
              letterSpacing: 18,
              opacity: 0.75,
            }}
          >
            TRAINING
          </div>
          <div style={{ width: 110, height: 2, background: "rgba(255,255,255,0.35)" }} />
        </div>
      </div>
    ),
    size,
  );
}
