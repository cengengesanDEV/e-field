const postgreDb = require("../config/postgre"); //koneksi database
const cloudinary = require("../config/cloudinary");

const postField = (id, body, images) => {
  return new Promise((resolve, reject) => {
    const {
      name,
      city,
      start_hour,
      end_hour,
      price,
      image_cover,
      description,
    } = body;
    const query =
      "insert into field(users_id,name,city,start_hour,end_hour,price,image_cover,description) values($1,$2,$3,$4,$5,$6,$7,$8) returning *";
    postgreDb.query(
      query,
      [
        id,
        name,
        city,
        Number(start_hour),
        Number(end_hour),
        Number(price),
        image_cover.secure_url,
        description,
      ],
      (error, result) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "internal server error" });
        }
        let resultSuccess = { ...result.rows[0] };
        const field_id = result.rows[0].id;
        let imageValues = "values";
        let preapreImage = [];
        images.forEach((image, index) => {
          if (index !== images.length - 1) {
            imageValues += `($${1 + index * 2}, $${2 + index * 2}), `;
          } else {
            imageValues += `($${1 + index * 2}, $${2 + index * 2})`;
          }
          preapreImage.push(field_id, image);
        });
        const addImageQuery = `insert into image_field(field_id, image) ${imageValues} returning *`;
        postgreDb.query(addImageQuery, preapreImage, (err, result) => {
          if (err) {
            console.log(err);
            return reject({ status: 500, msg: "internal server error" });
          }
          const imageResult = [];
          result.rows.forEach((image) => imageResult.push(image.image));
          resultSuccess = {
            ...resultSuccess,
            imageResult,
          };
          return resolve({
            status: 201,
            msg: "kontrakan created",
            data: resultSuccess,
          });
        });
      }
    );
  });
};

const patchField = (req, id) => {
  return new Promise((resolve, reject) => {
    let query = "update field set ";
    let { body } = req;
    if (body.image_cover === "") delete body.image_cover;
    if (body.imageDelete) {
      const imageDelete = body.imageDelete;
      delete body.imageDelete;
      let split = imageDelete.split(",");
      let queryDeleteImage = "delete from image_field where image in (";
      split.forEach((_, index, arr) => {
        if (index === arr.length - 1) {
          queryDeleteImage += `$${index + 1})`;
          return;
        }
        queryDeleteImage += `$${index + 1},`;
      });
      postgreDb.query(queryDeleteImage, split, (error, result) => {
        if (error) {
          console.log(error);
          console.log(queryDeleteImage);
          return reject({ status: 500, msg: "internal server error" });
        }
        split.map((value) => {
          cloudinary.uploader.destroy(value);
        });
      });
    }
    if (req.images) {
      const images = req.images;
      let imageValues = "values";
      let preapreImage = [];
      images.forEach((image, index) => {
        if (index !== images.length - 1) {
          imageValues += `($${1 + index * 2}, $${2 + index * 2}), `;
        } else {
          imageValues += `($${1 + index * 2}, $${2 + index * 2})`;
        }
        preapreImage.push(id, image);
      });
      const addImageQuery = `insert into image_field(field_id, image) ${imageValues} returning *`;
      console.log(addImageQuery);
      postgreDb.query(addImageQuery, preapreImage, (err, result) => {
        if (err) {
          console.log(err);
          return reject({ status: 500, msg: "internal server error" });
        }
      });
    }
    if (req.body.image_cover) {
      cloudinary.uploader.destroy(req.body.image_cover);
    }
    const values = [];
    Object.keys(body).forEach((key, idx, array) => {
      if (idx === array.length - 1) {
        query += `${key} = $${idx + 1} where id = $${idx + 2} returning *`;
        values.push(body[key], id);
        return;
      }
      query += `${key} = $${idx + 1},`;
      values.push(body[key]);
    });
    postgreDb
      .query(query, values)
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        console.log(err);
        console.log(query);
        reject(err);
      });
  });
};

