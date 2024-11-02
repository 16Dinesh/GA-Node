const express = require("express");
const { googleLogin } = require("../../controllers/auth/userAuth-controller");

const router = express.Router();

router.post("/google", googleLogin);


module.exports = router;