require("dotenv").config({ path: "./.env" });
const express = require("express");
const flash = require("connect-flash");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const ejsMate = require("ejs-mate");
const path = require("path");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const SuperUser = require("./models/page/SuperUser");
const helmet = require("helmet");
const ExpressError = require("./utils/ExpressError.js");

// Server-Routes
const adminRouter = require("./routes/page/admin/index");
const mainPageRoutes = require("./routes/page/items/Index");

// Admin-API-Routes
const adminAuthRouter = require("./routes/auth/adminAuth-routes");

// View setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use(express.static(path.join(__dirname, "/public")));
app.use(flash());

// Database
const db_url = process.env.DB_URL;
const Key = process.env.SESSION_SCRECT;

mongoose
  .connect(db_url)
  .then(() => console.log("Connected to the DataBase"))
  .catch((error) => console.log(`Not! connected to the DataBase: ${error}`));

// Session Store
const store = MongoStore.create({
  mongoUrl: db_url,
  crypto: { secret: Key },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in Mongo Session Store", err);
});

// Session middleware
const sessionOptions = {
  store,
  secret: Key,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60, // 1 hour
    maxAge: 1000 * 60 * 60, // 1 hour
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // set to true in production
  },
};

app.use(session(sessionOptions));
app.use(cookieParser());
app.use(express.json());
app.use(helmet()); // Adding security headers

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_BASE_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(SuperUser.authenticate()));

passport.serializeUser(SuperUser.serializeUser());
passport.deserializeUser(SuperUser.deserializeUser());

// Flash messages
app.use((req, res, next) => {
  res.locals.done = req.flash("done");
  res.locals.error = req.flash("error");
  // res.locals.localuser = req.user || null;
  next();
});

// Routes
app.use("/", adminRouter);
app.use("/", mainPageRoutes);

//api routes
app.use("/api/user", adminAuthRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not Found?"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "SomeThing Went Wrong!" } = err;
  res.status(statusCode).render("error/index", { err });
  // res.status(statusCode).send(message);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
