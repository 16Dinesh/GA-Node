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

// User-Logins- Controllers
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

    if (!user) {
      const userData = {
          userName: googleData.name,
          email: googleData.email,
          googleVerified: true,
          photoURL: googleData.picture,
          role: "user",
      };
  
      // Only set `mobile` if provided
      if (googleData.phone_number) userData.mobile = googleData.phone_number;
  
      user = new LoginUser(userData);
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
      await user.save();
    }

    // if (user) {
    //   res.status(200).json({
    //     success: true,
    //     message: "User registration successful",
    //   });
    // }
    // Generate JWT
    const token = jwt.sign(
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

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
      })
      .json({
        success: true,
        message: "Google login successful",
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
const userRegister = async (req, res) => {
  const { userName, email, password, number } = req.body;

  try {
    let user = await LoginUser.findOneAndUpdate({ email });
    // if (user)
    //   return res.json({
    //     success: false,
    //     message: "User Already exists with the same email! Please try again",
    //   });

    // if (user) {
    //   user.userName = userName;
    //   user.password = password;
    //   user.number = number;
    //   user.role = "user";
    //   await user.save();
    //   return res.status(200).json({
    //     success: true,
    //     message: "User details updated successfully",
    //   });
    // } else {
    //   const newUser = new LoginUser({
    //     userName,
    //     email,
    //     password,  
    //     number,
    //     role: "user",
    //   });

    const newUser = new LoginUser({
      userName : userName,
      email: email ,
      password : password,
      mobile: number,
      firebaseSignup: true,
      role: "user",
    });

    await newUser.save();

    return res.status(200).json({
      success: true,
      message: "User registration successful",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later.",
    });
  }
};

//login-user
const userLogin = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    const checkUser = await LoginUser.findOne({ email });
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });

    const tokenExpiry = rememberMe ? "7d" : "60m";
    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: tokenExpiry }
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

const userGoogleFireBase = async (req, res) => {
  const { name, email, emailVerified, number, photo } = req.body;

  try {
    let user = await LoginUser.findOne({ email });
    if (!user) {
      // Create a new user if one does not already exist
      user = new LoginUser({
        userName: name,
        email: email,
        emailVerified: emailVerified,
        photoURL: photo,
        mobile: number,
        role: "user",
      });
      await user.save();

      return res.status(200).json({
        success: true,
        message: "User registered successfully",
      });
    } else {
      // Update user data if necessary
      user = await LoginUser.findOneAndUpdate(
        { email: email },
        {
          userName: name,
          photoURL: photo,
          mobile: number,
          emailVerified: emailVerified,
        },
        { new: true }
      );
      await user.save();
    }

    const token = jwt.sign(
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

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
      })
      .json({
        success: true,
        message: "Google login successful",
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

const anonymousFireBase = async (req, res) => {
  const { userName, email, isAnonymous } = req.body;

  try {
    let user = await LoginUser.findOne({ email });

    if (!user) {
      // Generate unique userName if necessary
      const anonymousUserName = userName || `Anonymous${Date.now()}`;
      user = new LoginUser({
        userName: anonymousUserName,
        email,
        isAnonymous,
        role: "user",
      });
      await user.save();
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        userName: user.userName,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res
      .cookie("token", token, { httpOnly: true, secure: false })
      .status(200)
      .json({
        success: true,
        message: user.isNew
          ? "User registered successfully"
          : "Logged in successfully",
        user: {
          email: user.email,
          role: user.role,
          id: user._id,
          userName: user.userName,
        },
      });
  } catch (e) {
    console.error("Error in AnonymousFireBase:", e);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later.",
    });
  }
};

//for now -> admin-logout
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
  userRegister,
  anonymousFireBase,
  userLogin,
  userGoogleFireBase,
  logoutUser,
  authMiddleware,
};
