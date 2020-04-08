const { v4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require('../models/user-model');

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Phani Kumar",
    email: "passionatephani@protonmail.com",
    password: "testers",
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, please check your data.", 422))
  }

  const { name, email, password, places } = req.body;

  let existingUser
  try {
    existingUser = await User.findOne({ email: email})
    
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again later.', 500)
    return next(error);
  }

  if(existingUser) {
    const error = new HttpError('User exists already, please login instead.', 422);
    return next(error)
  }


  const createdUser = new User({
    name: name,
    email: email,
    image: 'https://images.pexels.com/photos/2190283/pexels-photo-2190283.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    password: password,
    places: places
  })

  
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again later.', 500)
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);

  if (!identifiedUser || identifiedUser.password !== password) {
    return next( new HttpError(
      "Could not identifiy user, credentials seem to be wrong, ",
      401
    ))
  }

  res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
