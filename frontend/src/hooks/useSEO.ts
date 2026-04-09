import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = "SpeedGang Match";
const SITE_URL = "https://speedgangmatch.com";
const DEFAULT_IMAGE = `${SITE_URL}/assets/hero-background.png`;

/**
 * 각 페이지별 SEO 메타태그를 동적으로 설정하는 훅
 * - Open Graph (네이버, 카카오, 페이스북)
 * - Twitter Card (트위터/X)
 * - JSON-LD 구조화 데이터 (구글 검색)
 */
export function useSEO({
  title,
  description,
  url,
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
  jsonLd,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const fullUrl = url.startsWith("http") ? url : `${SITE_URL}${url}`;
    const fullImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

    // 페이지 타이틀
    document.title = fullTitle;

    // 기존 동적 메타태그 제거
    document
      .querySelectorAll('meta[data-seo="dynamic"]')
      .forEach((el) => el.remove());

    const setMeta = (
      attr: string,
      attrValue: string,
      content: string
    ) => {
      const meta = document.createElement("meta");
      meta.setAttribute(attr, attrValue);
      meta.setAttribute("content", content);
      meta.setAttribute("data-seo", "dynamic");
      document.head.appendChild(meta);
    };

    // 기본 메타태그
    setMeta("name", "description", description);

    // robots
    if (noindex) {
      setMeta("name", "robots", "noindex, nofollow");
    } else {
      setMeta("name", "robots", "index, follow");
    }

    // Open Graph (네이버, 카카오, 페이스북 등)
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", fullUrl);
    setMeta("property", "og:image", fullImage);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", "ko_KR");

    // Twitter Card
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", fullImage);

    // 네이버 전용
    setMeta("name", "naver-site-verification", "speedgangmatch");

    // JSON-LD 구조화 데이터
    const existingJsonLd = document.querySelector(
      'script[data-seo="jsonld"]'
    );
    if (existingJsonLd) existingJsonLd.remove();

    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "jsonld");
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    // 클린업
    return () => {
      document
        .querySelectorAll('meta[data-seo="dynamic"]')
        .forEach((el) => el.remove());
      const jsonLdScript = document.querySelector(
        'script[data-seo="jsonld"]'
      );
      if (jsonLdScript) jsonLdScript.remove();
    };
  }, [title, description, url, image, type, noindex, jsonLd]);
}