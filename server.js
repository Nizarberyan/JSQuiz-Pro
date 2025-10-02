const express = require("express");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const { sequelize } = require("./models");

const authRoutes = require("./src/routes/auth");
const quizRoutes = require("./src/routes/quizzes");
const scoreRoutes = require("./src/routes/scores");

const app = express();

const store = new SequelizeStore({
  db: sequelize,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 7 * 24 * 60 * 60 * 1000,
});

store
  .sync()
  .then(() => {
    console.log("Session table (Sessions) has been synced.");
  })
  .catch((err) => {
    console.error("Unable to sync session table:", err);
  });

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "some-dev-secret",
    store: store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  }),
);

app.post("/", (req, res) => {
  res.json({ message: "Welcome to JSQuiz-Pro API" });
});
app.get("/", (req, res) => {
  res.render("index", { userId: req.session.userId });
});
app.use("/auth", authRoutes);
app.use("/quizzes", quizRoutes);
app.use("/scores", scoreRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
