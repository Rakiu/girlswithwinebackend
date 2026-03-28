


import City from "../models/City.js";
import Blog from "../models/Blog.js";
import Girl from "../models/Girl.js";

export const generateSitemap = async (req, res) => {
  try {
    const baseUrl =  "https://girlswithwine.com";

    // 🔥 parallel fetch (faster)
    const [cities, blogs, girls] = await Promise.all([
      City.find({ status: "Active" }),
      Blog.find({ status: "Active" }),
      Girl.find({ status: "Active" })
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?> 
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    /* =============================
       STATIC PAGES
    ============================= */
    const pages = ["", "about", "terms", "privacy", "contact", "blog"];

    pages.forEach((page) => {
      xml += `
<url>
  <loc>${baseUrl}/${page}</loc>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>`;
    });

    /* =============================
       CITY
    ============================= */
    cities.forEach((city) => {
      if (!city?.slug) return;

      xml += `
<url>
  <loc>${baseUrl}/${city.slug}</loc>
  <lastmod>${city.updatedAt?.toISOString?.() || ""}</lastmod>
  <changefreq>daily</changefreq>
  <priority>1.0</priority>
</url>`;
    });

    /* =============================
       GIRL
    ============================= */
   girls.forEach((girl) => {
  if (!girl?.permalink) return;

  xml += `
<url>
  <loc>${baseUrl}/${girl.permalink}</loc>
  <lastmod>${girl.updatedAt?.toISOString?.() || ""}</lastmod>
  <changefreq>daily</changefreq>
  <priority>0.9</priority>
</url>`;
});

    /* =============================
       BLOG
    ============================= */
    blogs.forEach((blog) => {
      if (!blog?.slug) return;

      xml += `
<url>
  <loc>${baseUrl}/blog/${blog.slug}</loc>
  <lastmod>${blog.updatedAt?.toISOString?.() || ""}</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>`;
    });

    xml += `</urlset>`;

    // ✅ headers
    res.header("Content-Type", "application/xml");
    res.status(200).send(xml);

  } catch (error) {
    console.error("❌ Sitemap Error:", error);
    res.status(500).json({ message: "Failed to generate sitemap" });
  }
};