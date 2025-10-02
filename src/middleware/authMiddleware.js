function ensureAuth(req, res, next) {
  if (!req.session.userId) return res.redirect("/auth/login");
  next();
}
function ensureGuest(req, res, next) {
  if (!req.session || !req.session.user) {
    console.log("guest");
    next();
  } else {
    res.redirect("/");
  }
}

function ensureAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.userRole === "admin") {
    next();
  } else {
    res.redirect("/");
  }
}
module.exports = {
  ensureAuth,
  ensureGuest,
  ensureAdmin,
};
