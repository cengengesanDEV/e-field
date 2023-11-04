const express = require("express");
const transactionRouter = express.Router();
const validate = require("../middleware/validate");
const isLogin = require("../middleware/isLogin.js");
const allowedRole = require("../middleware/allowedRole.js");

const cloudinaryTransfer = require("../middleware/cloudinaryTransfer");
const multer = require("multer");
const { diskUpload, memoryUpload } = require("../middleware/upload");
function uploadFile(req, res, next) {
  memoryUpload.single("image")(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log(err);
      return res.status(400).json({ msg: err.message });
    } else if (err) {
      return res.json({ msg: err.message });
    }
    next();
  });
}


const {
    postbooking,
    payment,
    getByStatus,
    getHistory,
    getStatuspaid,
    acceptOrder,
    finishOrder,
    deleteCustomer,
    deleteOwner
  } = require("../controller/transaction");

transactionRouter.post('/',isLogin(),allowedRole('customer'),postbooking)
transactionRouter.patch('/payment',isLogin(),allowedRole('customer'),uploadFile,cloudinaryTransfer,payment)
transactionRouter.get('/:status',isLogin(),allowedRole('owner'),getByStatus)
transactionRouter.get('/history/:status',isLogin(),allowedRole('customer'),getHistory)
transactionRouter.get('/paid/:status',isLogin(),allowedRole('owner'),getStatuspaid)
transactionRouter.patch('/acc/:id',isLogin(),allowedRole('owner'),acceptOrder)
transactionRouter.patch('/finish/:id',isLogin(),allowedRole('owner'),finishOrder)
transactionRouter.patch('/delete/customer/:id',isLogin(),allowedRole('customer'),deleteCustomer)
transactionRouter.patch('/delete/owner/:id',isLogin(),allowedRole('owner'),deleteOwner)

module.exports = transactionRouter;