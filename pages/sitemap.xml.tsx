import { GetServerSideProps } from "next";

export const runtime = "edge";

const DOMAIN = "https://aiandcoffee.com";

const PAGES = [
  { url: "/",                  priority: "1.0", changefreq: "weekly"  },
  { url: "/events",            priority: "0.9", changefreq: "daily"   },
  { url: "/tools",             priority: "0.8", changefreq: "weekly"  },
  { url: "/tools/og-image",    priority: "0.7", changefreq: "monthly" },
  { url: "/about",             priority: "0.7", changefreq: "monthly" },
];

function generateSitemap(): string {
  const today = new Date().toISOString().split("T")[0];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(({ url, priority, changefreq }) => `  <url>
    <loc>${DOMAIN}${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join("\n")}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader("Content-Type", "text/xml");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
  res.write(generateSitemap());
  res.end();
  return { props: {} };
};

export default function Sitemap() {
  return null;
}
