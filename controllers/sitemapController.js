import City from "../models/City.js";
import Girl from "../models/Girl.js";
import SubCity from "../models/SubCity.js";

/* =========================================================
   MAIN SITEMAP INDEX
========================================================= */
export const generateSitemap = async (req, res) => {

  try {

    const baseUrl = "https://girlswithwine.com";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>

<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <sitemap>
    <loc>${baseUrl}/page-sitemap.xml</loc>
  </sitemap>

  <sitemap>
    <loc>${baseUrl}/city-sitemap.xml</loc>
  </sitemap>

  <sitemap>
    <loc>${baseUrl}/subcity-sitemap.xml</loc>
  </sitemap>

  <sitemap>
    <loc>${baseUrl}/profile-sitemap.xml</loc>
  </sitemap>

  <sitemap>
    <loc>${baseUrl}/post-sitemap.xml</loc>
  </sitemap>

</sitemapindex>`;

    res.header("Content-Type", "application/xml");

    return res.status(200).send(xml);

  } catch (error) {

    console.log("❌ Sitemap Error:", error);

    return res.status(500).json({
      message: "Failed to generate sitemap"
    });

  }

};



/* =========================================================
   PAGE SITEMAP
========================================================= */
export const generatePageSitemap = async (req, res) => {

  try {

    const baseUrl = "https://girlswithwine.com";

    const pages = [
      "",
      "about",
      "terms",
      "privacy",
      "contact",
      "blog"
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>

<urlset
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>`;

    pages.forEach((page) => {

      xml += `
<url>

  <loc>${baseUrl}/${page}</loc>

  <changefreq>weekly</changefreq>

  <priority>0.8</priority>

  <image:image>
    <image:loc>${baseUrl}/images/logo.png</image:loc>
    <image:title>Girls With Wine</image:title>
  </image:image>

</url>`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");

    return res.status(200).send(xml);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Page sitemap failed"
    });

  }

};



/* =========================================================
   CITY SITEMAP
========================================================= */
export const generateCitySitemap = async (req, res) => {

  try {

    const baseUrl = "https://girlswithwine.com";

    const cities = await City.find({
      status: "Active"
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>

<urlset
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>`;

    cities.forEach((city) => {

      if (!city?.slug) return;

      xml += `
<url>

  <loc>${baseUrl}/${city.slug}</loc>

  <lastmod>${city.updatedAt?.toISOString?.() || ""}</lastmod>

  <changefreq>daily</changefreq>

  <priority>1.0</priority>

  ${
    city.imageUrl
      ? `
  <image:image>
    <image:loc>${city.imageUrl}</image:loc>
    <image:title>${city.name || ""}</image:title>
  </image:image>`
      : ""
  }

</url>`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");

    return res.status(200).send(xml);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "City sitemap failed"
    });

  }

};



/* =========================================================
   SUBCITY SITEMAP
========================================================= */
export const generateSubCitySitemap = async (req, res) => {

  try {

    const baseUrl = "https://girlswithwine.com";

    // ✅ FIXED STATUS QUERY
    const subCities = await SubCity.find({
      $or: [
        { status: "Active" },
        { status: { $exists: false } }
      ]
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>

<urlset
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>`;

    subCities.forEach((subCity) => {

      if (!subCity?.slug) return;

      xml += `
<url>

  <loc>${baseUrl}/${subCity.slug}</loc>

  <lastmod>${subCity.updatedAt?.toISOString?.() || ""}</lastmod>

  <changefreq>daily</changefreq>

  <priority>0.9</priority>

  ${
    subCity.imageUrl
      ? `
  <image:image>
    <image:loc>${subCity.imageUrl}</image:loc>
    <image:title>${subCity.name || ""}</image:title>
  </image:image>`
      : ""
  }

</url>`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");

    return res.status(200).send(xml);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "SubCity sitemap failed"
    });

  }

};



/* =========================================================
   PROFILE SITEMAP
========================================================= */
export const generateProfileSitemap = async (req, res) => {

  try {

    const baseUrl = "https://girlswithwine.com";

    // ✅ FETCH ACTIVE GIRLS
    const girls = await Girl.find({
      status: "Active"
    });

    // ✅ XML ESCAPE FUNCTION
    const escapeXml = (unsafe = "") => {

      return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    // ✅ XML START
    let xml = `<?xml version="1.0" encoding="UTF-8"?>

<urlset
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>`;

    // ✅ LOOP
    girls.forEach((girl) => {

      try {

        // ❌ SKIP INVALID
        if (!girl?.permalink) return;

        // ✅ SAFE VALUES
        const loc = escapeXml(
          `${baseUrl}/${girl.permalink}`
        );

        const imageUrl = girl?.imageUrl
          ? escapeXml(girl.imageUrl)
          : "";

        const title = escapeXml(
          girl?.name || "Escort Profile"
        );

        const lastmod = girl?.updatedAt
          ? girl.updatedAt.toISOString()
          : new Date().toISOString();

        // ✅ XML
        xml += `
<url>

  <loc>${loc}</loc>

  <lastmod>${lastmod}</lastmod>

  <changefreq>daily</changefreq>

  <priority>0.9</priority>

  ${
    imageUrl
      ? `
  <image:image>
    <image:loc>${imageUrl}</image:loc>
    <image:title>${title}</image:title>
  </image:image>`
      : ""
  }

</url>`;

      } catch (innerError) {

        console.log(
          "❌ GIRL XML ERROR:",
          girl?._id,
          innerError.message
        );

      }

    });

    // ✅ XML END
    xml += `
</urlset>`;

    // ✅ RESPONSE
    res.setHeader("Content-Type", "application/xml");

    return res.status(200).send(xml);

  } catch (error) {

    console.log("❌ PROFILE SITEMAP ERROR:");
    console.log(error);

    return res.status(500).json({
      message: error.message
    });

  }

};



/* =========================================================
   WORDPRESS BLOG SITEMAP
========================================================= */
export const generatePostSitemap = async (req, res) => {

  try {

    const baseUrl = "https://girlswithwine.com";

    // ✅ WORDPRESS FETCH
    const response = await fetch(
      "https://blog.girlswithwine.com/wp-json/wp/v2/posts?_embed&per_page=100"
    );

    const blogs = await response.json();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>

<urlset
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>`;

    blogs.forEach((blog) => {

      const image =
        blog?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";

      xml += `
<url>

  <loc>${baseUrl}/blog/${blog.slug}</loc>

  <lastmod>${new Date(blog.modified).toISOString()}</lastmod>

  <changefreq>weekly</changefreq>

  <priority>0.7</priority>

  ${
    image
      ? `
  <image:image>
    <image:loc>${image}</image:loc>
    <image:title>${blog.title?.rendered || ""}</image:title>
  </image:image>`
      : ""
  }

</url>`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");

    return res.status(200).send(xml);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Post sitemap failed"
    });

  }

};