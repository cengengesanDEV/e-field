const postgreDb = require("../config/postgre.js");
const jwt = require("jsonwebtoken");
const JWTR = require("jwt-redis").default;
const bcrypt = require("bcrypt");
const client = require("../config/redis");

// Login Authentikasi
const login = (body) => {
  return new Promise((resolve, reject) => {
    const { email, passwords } = body;
    const jwtr = new JWTR(client);
    // 1. Cek apakah ada email yang sama di database ?
    const getPasswordsByEmailValues =
      "select id, email, password,status_acc, role from users where email = $1";
    const getPasswordsEmailValues = [email];
    postgreDb.query(
      getPasswordsByEmailValues,
      getPasswordsEmailValues,
      (err, response) => {
        if (err) {
          console.log(err);
          return reject({ status: 500, msg: "internal server error" });
        }
        if (response.rows.length === 0)
          return reject({ status: 401, msg: "email/password wrong" });
        if (response.rows[0].status_acc === 'suspend'){
          const querySuspend = 'select msg from msg_suspend where id_users = $1 and deleted_at is null'
          postgreDb.query(querySuspend,[response.rows[0].id],(err,res)=> {
            if(err){
              console.log(err)
              return reject({ status: 500, msg: "internal server error" })
            }
            return reject({status:401,msg:res.rows[0].msg})
          })
        }
        // 3. Process Login => create jwt => return jwt to users
        const payload = {
          user_id: response.rows[0].id,
          email: response.rows[0].email,
          role: response.rows[0].role,
        };
        const hashedPasswords = response.rows[0].password; // <= Get passwords from database
        bcrypt.compare(passwords, hashedPasswords, (err, isSame) => {
          if (err) {
            console.log(err);
            return reject({ status: 500, msg: "internal server error" });
          }
          if (!isSame)
            return reject({
              status: 401,
              msg: "email/password wrong",
            });
          // jwt.sign(
          //     payload,
          //     process.env.SECRET_KEY,
          //     {
          //         expiresIn: "1d",
          //         issuer: process.env.ISSUER,
          //     },
          //     (err, token) => {
          //         if (err) {
          //             console.log(err);
          //             return reject({ err });
          //         }
          //         return resolve({ role: payload.role, token })
          //     }
          // )
          jwtr
            .sign(payload, process.env.SECRET_KEY, {
              expiresIn: "1d",
              issuer: process.env.ISSUER,
            })
            .then((token) => {
              // Token verification
              return resolve({
                status: 200,
                msg: "login success",
                data: { token, ...payload },
              });
            });
        });
      }
    );
  });
};

const logout = (token) => {
  return new Promise((resolve, reject) => {
    const jwtr = new JWTR(client);
    jwtr.destroy(token.jti).then((res) => {
      if (!res) reject({ status: 500, msg: "internal server error" });
      return resolve({ status: 200, msg: "logout success" });
    });
  });
};

const authRepo = {
  login,
  logout,
};

module.exports = authRepo;
