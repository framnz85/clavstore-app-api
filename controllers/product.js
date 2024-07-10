const ObjectId = require("mongoose").Types.ObjectId;

const Product = require("../models/product");

exports.getProducts = async (req, res) => {
  const estoreid = req.headers.estoreid;

  try {
    const products = await Product.find({
      estoreid: new ObjectId(estoreid),
    }).exec();

    res.json(products);
  } catch (error) {
    res.json({ err: "Getting all products failed." + error.message });
  }
};
exports.updateProduct = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const prodid = req.body.prodid;
  const count = req.body.quantity;
  let product = {};

  try {
    product = await Product.findOneAndUpdate(
      {
        _id: new ObjectId(prodid),
        estoreid: new ObjectId(estoreid),
      },
      { $inc: { quantity: -count, sold: count } },
      { new: true }
    );

    if (product.quantity <= 0) {
      const newQuantity =
        product && product.waiting && product.waiting.newQuantity
          ? product.waiting.newQuantity
          : 0;

      const newSupplierPrice =
        product && product.waiting && product.waiting.newSupplierPrice
          ? product.waiting.newSupplierPrice
          : product.supplierPrice;

      const newPrice =
        newSupplierPrice + (newSupplierPrice * product.markup) / 100;

      product = await Product.findOneAndUpdate(
        {
          _id: new ObjectId(prodid),
          estoreid: Object(estoreid),
        },
        {
          quantity: newQuantity,
          supplierPrice: newSupplierPrice,
          price: newPrice,
          waiting: {},
        },
        { new: true }
      );
    }

    res.json(product);
  } catch (error) {
    res.json({ err: "Updating a product details failed." + error.message });
  }
};
