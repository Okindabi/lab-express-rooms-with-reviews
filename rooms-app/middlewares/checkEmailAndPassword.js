function checkEmailAndPassword(req, res, next) {
  let errorMessage = "You need to include an email and a password";
  if (!req.body.email || !req.body.password) {
    return res.render("signup", { errorMessage });
  } else {
    next();
  }
}

module.exports = checkEmailAndPassword;
