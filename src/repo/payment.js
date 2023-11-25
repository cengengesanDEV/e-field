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
      total_payment,
      username
    } = body;
    const query =
      "insert into booking(renter_id,field_id,play_date,start_play,end_play,image_payment,booking_date,total_payment,status,username) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning *";
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
        "pending",
        username
      ],
      (error, result) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "internal server error" });
        }
        return resolve({
          status: 200,
          msg: "payment success",
          data: result.rows[0],
        });
      }
    );
  });
};

const getBookingCustomer = (id, status) => {
  return new Promise((resolve, reject) => {
    const query =
      "select b.play_date,b.start_play,b.end_play,b.username,b.image_payment,b.booking_date,b.total_payment,b.status,f.name,f.city,f.image_cover,f.type,f.address from booking b inner join field f on b.field_id = f.id where b.renter_id = $1 and b.deleted_renter is null and b.status = $2";
    postgreDb.query(query, [id, status], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "internal server error" });
      }
      return resolve({
        status: 200,
        msg: "data booking customer",
        data: result.rows.length > 0?result.rows:[],
      });
    });
  });
};

const getBookingOwner = (id, status) => {
  return new Promise((resolve, reject) => {
    const query =
      "select b.play_date,b.start_play,b.end_play,b.username,b.image_payment,b.booking_date,b.total_payment,b.status,f.name,f.city,f.image_cover,f.type,f.address,u.image_identity,u.no_identity,u.full_name,u.phone_number from booking b inner join field f on b.field_id = f.id inner join users u on b.renter_id = u.id where f.users_id = $1 and b.deleted_renter is null and b.status = $2";
    postgreDb.query(query, [id, status], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "internal server error" });
      }
      return resolve({
        status: 200,
        msg: "data booking owner",
        data: result.rows.length > 0?result.rows:[],
      });
    });
  });
};

const paymentRepo = { postPayment , getBookingCustomer ,getBookingOwner};

module.exports = paymentRepo;
