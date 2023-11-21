const postgreDb = require("../config/postgre.js");

const postPayment = (id, body) => {
    return new Promise((resolve, reject) => {
      const {
        field_id,
        play_date,
        start_play,
        end_play,
        image_payment,
        booking_date,
        total_payment
      } = body;
      const query =
        "insert into booking(renter_id,field_id,play_date,start_play,end_play,image_payment,booking_date,total_payment,status) values($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *";
      postgreDb.query(
        query,
        [
          id,
          field_id,
          play_date,
          Number(start_play),
          Number(end_play),
          image_payment,
          booking_date,
          Number(total_payment),
          "pending"
        ],
        (error, result) => {
          if (error) {
            console.log(error);
            return reject({ status: 500, msg: "internal server error" });
          }
          return resolve({status:200,msg: "payment success",data:result.rows[0]})
        }
      );
    });
  };

const paymentRepo = {postPayment};
  
  module.exports = paymentRepo;