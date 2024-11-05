const { OAuth2Client } = require("google-auth-library");
const LoginUser = require("../../models/Web/auth/loginUser");
const jwt = require("jsonwebtoken");

// Google OAuth client setup
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_SECRET_KEY = process.env.CLIENT_SECRET_KEY;

const oAuth2Client = new OAuth2Client(GOOGLE_CLIENT_ID);

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
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        userName: user.userName,
        googleVerified: user.googleVerified,
      },
      GOOGLE_SECRET_KEY,
      { expiresIn: "60m" }
    );

    // Set token in an HTTP-only cookie
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" })
      .json({
        success: true,
        message: "Google Login in successfully",
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

module.exports = { googleLogin };
