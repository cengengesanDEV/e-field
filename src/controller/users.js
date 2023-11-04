const userRepo = require("../repo/users");
const sendResponse = require("../helper/sendResponse");
const { forgotMail } = require("../helper/forgotMail");

const register = async (req, res) => {
  try {
    const { body } = req;
    const response = await userRepo.register(body);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    console.log(error)
    sendResponse.error(res, error.status, error);
  }
};

// profil
const profile = async (req, res) => {
  try {
    // push all body lalu if disini mengubah body.image menjadi file.patch
    // if (req.file) {
    //     req.body.image = `${req.file.filename}`;
    // }
    if (req.file) {
      var image = `/${req.file.public_id}.${req.file.format}`; //ubah filename
      req.body.image = req.file.secure_url;
    }

    const response = await userRepo.profile(req.body, req.userPayload.user_id);
    sendResponse.success(res, 200, {
      msg: "Edit Profile Success",
      data: response.rows,
      filename: image,
    });
  } catch (err) {
    console.log(err);
    sendResponse.error(res, 500, "internal server error");
  }
};

const postKtp = async (req, res) => {
  try {
    if (req.file) {
      var image = `/${req.file.public_id}.${req.file.format}`;
    }

    const response = await userRepo.postKtp(req.file.secure_url, req.userPayload.user_id);
    
    sendResponse.success(res, 200, {
      msg: "add ktp success",
      data: response.rows,
      filename: image,
    });

  } catch (err) {
    console.log(err);
    sendResponse.error(res, 500, "internal server error");
  }
};

const deleteProfile = async (req, res) => {
  try {
      const response = await userRepo.deleteUsers(req.params.id,req.body.msg)
      sendResponse.success(res, response.status, response)

  } catch (error) {
      sendResponse.error(res, error.status, error)
  }
}

const getDataById = async (req,res) => {
  try {
    const response = await userRepo.getUsersById(req.userPayload.user_id)
    sendResponse.success(res,response.status,response)
  } catch (error) {
    sendResponse.error(res,error.status,error)
  }
}

const getAllUser = async (req,res) => {
  try {
    const response = await userRepo.getAllUsers(req.query)
    sendResponse.success(res,response.status,response)
  } catch (error) {
    sendResponse.error(res,error.status,error)
  }
}

const unsuspend = async (req,res) => {
  try {
    const response = await userRepo.unsuspendUser(req.params.id)
    sendResponse.success(res,response.status,response)
  } catch (error) {
    sendResponse.error(res,error.status,error)
  }
}

const editPassword = async (req, res) => {
  try {
    const response = await userRepo.editpwd(req.body.newpass, req.body.confirmpass ,req.body.oldpass, req.userPayload.user_id)
    sendResponse.success(res,response.status,response)
  } catch (error) {
    sendResponse.error(res,error.status,error)
  }
}

const forgotPassword = async (req, res) => {
  try {
    const response = await userRepo.forgotPassword(req.params.email);
    const setSendEmail = {
      to: req.params.email,
      subject: " Reset Pasword",
      mail:req.params.email,
      template: "forgotEmail.html",
      otp: `${response.data}`,
    };
    await forgotMail(setSendEmail);
    sendResponse.success(res,response.status,response)
  } catch (error) {
    console.log(error)
    sendResponse.error(res,error.status,error)
  }
};

const forgotChange = async (req, res) => {
  try {
    const { otp, password } = req.body;
    console.log(req.body);
    const response = await userRepo.changeForgot(otp, password);
    sendResponse.success(res,response.status,response)
  } catch (error) {
    sendResponse.error(res,error.status,error)
  }
};

const userController = {
  register,
  profile,
  deleteProfile,
  getDataById,
  getAllUser,
  unsuspend,
  editPassword,
  forgotPassword,
  forgotChange,
  postKtp
};

module.exports = userController;
