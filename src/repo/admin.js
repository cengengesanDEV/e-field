const postgreDb = require("../config/postgre"); //koneksi database

const getUser = (role) => {
  return new Promise((resolve, reject) => {
    const query = "select * from users where role = $1";
    postgreDb.query(query, [role], (err) => {
      if (err) {
        console.log(err);
        return reject({ status: 500, msg: "internal server error" });
      }
      return resolve({
        status: 200,
        msg: "data booking owner",
        data: result.rows[0],
      });
    });
  });
};
