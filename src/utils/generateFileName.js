export const generateFileName = (
  text
) => {

  if (!text) {
    return Date.now().toString();
  }

  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};