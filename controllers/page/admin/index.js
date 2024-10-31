const User = require("../../../models/page/SuperUser");
const validKey = process.env.ADMIN_KEY;

module.exports.renderAdminLoginForm = (req, res) => {
  res.render("admin/login");
};

module.exports.renderAdminSignupForm = (req, res) => {
  res.render("admin/signup");
};

module.exports.adminSignup = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, adminKey } = req.body;
    console.log("Username:", username);
    console.log("email", email);
    console.log("password", password);
    // Check the admin key
    if (adminKey !== validKey) {
      console.log("Invalid admin key.");
      return res.redirect("/register");
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      console.log("Passwords do not match. Please re-enter.");
      return res.redirect("/register");
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      console.log("User with this username or email already exists.");
      return res.redirect("/register");
    }

    const newAdmin = new User({ username, email, iSAdmin: true });
    const registeredAdmin = await User.register(newAdmin, password);

    req.login(registeredAdmin, (err) => {
      if (err) {
        console.log("Error during login after registration:", err);
        return res.redirect("/register");
      }
      console.log(`Admin account created and logged in!`);
      res.redirect("/dashboard");
    });
  } catch (err) {
    console.log("Error during registration:", err);
    res.redirect("/register");
  }
};

module.exports.adminLogout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.log("Error during logout:", err);
      return next(err);
    }
    console.log("You have logged out successfully.");
    res.redirect("/");
  });
};
