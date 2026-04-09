/**
 * 사이트맵 자동 생성 스크립트
 * 빌드 후 자동으로 sitemap.xml을 dist 폴더에 생성합니다.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 사이트 기본 URL (배포 시 실제 도메인으로 변경)
const SITE_URL = process.env.SITE_URL || 'https://speedgangmatch.com';

// 공개 페이지 목록 (로그인 불필요한 페이지만)
const pages = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/register', changefreq: 'monthly', priority: '0.8' },
  { path: '/pricing', changefreq: 'weekly', priority: '0.8' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
];

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];

  const urls = pages
    .map(
      (page) => `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  const distPath = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }

  fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemap, 'utf-8');
  console.log('✅ sitemap.xml 생성 완료!');

  // robots.txt도 함께 생성
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /auth/
Sitemap: ${SITE_URL}/sitemap.xml`;

  fs.writeFileSync(path.join(distPath, 'robots.txt'), robots, 'utf-8');
  console.log('✅ robots.txt 생성 완료!');
}

generateSitemap();