export const generateFileName = (
  text
) => {

  if (!text) {

    return `file-${Date.now()}`;
  }

  return text

    // lowercase
    .toLowerCase()

    // trim spaces
    .trim()

    // remove special chars
    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )

    // replace spaces with -
    .replace(/\s+/g, "-")

    // remove multiple -
    .replace(/-+/g, "-")

    // remove starting -
    .replace(/^-+/, "")

    // remove ending -
    .replace(/-+$/, "");
};