const getAllField = (param, hostAPI) => {
  return new Promise((resolve, reject) => {
    let query = "select * from field where deleted_at is null ";
    let link = `${hostAPI}/api/field?`;
    if(param.name){
      query += `and name like '%${param.name}%' `
      link += `name=${param.name}`
    }
    if (param.city) {
      query += `and city = '${param.city}' `;
      link += `city=${param.city}`;
    }
    if (param.sort === "cheapest") {
      if (param.city) {
        link += `&`;
      }
      query += `order by price asc`;
      link += `sort=cheapest`;
    }
    if (param.sort === "expensive") {
      if (param.city) {
        link += `&`;
      }
      query += "order by price desc";
      link += `sort=expensive`;
    }

    let queryLimit = "";
    let values = [];
    if (param.page && param.limit) {
      let page = parseInt(param.page);
      let limit = parseInt(param.limit);
      let offset = (page - 1) * limit;
      queryLimit = query + ` limit $1 offset $2`;
      values.push(limit, offset);
    } else {
      queryLimit = query;
    }
    postgreDb.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return reject({ msg: "internal server error", status: 500 });
      }
      postgreDb.query(queryLimit, values, (err, queryresult) => {
        if (err) {
          console.log(err);
          return reject({ msg: "internal server error", status: 500 });
        }
        if (queryresult.rows.length == 0)
          return reject({ msg: "data not found", status: 404 });
        let resNext = null;
        let resPrev = null;
        if (param.page && param.limit) {
          let page = parseInt(param.page);
          let limit = parseInt(param.limit);
          let start = (page - 1) * limit;
          let end = page * limit;
          let next = "";
          let prev = "";
          const dataNext = Math.ceil(result.rowCount / limit);
          if (start <= queryresult.rowCount) {
            next = page + 1;
          }
          if (end > 0) {
            prev = page - 1;
          }
          if (parseInt(next) <= parseInt(dataNext)) {
            resNext = `${link}&page=${next}&limit=${limit}`;
          }
          if (parseInt(prev) !== 0) {
            resPrev = `${link}&page=${prev}&limit=${limit}`;
          }
          let sendResponse = {
            dataCount: queryresult.rowCount,
            next: resNext,
            prev: resPrev,
            totalPage: Math.ceil(result.rowCount / limit),
          };
          return resolve({
            msg: "data found",
            data: queryresult.rows,
            meta: sendResponse,
            status: 200,
          });
        }
        let sendResponse = {
          dataCount: result.rowCount,
          next: resNext,
          prev: resPrev,
          totalPage: null,
        };
        return resolve({
          msg: "data found",
          data: queryresult.rows,
          meta: sendResponse,
          status: 200,
        });
      });
    });
  });
};

const getDetailField = (id, date) => {
  return new Promise((resolve, reject) => {
    const getFieldQuery = "select * from field where id = $1";
    const getImageQuery = "select image from image_field where field_id = $1";
    const getBooking =
      "select start_play,end_play from booking where field_id = $1 and play_date = $2";
    console.log({ id });
    postgreDb.query(getFieldQuery, [id], (err, result) => {
      if (err) {
        console.log(err);
        return reject({ msg: "internal server error", status: 500 });
      }
      let data = { field: result.rows[0] };
      postgreDb.query(getImageQuery, [data.field.id], (err, result) => {
        if (err) {
          console.log(err);
          return reject({ msg: "internal server error", status: 500 });
        }
        if (result.rows.length > 0) {
          data = { ...data, images: result.rows };
        }
        postgreDb.query(getBooking, [id, date], (err, result) => {
          if (err) {
            console.log(err);
            return reject({ msg: "internal server error", status: 500 });
          }
          if (result.rows.length > 0) {
            const totalPlay = [];
            result.rows.forEach((value) => {
              for (i = value.start_play; i <= value.end_play; i++) {
                totalPlay.push(i);
              }
            });
            data = { ...data, booking: totalPlay };
          }
          return resolve({
            msg: "data found",
            data: data,
            status: 200,
          });
        });
      });
    });
  });
};

const getOwnerField = (id) => {
  return new Promise((resolve, reject) => {
    const getFieldQuery = "select * from field where users_id = $1";
    postgreDb.query(getFieldQuery, [id], (err, result) => {
      if (err) {
        console.log(err);
        return reject({ msg: "internal server error", status: 500 });
      }
      return resolve({
        msg: "data found",
        data: result.rows[0],
        status: 200,
      });
    });
  });
};

const fieldRepo = {
  postField,
  patchField,
  getAllField,
  getDetailField,
  getOwnerField,
};

module.exports = fieldRepo;
