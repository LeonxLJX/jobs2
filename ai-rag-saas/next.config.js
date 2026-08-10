/** @type {import('next').NextConfig} */
const nextConfig = {
  // 关闭开发时的实验性警告
  reactStrictMode: true,
  // 允许上传文件大小限制（字节），这里设为 10MB
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;
