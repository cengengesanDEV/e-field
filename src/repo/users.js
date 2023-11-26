const postgreDb = require("../config/postgre"); //koneksi database
const bcrypt = require("bcrypt"); // kon
const JWTR = require("jwt-redis").default;
const client = require("../config/redis");

const register = (body) => {
  return new Promise((resolve, reject) => {
    let query = `insert into users(role,phone_number,email,status_acc,password,full_name,pin_activation) values($1,$2,$3,$4,$5,$6,$7) returning role,phone_number,email,status_acc,full_name,pin_activation `;
    const { role, email, passwords, phone_number, name } = body;
    const validasiEmail = `select email from users where email like $1`;
    const validasiPhone = `select phone_number from users where phone_number like $1`;
    let regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
    const status = "pending";
    if (regex.test(email) === false) {
      return reject({ status: 401, msg: "format email wrong" });
    }
    postgreDb.query(validasiEmail, [email], (error, resEmail) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      if (resEmail.rows.length > 0) {
        return reject({ status: 401, msg: "email already used" });
      }
      postgreDb.query(validasiPhone, [phone_number], (error, resPhone) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        if (resPhone.rows.length > 0) {
          return reject({ status: 401, msg: "number phone already use" });
        }

        // Hash Password
        bcrypt.hash(passwords, 10, (error, hashedPasswords) => {
          if (error) {
            console.log(error);
            return reject({ status: 500, msg: "Internal Server error" });
          }
          const pinActivation = Math.floor(Math.random() * 1000000);
          postgreDb.query(
            query,
            [
              role,
              phone_number,
              email,
              status,
              hashedPasswords,
              name,
              pinActivation,
            ],
            (error, response) => {
              if (error) {
                console.log(error);
                return reject({
                  status: 500,
                  msg: "Internal Server Error",
                });
              }
              resolve({
                status: 200,
                msg: "register sucess",
                data: response.rows[0],
              });
            }
          );
        });
      });
    });
  });
};

const profile = (body, token) => {
  return new Promise((resolve, reject) => {
    let query = "update users set ";
    const values = [];
    Object.keys(body).forEach((key, idx, array) => {
      if (idx === array.length - 1) {
        query += `${key} = $${idx + 1} where id = $${idx + 2} returning *`;
        values.push(body[key], token);
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
        reject(err);
      });
  });
};

const postKtp = (image, token) => {
  return new Promise((resolve, reject) => {
    let query =
      "update users set image_identity = $1 where id = $2 returning *";
    postgreDb.query(query, [image, token], (err, result) => {
      if (err) {
        console.log(err);
        return reject({ status: 500, msg: "internal server error" });
      }
      return resolve({ status: 200, msg: "post ktp success" });
    });
  });
};

const deleteUsers = (id, msg) => {
  return new Promise((resolve, reject) => {
    const query = "update users set status_acc = $1 where id = $2";
    postgreDb.query(query, ["suspend", id], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "internal server error" });
      }
      const queryMsg =
        "insert into msg_suspend(id_users,msg) values($1,$2) returning msg";
      postgreDb.query(queryMsg, [id, msg], (err, result) => {
        if (err) {
          console.log(err);
          return reject({ status: 500, msg: "internal server error" });
        }
        return resolve({ status: 201, msg: result.rows[0].msg });
      });
    });
  });
};

const getUsersById = (id) => {
  return new Promise((resolve, reject) => {
    const query = "select * from users where id = $1";
    postgreDb.query(query, [id], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "internal server error" });
      }
      return resolve({ status: 200, msg: "data found", data: result.rows });
    });
  });
};

const getAllUsers = (body) => {
  return new Promise((resolve, reject) => {
    let query = `select * from users where (role = 'owner' or role = 'customer')`;
    if (body.search) {
      query += ` and lower(full_name) like lower('%${body.search}%')`;
    }
    if (body.sort) {
      query += ` and status_acc = '${body.sort}'`;
    }
    postgreDb.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return reject({ status: 500, msg: "internal server error" });
      }
      console.log(query);
      return resolve({ status: 200, msg: "data found", data: result.rows });
    });
  });
};

const unsuspendUser = (id) => {
  return new Promise((resolve, reject) => {
    const query =
      "select id from msg_suspend where id_users = $1 and deleted_at is null";
    postgreDb.query(query, [id], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "internal server error" });
      }
      const idMsg = result.rows[0].id;
      const timestamp = Date.now() / 1000;
      const queryDeleteMsg =
        "update msg_suspend set deleted_at = to_timestamp($1) where id = $2";
      postgreDb.query(queryDeleteMsg, [timestamp, idMsg], (error, result) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "internal server error" });
        }
        const queryDeleteSuspend =
          "update users set status_acc = $1 where id = $2";
        postgreDb.query(queryDeleteSuspend, ["active", id], (error, result) => {
          if (error) {
            console.log(error);
            return reject({ status: 500, msg: "internal server error" });
          }
          return resolve({ status: 200, msg: "users successfuly unsuspend" });
        });
      });
    });
  });
};

