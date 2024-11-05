const express = require("express");
const { googleLogin } = require("../../controllers/auth/userAuth-controller");

const router = express.Router();

router.post("/google", googleLogin);
router.get("/check-auth", authMiddleware, (req, res) => {
    const user = req.user;
    console.log(user)
    res.status(200).json({
      success: true,
      message: "Authenticated user!",
      user,
    });
  });


module.exports = router;