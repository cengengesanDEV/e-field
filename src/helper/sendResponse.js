const sendResponse = {
  success: (res, status = 200, result) => {
    const results = {
      status,
      msg: result.msg,
      data: result.data || null,
      meta: result.meta || null,
      filename: result.filename || null,
    };
    return res.status(status).json(results);
  },
  error: (res, status = 500, error) => {
    return res.status(status).json({ status, msg: error.msg, data: error.data || null });
  },
};
module.exports = sendResponse;
