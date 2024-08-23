const ObjectId = require("mongoose").Types.ObjectId;
const Category = require("../models/category");

exports.getCategories = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const categories = await Category.find({
      estoreid: new ObjectId(estoreid),
    }).exec();

    res.json(categories);
  } catch (error) {
    res.json({ err: "Fetching categories fails. " + error.message });
  }
};
