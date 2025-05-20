const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userSchema } = require("../utils/validateSchemas");

const SECRET = process.env.JWT_SECRET;

exports.signup = async (req, res) => {
  const userData = req.body;

  try {
    const validatedData = userSchema.parse(userData);

    const checkUser = await userModel.findOne({ email: validatedData.email });
    if (checkUser) return res.status(409).send("Email already registered");

    const hash = await bcrypt.hash(validatedData.password, 10);
    const newUser = await userModel.create({
      ...validatedData,
      password: hash,
    });

    const token = jwt.sign(
      { email: newUser.email, userId: newUser._id },
      SECRET
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const userObj = newUser.toObject();
    delete userObj.password;
    delete userObj.passwordResetToken;
    delete userObj.passwordResetExpires;

    res.status(201).json({
      message: "Signup successful!",
      user: userObj,
    });
  } catch (err) {
    res.status(400).json({ error: err.errors });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ message: "Invalid email" });

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign({ email: user.email, userId: user._id }, SECRET, {
      expiresIn: req.body.rememberMe ? "7d" : "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: req.body.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000,
    });
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.passwordResetToken;
    delete userObj.passwordResetExpires;

    res.status(200).json({
      message: "Login successful",
      user: userObj,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logout successful" });
};

exports.checkAuth = (req, res) => {
  return res.status(200).json(req.user);
};
