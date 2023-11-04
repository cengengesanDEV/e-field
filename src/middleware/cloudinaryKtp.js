const DatauriParser = require("datauri/parser");
const path = require("path");
const cloudinary = require("../config/cloudinary");

const uploader = async (req, res, next) => {
    const { file,userPayload } = req;
    if (!file) return next();
    console.log({req})

    const parser = new DatauriParser();
    const buffer = file.buffer;
    const ext = path.extname(file.originalname).toString();
    const datauri = parser.format(ext, buffer);
    const fileName = `users:${userPayload.user_id}-KTP`;
    const cloudinaryOpt = {
        public_id: fileName,
        folder: "E-Kontrakan",
    };

    try {
        const result = await cloudinary.uploader.upload(
            datauri.content,
            cloudinaryOpt
        );
        req.file = result;
        next();
    } catch (err) {
        console.log(err);
        res.status(err).json({ msg: "Internal Server Error" });
    }
};

module.exports = uploader;