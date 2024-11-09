const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  googleLogin,
  authMiddleware,
  userRegister,
  userLogin,
  userGoogleFireBase,
  anonymousFireBase,
  phoneNumberFirebase,
} = require("../../controllers/auth/adminAuth-controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.post("/google-firebase", userGoogleFireBase);
router.post("/anonymous", anonymousFireBase);
router.post("/register-user", userRegister);
router.post("/login-user", userLogin);
router.post("/number-login", phoneNumberFirebase);
router.post("/logout", logoutUser);
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  console.log(user);
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    user,
  });
});

module.exports = router;
