const adminRouter = require("express").Router();
const isLogin = require("../middleware/isLogin.js");
const validate = require("../middleware/validate");

const {
  suspendUser,
  unsuspendUser,
  getDetailOwnerField,
  getOwnerField,
  getUser,
} = require("../controller/admin.js");

// Login
adminRouter.post("/suspend/:id", suspendUser);
adminRouter.delete("/unsuspend/:id", unsuspendUser);
adminRouter.get("/field/:id", getOwnerField);
adminRouter.get("/detail/:id", getDetailOwnerField);
adminRouter.get("/user/:role", getUser);

module.exports = adminRouter;
