import City from "../models/City.js";
import Girl from "../models/Girl.js";
import SubCity from "../models/SubCity.js";

/* =========================================================
   XML ESCAPE
========================================================= */
const escapeXml = (unsafe = "") => {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

/* =========================================================
   IMAGE URL FIX
========================================================= */
const getImageUrl = (url = "") => {

  if (!url) return "";

  if (url.startsWith("http")) {
    return url;
  }

  return `https://girlswithwine.com${url}`;
};

/* =========================================================
   CACHE HEADER
========================================================= */
const setCacheHeaders = (res) => {

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate"
  );

};

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

    setCacheHeaders(res);

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

  <loc>${escapeXml(`${baseUrl}/${page}`)}</loc>

  <lastmod>${new Date().toISOString()}</lastmod>

  <image:image>
    <image:loc>${baseUrl}/images/logo.png</image:loc>
    <image:title>Girls With Wine</image:title>
  </image:image>

</url>`;

    });

    xml += `
</urlset>`;

    res.header("Content-Type", "application/xml");

    setCacheHeaders(res);

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

      if (
        !city?.slug ||
        city.slug.includes("undefined") ||
        city.slug.includes("null")
      ) {
        return;
      }

      const imageUrl = getImageUrl(city.imageUrl);

      xml += `
<url>

  <loc>${escapeXml(`${baseUrl}/${city.slug}`)}</loc>

  <lastmod>${city.updatedAt?.toISOString?.() || ""}</lastmod>

  ${
    imageUrl
      ? `
  <image:image>
    <image:loc>${escapeXml(imageUrl)}</image:loc>
    <image:title>${escapeXml(city.name || "")}</image:title>
  </image:image>`
      : ""
  }

</url>`;

    });

    xml += `
</urlset>`;

    res.header("Content-Type", "application/xml");

    setCacheHeaders(res);

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

      if (
        !subCity?.slug ||
        subCity.slug.includes("undefined") ||
        subCity.slug.includes("null")
      ) {
        return;
      }

      const imageUrl = getImageUrl(subCity.imageUrl);

      xml += `
<url>

  <loc>${escapeXml(`${baseUrl}/${subCity.slug}`)}</loc>

  <lastmod>${subCity.updatedAt?.toISOString?.() || ""}</lastmod>

  ${
    imageUrl
      ? `
  <image:image>
    <image:loc>${escapeXml(imageUrl)}</image:loc>
    <image:title>${escapeXml(subCity.name || "")}</image:title>
  </image:image>`
      : ""
  }

</url>`;

    });

    xml += `
</urlset>`;

    res.header("Content-Type", "application/xml");

    setCacheHeaders(res);

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

    const girls = await Girl.find({
      status: "Active"
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>

<urlset
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>`;

    girls.forEach((girl) => {

      try {

        if (
          !girl?.permalink ||
          girl.permalink.includes("undefined") ||
          girl.permalink.includes("null")
        ) {
          return;
        }

        const loc = escapeXml(
          `${baseUrl}/${girl.permalink}`
        );

        const imageUrl = getImageUrl(girl?.imageUrl);

        const title = escapeXml(
          girl?.name || "Escort Profile"
        );

        const lastmod = girl?.updatedAt
          ? girl.updatedAt.toISOString()
          : "";

        xml += `
<url>

  <loc>${loc}</loc>

  <lastmod>${lastmod}</lastmod>

  ${
    imageUrl
      ? `
  <image:image>
    <image:loc>${escapeXml(imageUrl)}</image:loc>
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

    xml += `
</urlset>`;

    res.setHeader("Content-Type", "application/xml");

    setCacheHeaders(res);

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

    const response = await fetch(
      "https://blog.girlswithwine.com/wp-json/wp/v2/posts?_embed&per_page=100"
    );

    const blogs = await response.json();

    if (!Array.isArray(blogs)) {

      throw new Error("Invalid blog response");

    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>

<urlset
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>`;

    blogs.forEach((blog) => {

      if (
        !blog?.slug ||
        blog.slug.includes("undefined") ||
        blog.slug.includes("null")
      ) {
        return;
      }

      const image =
        blog?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";

      xml += `
<url>

  <loc>${escapeXml(`${baseUrl}/blog/${blog.slug}`)}</loc>

  <lastmod>${new Date(blog.modified).toISOString()}</lastmod>

  ${
    image
      ? `
  <image:image>
    <image:loc>${escapeXml(image)}</image:loc>
    <image:title>${escapeXml(blog.title?.rendered || "")}</image:title>
  </image:image>`
      : ""
  }

</url>`;

    });

    xml += `
</urlset>`;

    res.header("Content-Type", "application/xml");

    setCacheHeaders(res);

    return res.status(200).send(xml);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Post sitemap failed"
    });

  }

};