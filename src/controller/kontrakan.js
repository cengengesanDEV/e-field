const kontrakanRepo = require("../repo/kontrakan");
const sendResponse = require("../helper/sendResponse");

const getAllCategory = async (req, res) => {
  try {
    const hostApi = `${req.protocol}://${req.hostname}`;
    const response = await kontrakanRepo.getAllCategory(req.query, hostApi);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await kontrakanRepo.getcategoryById(id);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};

const getCategoryId = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await kontrakanRepo.getCategoryId(id);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    console.log(error);
    sendResponse.error(res, error.status, error);
  }
};
const getDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await kontrakanRepo.getDetailById(id);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};

const getDetailUsersById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await kontrakanRepo.getDetailByUsersId(id);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};

const getKontrakanDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await kontrakanRepo.getKontrakanDetails(id);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    console.log(error);
    sendResponse.error(res, error.status, error);
  }
};

const postCategory = async (req, res) => {
  try {
    const { user_id } = req.userPayload;
    const response = await kontrakanRepo.postCategory(
      user_id,
      req.body,
      req.file.secure_url
    );
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};

const postDetail = async (req, res) => {
  try {
    const response = await kontrakanRepo.postDetail(req);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};

const patchcategory = async (req, res) => {
  try {
    // push all body lalu if disini mengubah body.image menjadi file.patch
    // if (req.file) {
    //     req.body.image = `${req.file.filename}`;
    // }
    if (req.file) {
      var image = `/${req.file.public_id}.${req.file.format}`; //ubah filename
      req.body.image = req.file.secure_url;
    }

    const response = await kontrakanRepo.patchCategory(req.body, req.params.id);
    sendResponse.success(res, 200, {
      msg: "Edit category kontrakan Success",
      data: response.rows,
      filename: image,
    });
  } catch (err) {
    console.log(err);
    sendResponse.error(res, 500, "internal server error");
  }
};

const patchDetail = async (req, res) => {
  try {
    console.log(req);
    const response = await kontrakanRepo.patchDetail(req, req.params.id);
    sendResponse.success(res, 200, {
      msg: "Edit category kontrakan Success",
      data: response.rows[0],
    });
  } catch (err) {
    console.log(err);
    sendResponse.error(res, 500, "internal server error");
  }
};

const deleteCategory = async (req, res) => {
  try {
    const response = await kontrakanRepo.deleteCategory(req.params.id);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};

const deleteDetail = async (req, res) => {
  try {
    const response = await kontrakanRepo.deleteDetail(req.params.id);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};

const kontrakanController = {
  getAllCategory,
  getCategoryById,
  getDetailById,
  getCategoryId,
  getDetailUsersById,
  postCategory,
  postDetail,
  getKontrakanDetails,
  patchcategory,
  patchDetail,
  deleteCategory,
  deleteDetail,
};

module.exports = kontrakanController;
