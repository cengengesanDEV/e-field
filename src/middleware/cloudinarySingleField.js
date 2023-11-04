const DatauriParser = require("datauri/parser");
const path = require("path");
const cloudinary = require("../config/cloudinary");

const uploader = async (req, res, next) => {
    const { files,body } = req;
    if (!files.image_cover) return next();
    const image_cover = files.image_cover[0]

    const parser = new DatauriParser();
    const buffer = image_cover.buffer;
    const ext = path.extname(image_cover.originalname).toString();
    const datauri = parser.format(ext, buffer);
    const fileName = `${body.name}`;
    const cloudinaryOpt = {
        public_id: fileName,
        folder: "E-Field",
    };

    try {
        const result = await cloudinary.uploader.upload(
            datauri.content,
            cloudinaryOpt
        );
        req.body.image_cover = result;
        next();
    } catch (err) {
        console.log(err.message);
        res.status(err).json({ msg: "Internal Server Error" });
    }
};

module.exports = uploader;