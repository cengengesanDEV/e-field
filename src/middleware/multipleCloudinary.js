const cloudinary = require("../config/cloudinary");
const dataUriParser = require("datauri/parser");
const path = require("path");

const uploader = async (req, res, next) => {
  
  const { files } = req;
  console.log({files})
  const fileImages = files.images;
  if (!fileImages) return next();

  req.images = [];
  let count = 0;
  fileImages.forEach(async (e) => {
    const parser = new dataUriParser();
    const buffer = e.buffer;
    const ext = path.extname(e.originalname).toString();
    const datauri = parser.format(ext, buffer);
    const clodunaryOpt = {
      public_id: `${Math.floor(Math.random() * 10e9)}`,
      folder: "E-field",
    };
    try {
      const result = await cloudinary.uploader.upload(
        datauri.content,
        clodunaryOpt
      );
      //   console.log(result.url);
      req.images.push(result.url);
      //   console.log(req.file);
      count += 1;
      if (count === fileImages.length) next();
    } catch (error) {
      console.log(error);
      return res.status(415).json({ status: 415, msg: error.message });
    }
  });
};

module.exports = uploader;
