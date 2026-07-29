import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: "乡音楚韵｜湖北方言社会实践",
    description: "以互动三维湖北地图为入口，展示湖北方言田野调查、声音档案与青年传播实践。",
    openGraph: {
      title: "乡音楚韵",
      description: "一方水土，一城乡音。走进荆楚大地，听见湖北。",
      images: [{ url: "/og.png", width: 1733, height: 908, alt: "乡音楚韵湖北方言社会实践" }],
      type: "website",
      locale: "zh_CN",
    },
    twitter: {
      card: "summary_large_image",
      title: "乡音楚韵",
      description: "一方水土，一城乡音。走进荆楚大地，听见湖北。",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
