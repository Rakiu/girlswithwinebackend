// --------------------------------------------
// DOMAIN CONFIG
// --------------------------------------------

export const BASE_URL =
  process.env.BASE_URL || "https://girlswithwine.com";


// --------------------------------------------
// SLUGIFY
// --------------------------------------------

export const slugify = (text = "") =>
  text
    .toString()
    .normalize("NFKD")              // unicode normalize
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")           // spaces → dash
    .replace(/[^\w-]+/g, "")        // remove special chars
    .replace(/--+/g, "-");          // remove double dash


// --------------------------------------------
// CANONICAL URL
// --------------------------------------------

export const generateCanonical = (slug = "") => {

  if (!slug) return BASE_URL;

  return `${BASE_URL}/${slug}`;

};


// --------------------------------------------
// CITY SCHEMA (LocalBusiness)
// --------------------------------------------

export const generateCitySchema = (city) => ({

  "@context": "https://schema.org",

  "@type": city.schemaType || "LocalBusiness",

  name:
    city.heading ||
    `VIP Escorts in ${city.mainCity}`,

  description:
    city.subDescription ||
    `Premium escort service available in ${city.mainCity}.`,

  image: city.imageUrl || "",

  url: `${BASE_URL}/${city.slug}`,

  telephone: city.phoneNumber || "",

  areaServed: {
    "@type": "City",
    name: city.mainCity
  },

  address: {
    "@type": "PostalAddress",
    addressLocality: city.mainCity,
    addressCountry: "India"
  }

});


// --------------------------------------------
// BREADCRUMB SCHEMA
// --------------------------------------------

export const generateBreadcrumbSchema = (city) => ({

  "@context": "https://schema.org",

  "@type": "BreadcrumbList",

  itemListElement: [

    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: BASE_URL
    },

    {
      "@type": "ListItem",
      position: 2,
      name: city.mainCity,
      item: `${BASE_URL}/${city.slug}`
    }

  ]

});


// --------------------------------------------
// META TAG HELPER
// --------------------------------------------

export const generateMetaTags = (city) => ({

  title:
    city.seoTitle ||
    `VIP Escorts in ${city.mainCity} | GirlsWithWine`,

  description:
    city.seoDescription ||
    `Find premium escort service in ${city.mainCity}. Beautiful independent escorts available now.`,

  keywords:
    city.seoKeywords ||
    `${city.mainCity} escorts, ${city.mainCity} call girls, escorts in ${city.mainCity}`,

  canonical: `${BASE_URL}/${city.slug}`

});