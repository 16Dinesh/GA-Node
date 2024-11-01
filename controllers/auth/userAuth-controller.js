const { OAuth2Client } = require("google-auth-library");
const LoginUser = require("../../models/Web/auth/loginUser");
const jwt = require("jsonwebtoken");

// GOOGLE OAUTH
const GOOGLE_SECRET_KEY = process.env.CLIENT_SECRET_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID

const oAuth2Client = new OAuth2Client(GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const token = req.body.token;
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const googleData = ticket.getPayload();

    let user = await LoginUser.findOne({ email: googleData.email });

    // Create user if they don’t exist
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

    res
      .cookie("token", tokenJWT, { httpOnly: true, secure: false })
      .json({
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

module.exports = { googleLogin, authMiddleware };
