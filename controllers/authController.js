

const { promisify } = require('util');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');


const register = catchAsync(async (req, res, next) => {
  const { email, name, password, confirmPassword } = req.body;

  // Validate the request body
  if (!email || !name || !password || !confirmPassword) {
    throw new AppError('All fields (email, name, password, confirmPassword) are required!', 400);
  }

  // Additional validation for password confirmation
  if (password !== confirmPassword) {
    throw new AppError('Passwords do not match!', 400);
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email is already registered!', 400);
  }

  const user = await User.create({ email, name, password, confirmPassword });

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

const login = (async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and Password are required!', 400);
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePasswords(password, user.password))) {
    throw new AppError('Email or password mismatch', 400);
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "30d",
  });

  res.status(200).json({
    message: 'success',
    data: {
      info: { email: user.email, name: user.name, _id: user._id },
      token,
    },
  });
});

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Please login to access this route', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError('User does not exist!', 401));
  }

  req.user = user;
  next();
};

module.exports = {register, login, protect};






