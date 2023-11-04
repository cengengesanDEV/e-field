const express = require("express");
const kontrakanRouter = express.Router();
const validate = require("../middleware/validate");
const isLogin = require("../middleware/isLogin.js");
const allowedRole = require("../middleware/allowedRole.js");

const cloudinaryCategory = require("../middleware/cloudinaryCategory");
const uploadMultiple = require("../middleware/multipleUpload")
const multipleCloudinary = require('../middleware/multipleCloudinary')
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
  getAllCategory,
  getCategoryById,
  getDetailById,
  postCategory,
  postDetail,
  getKontrakanDetails,
  getDetailUsersById,
  getCategoryId,
  patchcategory,
  patchDetail,
  deleteCategory,
  deleteDetail
} = require("../controller/kontrakan");

kontrakanRouter.get("/", getAllCategory);
kontrakanRouter.get("/category/:id", getCategoryById);
kontrakanRouter.get("/detail/:id", getDetailById);
kontrakanRouter.post("/category",isLogin(),allowedRole("owner"),uploadFile,cloudinaryCategory,postCategory);
kontrakanRouter.post('/detail',isLogin(),allowedRole("owner"),uploadMultiple,multipleCloudinary,postDetail);
kontrakanRouter.get("/kontrakan/:id", getKontrakanDetails);
kontrakanRouter.get('/kontrakan/category/:id', getCategoryId);
kontrakanRouter.patch('/category/:id', isLogin(),allowedRole("owner"),uploadFile,cloudinaryCategory,patchcategory);
kontrakanRouter.patch('/delete/category/:id',deleteCategory )
kontrakanRouter.patch('/delete/detail/:id',deleteDetail )
kontrakanRouter.patch('/detail/:id',isLogin(),allowedRole("owner"),uploadMultiple,multipleCloudinary,patchDetail)
kontrakanRouter.get('/admin/detail/:id',getDetailUsersById)

module.exports = kontrakanRouter;
