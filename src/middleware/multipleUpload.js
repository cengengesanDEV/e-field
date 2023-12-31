const multer = require("multer");
const path = require("path");

const memory = multer.memoryStorage();
const multerOption = {
  memory,
  // fileFilter: (req, file, cb) => {
  //   const ext = path.extname(file.originalname);
  //   const allowedExt = /png|jpg|jpeg/;
  //   if (!allowedExt.test(ext)) return cb(new Error("invalid Data Type"), false);
  //   cb(null, true);
  // },
};

const upload = multer(multerOption).fields([{name: 'image_cover', maxCount: 1},{ name: 'images' }])
const multerHandler = (req, res, next) => {
  upload(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      console.log(error)
      return res.status(400).json({
        status: 400,
        msg: "File too large, image must be 2MB or lower",
      });
    } else if (error) {
      console.log(error);
      return res.status(415).json({ status: 415, msg: error.message });
    }
    next();
  });
};

module.exports = multerHandler;
