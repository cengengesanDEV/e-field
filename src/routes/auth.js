const authRouter = require('express').Router();
const isLogin = require("../middleware/isLogin.js")
const validate = require("../middleware/validate");


const { login, logout } = require("../controller/auth.js")


// Login
authRouter.post("/", validate.body('email','passwords'),login);
// Logout
authRouter.delete("/", isLogin(), logout);


module.exports = authRouter;