const editpwd = (newpass, confirmpass, oldpass, id) => {
  return new Promise((resolve, reject) => {
    const getPWDquery = `select password from users where id = $1`;
    if (newpass !== confirmpass) {
      return reject({
        status: 403,
        msg: "Confirm password not same with new password",
      });
    }
    postgreDb.query(getPWDquery, [id], (err, result) => {
      if (err) {
        console.log(err);
        return reject({ status: 500, msg: "internal server error" });
      }
      const oldPwd = result.rows[0].password;
      bcrypt.compare(oldpass, oldPwd, (err, isSame) => {
        if (err) {
          console.log(err);
          return reject({ status: 500, msg: "internal server error" });
        }
        if (!isSame) {
          return reject({ status: 403, msg: "Old password not same" });
        }
        bcrypt.hash(newpass, 10, (err, hashedPasswords) => {
          if (err) {
            console.log(err);
            return reject({ status: 500, msg: "internal server error" });
          }
          const addQuery = `update users set password = $1 where id = $2`;
          postgreDb.query(addQuery, [hashedPasswords, id], (err, result) => {
            if (err) {
              console.log(err);
              return reject({ status: 500, msg: "Internal server error" });
            }
            return resolve({ status: 200, msg: "Change password success" });
          });
        });
      });
    });
  });
};

const forgotPassword = (email) => {
  return new Promise((resolve, reject) => {
    const pinActivation = Math.floor(Math.random() * 1000000);
    const query = "select email from users where email = $1";
    postgreDb.query(query, [email], (err, result) => {
      if (err) {
        console.log(err);
        return reject({ status: 500, msg: "Internal server error" });
      }
      if (result.rows.length === 0) {
        return reject({ status: 404, msg: "email wrong" });
      }

      const queryInsert =
        "update users set pinforgot = $1 where email = $2 returning pinforgot";
      postgreDb.query(queryInsert, [pinActivation, email], (err, response) => {
        if (err) {
          console.log(err);
          return reject({ status: 500, msg: "Internal server error" });
        }
        return resolve({
          status: 201,
          msg: "check your email",
          data: response.rows[0].pinforgot,
        });
      });
    });
  });
};

const changeForgot = (otp, newPassword, confirmPassword) => {
  return new Promise((resolve, reject) => {
    const query = "select pinforgot from users where pinforgot = $1";
    if (newPassword !== confirmPassword)
      return reject({
        status: 400,
        msg: "new password and confirm password doesn`t match",
      });
    postgreDb.query(query, [otp], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal server error" });
      }
      if (result.rows.length === 0) {
        return reject({
          status: 404,
          msg: "OTP Wrong please Check your email correctly",
        });
      }
      console.log("sesudah mau hash");
      bcrypt.hash(newPassword, 10, (error, hashedPassword) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal server error" });
        }
        const insetQuery =
          "update users set pinforgot = null,password = $1 where pinforgot = $2";
        console.log("sebelum ini");
        postgreDb.query(insetQuery, [hashedPassword, otp], (error, result) => {
          if (error) {
            return reject({ status: 500, msg: "Internal server error" });
          }
          resolve({
            status: 201,
            msg: "Change Password Successfuly",
            data: result.rows,
          });
        });
      });
    });
  });
};

const validateUser = (pin) => {
  return new Promise((resolve, reject) => {
    const query = "select id from users where pin_activation = $1";
    const updateQuery =
      "update users set pin_activation = null,status_acc = $1 where id = $2 returning email";
    postgreDb.query(query, [pin], (error, result) => {
      if (error) {
        return reject({ status: 500, msg: "Internal server error" });
      }
      if (result.rows.length === 0) {
        return reject({
          status: 404,
          msg: "Your Link Wrong Please Input The Correct Url",
        });
      }
      postgreDb.query(query, [pin], (error, result) => {
        if (error) {
          return reject({ status: 500, msg: "Internal server error" });
        }
        postgreDb.query(
          updateQuery,
          ["active", result.rows[0].id],
          (error, data) => {
            if (error) {
              console.log(error);
              return reject({ status: 500, msg: "Internal server error" });
            }
            resolve({
              status: 201,
              msg: "Validation Successfuly",
              data: data.rows[0],
            });
          }
        );
      });
    });
  });
};

const userRepo = {
  register,
  profile,
  deleteUsers,
  getUsersById,
  unsuspendUser,
  getAllUsers,
  editpwd,
  forgotPassword,
  changeForgot,
  postKtp,
  validateUser,
};

module.exports = userRepo;
