import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // הוספת השורה הזו היא הקריטית כדי שהאתר יעבוד תחת הנתיב הספציפי
  basePath: "/easy-work",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
