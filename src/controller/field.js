const fieldRepo = require("../repo/field");
const sendResponse = require("../helper/sendResponse");

const postField = async (req, res) => {
    try {
      const response = await fieldRepo.postField(req.userPayload.user_id,req.body,req.images)
      sendResponse.success(res, response.status, response);
    } catch (error) {
      console.log(error)
      sendResponse.error(res, error.status, error);
    }
  };

  const patchDetail = async (req, res) => {
    try {
      if(req?.body?.image_cover?.secure_url){
        req.body.image_cover = req.body.image_cover.secure_url 
      }else{
        delete req.body.image_cover
      }
      const response = await fieldRepo.patchField(req, req.params.id);
      sendResponse.success(res, 200, {
        msg: "Edit category kontrakan Success",
        data: response.rows[0],
      });
    } catch (err) {
      console.log(err);
      sendResponse.error(res, 500, "internal server error");
    }
  };

  const getAllField = async (req, res) => {
    try {
      const hostApi = `${req.protocol}://${req.hostname}`;
      const response = await fieldRepo.getAllField(req.query, hostApi);
      sendResponse.success(res, response.status, response);
    } catch (error) {
      sendResponse.error(res, error.status, error);
    }
  };

  const getDetailField = async (req, res) => {
    try {
      const response = await fieldRepo.getDetailField(req.params.id,req.params.date);
      sendResponse.success(res, response.status, response);
    } catch (error) {
      sendResponse.error(res, error.status, error);
    }
  };

  const getFieldByUserId = async (req, res) => {
    try {
      const response = await fieldRepo.getOwnerField(req.userPayload.user_id);
      sendResponse.success(res, response.status, response);
    } catch (error) {
      sendResponse.error(res, error.status, error);
    }
  };

  const deleteField = async (req, res) => {
    try {
      const response = await fieldRepo.deleteField(req.params.id);
      sendResponse.success(res, response.status, response);
    } catch (error) {
      sendResponse.error(res, error.status, error);
    }
  };

  const fieldController = {
    postField,
    patchDetail,
    getAllField,
    getDetailField,
    getFieldByUserId,
    deleteField
  };
  
  module.exports = fieldController;