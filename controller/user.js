const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const { generateToken } = require('../config/jwtToken');
const validateMongoDbId = require('../utils/validateMongodbId');
const {generateRefreshToken} = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
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

};