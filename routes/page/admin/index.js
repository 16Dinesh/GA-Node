const express = require("express");
const router = express.Router();
const passport = require("passport");
const adminController = require("../../../controllers/page/admin/index");
const validAdminKey = process.env.LOGIN_KEY

// Admin login
router
  .route("/")
  .get(adminController.renderAdminLoginForm)
  .post(
    (req, res, next) => {
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          console.log("Error during authentication:", err);
          return res.redirect("/"); // Redirect on error
        }
        if (!user) {
          console.log("Authentication failed:", info.message); // Log the failure message
          return res.redirect("/"); // Redirect if authentication fails
        }

        if(req.body.adminKey !== validAdminKey ) {
            console.log("Error in the Key")
            return res.redirect("/")
        }

        req.logIn(user, (err) => {
          if (err) {
            console.log("Error during login:", err);
            return res.redirect("/"); // Redirect on login error
          }
          console.log('Welcome back, Admin!'); // Log success message
          return res.redirect("/dashboard"); // Redirect on success
        });
      })(req, res, next); // Call the passport authenticate function
    }
  );

// Admin signup
router
  .route("/register")
  .get(adminController.renderAdminSignupForm)
  .post(adminController.adminSignup);

// Admin logout
router.get("/logout", adminController.adminLogout);

module.exports = router;
