const express = require("express");

const authRouter = require("./auth.js");
const userRouter = require("./users");
const fieldRouter = require("./field");
const paymentRouter = require("./payment.js")

const mainRouter = express.Router();

const prefix = "/api";

mainRouter.use(`${prefix}/auth`, authRouter);
mainRouter.use(`${prefix}/users`, userRouter);
mainRouter.use(`${prefix}/field`, fieldRouter);
mainRouter.use(`${prefix}/payment`, paymentRouter);

mainRouter.get("/", (req, res) => {
  res.json({
    msg: "Berjalan dengan baik",
  });
});

//export
module.exports = mainRouter;
