require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminUser = require("../../models/Web/auth/AdminUser");
const LoginUser = require("../../models/Web/auth/loginUser")
const { OAuth2Client } = require("google-auth-library");
const validKey = process.env.REGISTER_WEB_KEY;

//GOOGLE OATH

const CLIENT_SECRET_KEY = process.env.CLIENT_SECRET_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const oAuth2Client = new OAuth2Client(GOOGLE_CLIENT_ID);


//register
const registerUser = async (req, res) => {
  const { userName, email, password, Register_Key } = req.body;

  console.log(`Admin Try with --> ${Register_Key}`);
  try {
    if (validKey !== Register_Key) {
      return res.json({
        success: false,
        message: "Admin Key is Invalid Contact With Administration",
      });
    }

    const checkUser = await AdminUser.findOne({ email });
    if (checkUser)
      return res.json({
        success: false,
        message: "User Already exists with the same email! Please try again",
      });

    const salt = await bcrypt.genSalt(12);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = new AdminUser({
      userName,
      email,
      password: hashPassword,
      role: "admin",
    });

    await newUser.save();
    res.status(200).json({
      success: true,
      message: "Registration successful",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later.",
    });
  }
};

//login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await AdminUser.findOne({ email });
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false }).json({
      success: true,
      message: "Logged in successfully",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later.",
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const token = req.body.token;

    // token id
    // console.log("Received token:", token);

    // Verify the Google ID token
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const googleData = ticket.getPayload();

    //Decoded Google data
    // console.log("Decoded Google data:", googleData);
    let user = await LoginUser.findOne({ email: googleData.email });

    if (!user) {
      user = new LoginUser({
        userName: googleData.name,
        email: googleData.email,
        googleVerified: true,
        photoURL: googleData.picture,
        role:"user"
      });
      await user.save();
    }

    const tokenJWT = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        userName: user.userName,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res.cookie("token", tokenJWT, { httpOnly: true, secure: false }).json({
      success: true,
      message: "Logged in successfully",
      user: {
        email: user.email,
        role: user.role,
        id: user._id,
        userName: user.userName,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Google login failed" });
  }
};

//logout
const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

//auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "unAuthorized user!",
    });

  try {
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorized user!",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  googleLogin,
  authMiddleware,
};
