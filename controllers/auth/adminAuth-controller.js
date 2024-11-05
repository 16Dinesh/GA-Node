require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const LoginUser = require("../../models/Web/auth/loginUser");
const AdminUser = require("../../models/Web/auth/AdminUser");
const validKey = process.env.REGISTER_WEB_KEY;

// Google OAuth client setup
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_SECRET_KEY = process.env.CLIENT_SECRET_KEY;
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

//google
const googleLogin = async (req, res) => {
  try {
    const tokenGoogle = req.body.token;

    // Verify Google token
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokenGoogle,
      audience: GOOGLE_CLIENT_ID,
    });
    const googleData = ticket.getPayload();

    let user = await LoginUser.findOne({ email: googleData.email });

    // Create a new user if one does not already exist
    if (!user) {
      user = new LoginUser({
        userName: googleData.name,
        email: googleData.email,
        googleVerified: true,
        photoURL: googleData.picture,
        role: "user",
      });
      await user.save();  
    } else {
      // Update user data if necessary
      user = await LoginUser.findOneAndUpdate(
        { email: googleData.email },
        {
          userName: googleData.name,
          photoURL: googleData.picture,
          googleVerified: true,
        },
        { new: true }
      );
    }

    // Generate JWT
    const accessToken  = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        userName: user.userName,
        googleVerified: user.googleVerified,
      },
      "GOOGLE_SECRET_KEY",
      { expiresIn: "60m" }
    );

    // const refreshToken = jwt.sign(
    //   { id: user._id }, // You can include more info if necessary
    //   process.env.REFRESH_TOKEN_SECRET, // Use environment variable
    //   { expiresIn: "3d" } // Set refresh token expiration
    // );

    // Set token in an HTTP-only cookie

    // res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false });
    res.cookie("token", accessToken, { httpOnly: true, secure: false })

    res.json({
      success: true,
      message: "Google Logged in successfully",
      user: {
          email: user.email,
          role: user.role,
          id: user._id,
          userName: user.userName,
          googleVerified: user.googleVerified,
        },
      });
  } catch (e) {
    console.error("Google login failed:", e);
    res.status(500).json({
      success: false,
      message: "Google login failed",
    });
  }
};

//register-user

//login-user



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
      message: "Unauthorized user!",
    });

  try {
    // console.log('Token:', token);
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
  googleLogin,
  logoutUser,
  authMiddleware,
};
