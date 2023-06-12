const User = require('../models/user');
const Cart = require("../models/cart");
const Coupon = require("../models/coupon");
const Product = require("../models/product");
const Order = require("../models/order");

const asyncHandler = require('express-async-handler');
const { generateToken } = require('../config/jwtToken');
const validateMongoDbId = require('../utils/validateMongodbId');
const {generateRefreshToken} = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const uniqid = require("uniqid");

//create
const createUser = asyncHandler(
    async(req,res) => {
    const email = req.body.email;
    const findUser = await User.findOne({email: email});
    if(!findUser){
        //create a new user
        const newUser = await User.create(req.body);
        res.json(newUser);
    } else {
       throw new Error('User already exists');
    }
});

//login
const loginUser = asyncHandler(
    async(req,res) => {
      const { email, password } = req.body;
      // check if user exists or not
      const findUser = await User.findOne({ email });
      if (findUser && (await findUser.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateuser = await User.findByIdAndUpdate(
          findUser.id,
          {
            refreshToken: refreshToken,
          },
          { new: true }
        );
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
          _id: findUser?._id,
          firstname: findUser?.firstname,
          lastname: findUser?.lastname,
          email: findUser?.email,
          mobile: findUser?.mobile,
          token: generateToken(findUser?._id),
        });
      } else {
        throw new Error("Invalid Credentials");
      }
});

// admin login
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== "admin") throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateuser = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

//logout functional
const logoutUser = asyncHandler(async(req,res) =>{
  const cookie = req.cookies;
  if(!cookie?.refreshToken) throw new Error('no refresh token in cookies');
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({refreshToken});
  if(!user){
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
    });
    res.sendStatus(204);
  };
  await User.findOneAndUpdate({refreshToken}, {refreshToken:''});
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true
  });
  res.sendStatus(204);
});

//handle refresh token
const handleRefreshToken = asyncHandler(async(req,res) => {
  const cookie = req.cookies;
  if(!cookie?.refreshToken) throw new Error('no refresh token in cookies');
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({refreshToken});
  if(!user) throw new Error('no refresh token present in DB or no matches');
  jwt.verify(
    refreshToken,
    process.env.JWT_SECRET,
    (err, decoded) => {
      if (err || user.id !== decoded.id) {
        throw new Error("something wrong with refresh token..");
      }
      const accessToken = generateToken(user?._id);
      res.json({ accessToken });
  });
});

//get all users
const getAllUsers = asyncHandler(async(req,res) => {
    try{
        const getUsers = await User.find();
        res.json(getUsers);
    } catch(error){
        throw new Error(error);
    }
});

//get single user
const getSingleUser = asyncHandler(async(req,res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const getUser = await User.findById(id);
    res.json({
      getUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//delete single user
const deleteSingleUser = asyncHandler(async(req,res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const deleteUser = await User.findByIdAndDelete(id);
      res.json({
        deleteUser,
      });
    } catch (error) {
      throw new Error(error);
    }
});

//update a user
const updateUser = asyncHandler(async(req,res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

//block user
const blockUser = asyncHandler(async(req,res) => {
  const {id} = req.params;
  validateMongoDbId(id);
  try{
    const block = await User.findByIdAndUpdate(id,
      { isBlocked: true },
      { new: true }
    );
  } catch(error){
    throw new Error(error);
  }
  res.json({
    message: 'user blocked'
  })
}); 

//unblock user
const unblockUser = asyncHandler(async(req,res) => {
  const {id} = req.params;
  validateMongoDbId(id);
  try{
    const unblock = await User.findByIdAndUpdate(id,
      { isBlocked: false },
      { new: true }
    );
  } catch(error){
    throw new Error(error);
  }
  res.json({
    message: 'user unblocked'
  })
}); 

//change password
const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

//get user`s wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json(findUser.wishlist);
  } catch (error) {
    throw new Error(error);
  }
});

//add products to cart
const userCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cart } = req.body;

  validateMongoDbId(_id);
  try {
    let products = [];
    const user = await User.findById(_id);

    // Check if the user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: "User is blocked and cannot add items to the cart." });
    }

    // Check if user already has products in cart
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });
    if (alreadyExistCart) {
      alreadyExistCart.remove();
    }

    for (let i = 0; i < cart.length; i++) {
      const product = cart[i];
      const getProduct = await Product.findById(products._id);

      // Check if the product exists and if the requested quantity is available
      if (!getProduct || getProduct.quantity < product.count) {
        return res.status(400).json({ message: "Requested quantity not available for the product." });
      }

      let object = {};
      object.product = getProduct._id;
      object.count = product.count;
      object.color = product.color;
      object.price = getProduct.price;
      products.push(object);
    }

    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }

    let newCart = await new Cart({
      products,
      cartTotal,
      orderby: user?._id,
    }).save();

    res.json(newCart);
  } catch (error) {
    throw new Error(error);
  }
});


