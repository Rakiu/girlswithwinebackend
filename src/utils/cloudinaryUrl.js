export const convertCloudinaryUrl = (
  url
) => {

  if (!url) return "";

  return url.replace(
    "https://res.cloudinary.com/dd8zulgom/image/upload/",
    "https://girlswithwine.com/uploads/"
  );
};