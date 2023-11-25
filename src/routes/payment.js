const PaymentRouter = require('express').Router();
const isLogin = require("../middleware/isLogin.js")
const validate = require("../middleware/validate");
const multer = require("multer");
const cloudinary = require("../middleware/cloudinaryPayment.js")
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
    postPayment,
    getBookingCustomer,
    getBookingOwner,
    patchStatusBooking,
    patchBookingTimeAndDate
  } = require("../controller/payment.js");

PaymentRouter.post('/',isLogin(),uploadFile,cloudinary,postPayment);
PaymentRouter.get('/customer/history/:status',isLogin(),getBookingCustomer)
PaymentRouter.get('/owner/history',isLogin(),getBookingOwner)
PaymentRouter.patch('/owner/status/:id',isLogin(),patchStatusBooking)
PaymentRouter.patch('/owner/booking/:id',isLogin(),patchBookingTimeAndDate)



module.exports = PaymentRouter;