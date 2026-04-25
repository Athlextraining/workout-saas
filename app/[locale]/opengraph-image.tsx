import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const alt = "ATHLEX Training";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const t = await getTranslations({
    locale: params.locale,
    namespace: "home.hero",
  });

  // Extract title and split by newlines (e.g., "TRAIN\nGROW\nCOMPETE.")
  const titleFull = t("title");
  const titleLines = titleFull.split("\n");

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
          {titleLines.map((line, idx) => {
            const isAccent = t("titleAccent").includes(line.trim());
            return (
              <div
                key={idx}
                style={{
                  fontSize: 110,
                  fontWeight: 800,
                  lineHeight: 1,
                  color: isAccent ? "#c7ff3a" : "#fff",
                }}
              >
                {line}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 30, opacity: 0.8 }}>
          {t("subtitle")}
        </div>
      </div>
    ),
    { ...size },
  );
}
