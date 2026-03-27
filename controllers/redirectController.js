import City from "../models/City.js";

export const redirectToCanonical = async (req, res) => {
  try {
    const { city } = req.params;

    const data = await City.findOne({
      mainCity: city.toLowerCase(),
    });

    if (!data || !data.slug) {
      return res.redirect(301, "/");
    }

    return res.redirect(301, `/${data.slug}`);
  } catch (err) {
    return res.redirect(301, "/");
  }
};
