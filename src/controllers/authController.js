const bcrypt = require("bcryptjs");

const { User } = require("../../models");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render("auth/register", { error: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: username,
      email: email,
      password: hashedPassword,
    });

    req.session.userId = user.id;
    req.session.userRole = user.role;

if (user.role === "user") {
   res.redirect("/dashboard"); 
} else {
   res.redirect("/");
}



  } catch (error) {
    console.error(error);
    res.render("auth/register", { error: "Erreur serveur" });
  }
  
};

const showLogin = (req, res) =>
  res.render("auth/login", {
    userId: req.session.userId,
    userRole: req.session.userRole,
  });
const showRegister = (req, res) =>
  res.render("auth/register", {
    userId: req.session.userId,
    userRole: req.session.userRole,
  });

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.render("auth/login", { error: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("auth/login", { error: "Invalid credentials" });
    }
    req.session.userId = user.id;
    req.session.userRole = user.role;

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.render("auth/login", { error: "Something went wrong" });
  }
};

function logout(req, res) {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        res.status(500).send("Internal Server Error");
      } else {
        res.redirect("/");
      }
    });
  }
}

module.exports = { showLogin, showRegister, login, register, logout };
