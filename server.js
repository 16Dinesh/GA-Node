require("dotenv").config({ path: "./.env" });

const express = require("express");
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

// AdminRoutes
const adminRouter = require("./routes/page/admin/index")
const mainPageRoutes = require("./routes/page/items/Index");

// Api-Routes
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const SuperUser = require("./models/page/SuperUser");

// View
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

//DataBase
const db_url = process.env.DB_URL;
const Key = process.env.SESSION_SCRECT;

mongoose
  .connect(db_url)
  .then(() => console.log("Connected to the DataBase"))
  .catch((error) => console.log(`Not! connected to the DataBase${error}`));

const store = MongoStore.create({
  mongoUrl: db_url,
  crypto: {
    secret: Key,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in Mongo Session Store", err);
});

// Sessions for Login
const sessionOptions = {
  store,
  secret: Key,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
};

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

app.use(session(sessionOptions));
app.use(cookieParser());
app.use(express.json());

// Passport middleware initialization
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(SuperUser.authenticate()));

passport.serializeUser(SuperUser.serializeUser());
passport.deserializeUser(SuperUser.deserializeUser());

//Admin-Services
app.use("/", adminRouter);
app.use("/", mainPageRoutes);

//Api-Services
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));