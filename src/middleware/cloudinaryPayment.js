const DatauriParser = require("datauri/parser");
const path = require("path");
const cloudinary = require("../config/cloudinary");

const uploader = async (req, res, next) => {
    const { file,userPayload } = req;
    if (!file) return next();

    const parser = new DatauriParser();
    const buffer = file.buffer;
    const ext = path.extname(file.originalname).toString();
    const datauri = parser.format(ext, buffer);
    const fileName = `payment:${Math.floor(Math.random() * 10e9)},${userPayload.user_id}`;
    const cloudinaryOpt = {
        public_id: fileName,
        folder: "E-field",
    };

    try {
        const result = await cloudinary.uploader.upload(
            datauri.content,
            cloudinaryOpt
        );
        req.body.image_payment = result.secure_url;
        next();
    } catch (err) {
        console.log(err);
        res.status(err).json({ msg: "Internal Server Error" });
    }
};

module.exports = uploader;