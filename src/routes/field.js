const express = require("express");
const fieldRouter = express.Router();
const isLogin = require("../middleware/isLogin.js");
const allowedRole = require("../middleware/allowedRole.js");

const cloudinaryField = require("../middleware/cloudinarySingleField.js");
const uploadMultiple = require("../middleware/multipleUpload")
const multipleCloudinary = require('../middleware/multipleCloudinary')

const {
    postField,
    patchDetail,
    getAllField,
    getDetailField,
    getFieldByUserId,
    getFieldImages
  } = require("../controller/field");

  fieldRouter.post('/',isLogin(),allowedRole("owner"),uploadMultiple,multipleCloudinary,cloudinaryField,postField);
  fieldRouter.patch('/:id',isLogin(),allowedRole("owner"),uploadMultiple,multipleCloudinary,cloudinaryField,patchDetail);
  fieldRouter.get('/',getAllField)
  fieldRouter.get("/detail/:id/:date",getDetailField)
  fieldRouter.get("/detail/owner",isLogin(),getFieldByUserId)
  fieldRouter.get("/images/:id",getFieldImages)

  module.exports = fieldRouter;