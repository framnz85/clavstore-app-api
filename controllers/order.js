const ObjectId = require("mongoose").Types.ObjectId;

const Order = require("../models/order");
const User = require("../models/user");
const Estore = require("../models/estore");
const Product = require("../models/product");

exports.getPosOrders = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.user.email;
  let orders = [];

  try {
    const user = await User.findOne({ email }).exec();
    if (user.role === "cashier") {
      orders = await Order.find({
        estoreid: new ObjectId(estoreid),
        orderType: "pos",
        createdBy: user._id,
      }).exec();
    } else {
      orders = await Order.find({
        estoreid: new ObjectId(estoreid),
        orderType: "pos",
      }).exec();
    }

    res.json(orders);
  } catch (error) {
    res.json({ err: "Getting all orders failed." + error.message });
  }
};

exports.saveOrder = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.user.email;

  const cartTotal = req.body.cartTotal;
  const discount = req.body.discount;
  const addDiscount = req.body.addDiscount;
  const cash = req.body.cash;
  const products = req.body.products;

  const orderedBy = req.body.orderedBy;
  const customerName = req.body.customerName;
  const customerPhone = req.body.customerPhone;
  const customerEmail = req.body.customerEmail;
  const orderNotes = req.body.orderNotes;

  try {
    let user = await User.findOne({ email }).exec();
    let checkUser = {};

    if (customerName) {
      if (customerPhone) {
        checkUser = await User.findOne({
          phone: customerPhone,
          estoreid: new ObjectId(estoreid),
        });
      }
      if (customerEmail) {
        checkUser = await User.findOne({
          email: customerEmail,
          estoreid: new ObjectId(estoreid),
        });
      }
      if (orderedBy) {
        checkUser = await User.findOne({
          _id: new ObjectId(orderedBy),
          estoreid: new ObjectId(estoreid),
        });
      }
      if (!checkUser && (customerPhone || customerEmail)) {
        const newUser = new User({
          name: customerName,
          phone: customerPhone ? customerPhone : "09100000001",
          email: customerEmail ? customerEmail : "abc@xyz.com",
          password: md5("Grocery@2000"),
          showPass: "Grocery@2000",
          role: "customer",
          estoreid: new ObjectId(estoreid),
        });
        checkUser = await newUser.save();
      }
    }

    const newOrder = new Order({
      orderType: "pos",
      orderStatus: "Completed",
      cartTotal,
      discount,
      addDiscount,
      cash,
      createdBy: user._id,
      orderedBy: checkUser && checkUser._id ? checkUser._id : user._id,
      orderedName: customerName || user.name,
      estoreid: new ObjectId(estoreid),
      orderNotes,
      products,
    });

    const order = await newOrder.save();

    if (order) {
      let newProducts = [];
      const orderProducts = order.products;

      await Order.findByIdAndUpdate(order._id, {
        orderCode: order._id.toString().slice(-12),
      }).exec();

      const estore = await Estore.findByIdAndUpdate(estoreid, {
        orderChange: new Date().valueOf(),
        productChange: new Date().valueOf(),
      }).exec();

      for (i = 0; i < orderProducts.length; i++) {
        const result = await Product.findOneAndUpdate(
          {
            _id: new ObjectId(orderProducts[i].product),
            estoreid: Object(estoreid),
          },
          {
            $inc: {
              quantity: -orderProducts[i].count,
              sold: orderProducts[i].count,
            },
          },
          { new: true }
        );
        if (result && result._id) {
          newProducts.push(result);
        }
        if (result && result.quantity <= 0) {
          const newQuantity =
            result && result.waiting && result.waiting.newQuantity
              ? result.waiting.newQuantity
              : 0;

          const newSupplierPrice =
            result && result.waiting && result.waiting.newSupplierPrice
              ? result.waiting.newSupplierPrice
              : result.supplierPrice;

          const newPrice =
            newSupplierPrice + (newSupplierPrice * result.markup) / 100;

          await Product.findOneAndUpdate(
            {
              _id: new ObjectId(orderProducts[i].product),
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

          const date1 = new Date(estore.raffleDate);
          const date2 = new Date();
          const timeDifference = date1.getTime() - date2.getTime();
          const daysDifference = Math.round(
            timeDifference / (1000 * 3600 * 24)
          );

          if (
            user.role === "customer" &&
            estore.raffleActivation &&
            daysDifference > 0
          ) {
            createRaffle(
              estoreid,
              user._id,
              order._id,
              estore.raffleDate,
              estore.raffleEntryAmount,
              order.cartTotal
            );
          }
        }
      }

      res.json({ order, newProducts });
    } else {
      res.json({ err: "Cannot save the order." });
    }
  } catch (error) {
    res.json({ err: "Saving cart to order fails. " + error.message });
  }
};

exports.sendOrder = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const email = req.user.email;

  const cartTotal = req.body.cartTotal;
  const discount = req.body.discount;
  const addDiscount = req.body.addDiscount;
  const cash = req.body.cash;
  const products = req.body.products;

  const orderedBy = req.body.orderedBy;
  const customerName = req.body.customerName;
  const customerPhone = req.body.customerPhone;
  const customerEmail = req.body.customerEmail;
  const orderNotes = req.body.orderNotes;

  try {
    let user = await User.findOne({ email }).exec();
    let checkUser = {};

    if (customerName) {
      if (customerPhone) {
        checkUser = await User.findOne({
          phone: customerPhone,
          estoreid: new ObjectId(estoreid),
        });
      }
      if (customerEmail) {
        checkUser = await User.findOne({
          email: customerEmail,
          estoreid: new ObjectId(estoreid),
        });
      }
      if (orderedBy) {
        checkUser = await User.findOne({
          _id: new ObjectId(orderedBy),
          estoreid: new ObjectId(estoreid),
        });
      }
      if (!checkUser && (customerPhone || customerEmail)) {
        const newUser = new User({
          name: customerName,
          phone: customerPhone ? customerPhone : "09100000001",
          email: customerEmail ? customerEmail : "abc@xyz.com",
          password: md5("Grocery@2000"),
          showPass: "Grocery@2000",
          role: "customer",
          estoreid: new ObjectId(estoreid),
        });
        checkUser = await newUser.save();
      }
    }

    const newOrder = new Order({
      orderType: "pos",
      orderStatus: "Completed",
      cartTotal,
      discount,
      addDiscount,
      cash,
      createdBy: user._id,
      orderedBy: checkUser && checkUser._id ? checkUser._id : user._id,
      orderedName: customerName || user.name,
      estoreid: new ObjectId(estoreid),
      orderNotes,
      products,
    });

    const order = await newOrder.save();

    if (order) {
      await Order.findByIdAndUpdate(order._id, {
        orderCode: order._id.toString().slice(-12),
      }).exec();

      await Estore.findByIdAndUpdate(estoreid, {
        orderChange: new Date().valueOf(),
        productChange: new Date().valueOf(),
      }).exec();

      res.json(order);
    }
  } catch (error) {
    res.json({ err: "Saving cart to order fails. " + error.message });
  }
};