//get prod from cart
const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product"
    );
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

//clear the cart
const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndRemove({ orderby: user._id });
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

//apply discount coupon
const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (validCoupon === null) {
    throw new Error("Invalid Coupon");
  }
  const user = await User.findOne({ _id });
  let { cartTotal } = await Cart.findOne({
    orderby: user._id,
  }).populate("products.product");
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderby: user._id },
    { totalAfterDiscount },
    { new: true }
  );
  res.json(totalAfterDiscount);
});

//make an order
const createOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    if (!COD) throw new Error("Create cash order failed");
    const user = await User.findById(_id);
    let userCart = await Cart.findOne({ orderby: user._id });
    let finalAmout = 0;
    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmout = userCart.totalAfterDiscount;
    } else {
      finalAmout = userCart.cartTotal;
    }

    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: "COD",
        amount: finalAmout,
        status: "Cash on Delivery",
        created: Date.now(),
        currency: "usd",
      },
      orderby: user._id,
      orderStatus: "Cash on Delivery",
    }).save();
    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });
    const updated = await Product.bulkWrite(update, {});
    res.json({ message: "success" });
  } catch (error) {
    throw new Error(error);
  }
});

//get info about order
const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const userorders = await Order.findOne({ orderby: _id })
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
});

//get all orders(for admin only)
const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const alluserorders = await Order.aggregate([
      {
        $project: {
          _id: 1,
          orderStatus: 1,
          orderby: 1,
          products: 1,
          createdAt: 1
        }
      }
    ]);

    res.json(alluserorders);
  } catch (error) {
    throw new Error(error);
  }
});

//get user`s order by id(admin only)
const getOrderByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const userorders = await Order.aggregate([
      {
        $match: {
          orderby: mongoose.Types.ObjectId(id)
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productsData"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "orderby",
          foreignField: "_id",
          as: "orderByData"
        }
      }
    ]);

    res.json(userorders[0]);
  } catch (error) {
    throw new Error(error);
  }
});

//update order
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
      },
      { new: true }
    );
    res.json(updateOrderStatus);
  } catch (error) {
    throw new Error(error);
  }
});

//get statistics about orders
const getOrderStatistics = asyncHandler(async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    const mostOrderedProduct = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          product: "$product.title",
          totalOrders: 1,
        },
      },
    ]);

    const ordersByDay = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const ordersByMonth = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalRevenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$paymentIntent.amount" },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
        },
      },
    ]);

    res.json({
      totalOrders,
      mostOrderedProduct,
      ordersByDay,
      ordersByMonth,
      totalRevenue: totalRevenue[0]?.totalRevenue || 0,
    });
  } catch (error) {
    throw new Error(error);
  }
});



module.exports = {
  createUser,
  loginUser, 
  getAllUsers, 
  getSingleUser, 
  deleteSingleUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logoutUser,
  updatePassword,
  loginAdmin,
  getWishlist,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  getAllOrders,
  getOrderByUserId,
  updateOrderStatus,
  getOrderStatistics
};