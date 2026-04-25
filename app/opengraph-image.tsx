import { ImageResponse } from "next/og";

export const alt = "ATHLEX Training — Programación y entrenamiento ATHX";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "linear-gradient(135deg, #000 0%, #0a0a0a 55%, #1a1a1a 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            opacity: 0.75,
          }}
        >
          ATHLEX Training
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 110, fontWeight: 800, lineHeight: 1 }}>
            Entrenamiento
          </div>
          <div
            style={{
              fontSize: 110,
              fontWeight: 800,
              lineHeight: 1,
              color: "#c7ff3a",
            }}
          >
            ATHX.
          </div>
        </div>
        <div style={{ fontSize: 30, opacity: 0.8 }}>
          Plan semanal · Primera semana gratis · athlextraining.com
        </div>
      </div>
    ),
    { ...size },
  );
}
