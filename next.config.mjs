// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 경고: 빌드 시 ESLint 오류가 있어도 프로덕션 빌드를 성공적으로 완료하도록 허용합니다.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;