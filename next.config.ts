import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit", "pdf-parse", "mammoth", "pdfjs-dist"],
};

export default nextConfig;
