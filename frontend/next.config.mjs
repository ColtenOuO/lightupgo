/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // dev / docker 環境下，next/image 內部代理會嘗試從容器內的 localhost 拉檔失敗；
    // 直接讓瀏覽器去 backend 拿原圖即可。
    unoptimized: true,
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "backend" },
      { protocol: "https", hostname: "**.lightupgo.win" },
      { protocol: "https", hostname: "lightupgo.win" },
    ],
  },
  // 讓 /api/* 和 /uploads/* 透過 Next.js 反向代理到 backend 容器；
  // 這樣前端任何 client 端 fetch 都用相對路徑，無論用 localhost 還是
  // LAN IP 或正式網域開都會通（不用知道 backend 真實位置）。
  async rewrites() {
    const backend =
      process.env.INTERNAL_API_URL || "http://backend:8000";
    return [
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
      { source: "/uploads/:path*", destination: `${backend}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
