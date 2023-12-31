const postgreDb = require('../config/postgre'); //koneksi database

const getUser = (role, query) => {
  return new Promise((resolve, reject) => {
    let sqlQuery = 'select * from users where role = $1 ';
    if (query.name) {
      sqlQuery += `and full_name like '%${query.name}%'`;
    }
    console.log(sqlQuery);
    postgreDb.query(sqlQuery, [role], (err, result) => {
      if (err) {
        console.log(err);
        return reject({ status: 500, msg: 'internal server error' });
      }
      return resolve({
        status: 200,
        msg: 'data users',
        data: result.rows,
      });
    });
  });
};

const getOwnerField = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const getFieldQuery =
        'select id,name,city,start_hour,end_hour,price,image_cover,description,type,address from field where users_id = $1 and deleted_at is null';
      const getImage = 'select image from image_field where field_id = $1';

      const fieldResult = await new Promise((fieldResolve, fieldReject) => {
        postgreDb.query(getFieldQuery, [id], (err, result) => {
          if (err) {
            console.log(err);
            fieldReject({ msg: 'internal server error', status: 500 });
            return;
          }
          fieldResolve(result.rows);
        });
      });

      const hasil = fieldResult.slice(); // Copy the array to avoid mutation

      for (let index = 0; index < hasil.length; index++) {
        const imageResult = await new Promise((imageResolve, imageReject) => {
          postgreDb.query(getImage, [hasil[index].id], (err, result) => {
            if (err) {
              console.log(err);
              imageReject({ status: 500, msg: 'internal server error' });
              return;
            }
            imageResolve(result.rows);
          });
        });
        hasil[index] = { ...hasil[index], images: imageResult };
      }

      resolve({
        msg: 'data found',
        data: hasil,
        status: 200,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getDetailField = (id) => {
  return new Promise((resolve, reject) => {
    const getFieldQuery = 'select * from field where id = $1';
    const getImageQuery = 'select image from image_field where field_id = $1';
    console.log({ id });
    postgreDb.query(getFieldQuery, [id], (err, result) => {
      if (err) {
        console.log(err);
        return reject({ msg: 'internal server error', status: 500 });
      }
      let data = { field: result.rows[0] };
      postgreDb.query(getImageQuery, [data.field.id], (err, result) => {
        if (err) {
          console.log(err);
          return reject({ msg: 'internal server error', status: 500 });
        }
        if (result.rows.length > 0) {
          data = { ...data, images: result.rows };
        }
        return resolve({ data, status: 200, msg: 'data detail' });
      });
    });
  });
};

const suspendUser = (id, msg) => {
  return new Promise((resolve, reject) => {
    const query = 'insert into msg_suspend(id_user,msg) values($1,$2) returning *';
    const queryEditStatus = 'update users set status_acc = $1 where id = $2 returning *';
    postgreDb.query(query, [id, msg], (err, response) => {
      if (err) {
        console.log(err);
        return reject({ status: 500, msg: 'internal server error' });
      }
      postgreDb.query(queryEditStatus, ['suspend', id], (err, result) => {
        if (err) {
          console.log(err);
          return reject({ status: 500, msg: 'internal server error' });
        }
        return resolve({
          status: 200,
          msg: 'users suspended',
          data: { ...result.rows[0], ...response.rows[0] },
        });
      });
    });
  });
};

const unsuspendUser = (id) => {
  return new Promise((resolve, reject) => {
    const query =
      'update msg_suspend set deleted_at = to_timestamp($1) where id_user = $2 and deleted_at is null returning *';
    const queryEditStatus = 'update users set status_acc = $1 where id = $2 returning *';
    const timeStamp = Date.now() / 1000;
    postgreDb.query(query, [timeStamp, id], (err, response) => {
      if (err) {
        console.log(err);
        return reject({ status: 500, msg: 'internal server error' });
      }
      postgreDb.query(queryEditStatus, ['active', id], (err, result) => {
        if (err) {
          console.log(err);
          return reject({ status: 500, msg: 'internal server error' });
        }
        return resolve({
          status: 200,
          msg: 'users active',
          data: { ...result.rows[0], ...response.rows[0] },
        });
      });
    });
  });
};

const adminRepo = {
  getDetailField,
  getUser,
  getOwnerField,
  suspendUser,
  unsuspendUser,
};

module.exports = adminRepo;
