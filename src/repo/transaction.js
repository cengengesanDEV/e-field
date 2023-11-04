const postgreDb = require("../config/postgre"); //koneksi database

const postBooking = (body, id_users) => {
  return new Promise((resolve, reject) => {
    const { id_kontrakan, checkin, checkout, order_date, total_price } = body;
    const timestamp = Date.now() / 1000;
    const query =
      "insert into transaction(id_users,id_kontrakan,checkin,checkout,status_booking,order_date,total_price,created_at,updated_at) values($1,$2,$3,$4,$5,$6,$7,to_timestamp($8),to_timestamp($9)) returning *";
    postgreDb.query(
      query,
      [
        id_users,
        id_kontrakan,
        checkin,
        checkout,
        "pending",
        order_date,
        total_price,
        timestamp,
        timestamp,
      ],
      (error, result) => {
        if (error) {
          console.log(error);
          reject({ status: 500, msg: "internal server error" });
        }
        const queryUpdate = `update detail_kontrakan set status = 'booked' where id = $1`;
        postgreDb.query(queryUpdate, [id_kontrakan], (error, result) => {
          if (error) {
            console.log(error);
            reject({ status: 500, msg: "internal server error" });
          }
          return resolve({
            status: 201,
            msg: "kontrakan has book please continue to payment",
          });
        });
      }
    );
  });
};

const payment = (body, image) => {
  return new Promise((resolve, reject) => {
    const { payment_method, id_transaction } = body;
    const query =
      "update transaction set payment_method = $1, status_booking = $2 where id = $3 returning *";
    const status = "booked";
    postgreDb.query(
      query,
      [payment_method, "paid", id_transaction],
      (error, result) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "internal server error" });
        }
        const id_kontrakan = result.rows[0].id_kontrakan;
        const queryUpdate =
          "update detail_kontrakan set status = $1 where id = $2";
        postgreDb.query(
          queryUpdate,
          [status, id_kontrakan],
          (error, result) => {
            if (error) {
              console.log(error);
              return reject({ status: 500, msg: "internal server error" });
            }
            const queryAddTransfer =
              "insert into image_transfer(id_transaksi,image) values($1,$2)";
            postgreDb.query(
              queryAddTransfer,
              [id_transaction, image],
              (error, response) => {
                if (error) {
                  console.log(error);
                  return reject({ status: 500, msg: "internal server error" });
                }
                return resolve({ status: 201, msg: "payment success" });
              }
            );
          }
        );
      }
    );
  });
};

const getHistoryCustomer = (status, id) => {
  return new Promise((resolve, reject) => {
    console.log({id})
    const query =
      "select tr.id,de.tipe_kontrakan,(select image from image_kontrakan where de.id = id_detail_kontrakan and deleted_at is null limit 1) as image_kontrakan,(select full_name from users as us inner join category_kontrakan as ca on ca.id_user = us.id inner join detail_kontrakan as de on de.id_kontrakan = ca.id inner join transaction as tra on tra.id_kontrakan = de.id where tr.id = tra.id) as owner,(select no_rekening from users as us inner join category_kontrakan as ca on ca.id_user = us.id inner join detail_kontrakan as de on de.id_kontrakan = ca.id inner join transaction as trac on trac.id_kontrakan = de.id where tr.id = trac.id) as no_rekening,us.full_name as customer,tr.checkin,tr.checkout,tr.status_booking,tr.order_date,tr.total_price,tr.payment_method from transaction tr inner join detail_kontrakan as de on de.id = tr.id_kontrakan inner join users as us on us.id = tr.id_users where us.id = $1 and tr.status_booking = $2 and tr.deleted_at is null";
    postgreDb.query(query, [id, status], (err, result) => {
      if (err) {
        console.log(err);
        return reject({ status: 500, msg: "internal server error" });
      }
      return resolve({ status: 200, msg: "history found", data: result.rows });
    });
  });
};

const getTransactionsByStatus_booking = (id,status) => {
  return new Promise((resolve, reject) => {
    const query =
      "select tr.id,de.tipe_kontrakan,(select full_name from users where tr.id_users = id) as customers,(select no_ktp from users where tr.id_users = id) as no_ktp_customer,us.full_name as owner,tr.checkin,tr.checkout,tr.status_booking,tr.order_date,tr.total_price,tr.payment_method,(select image from image_kontrakan where id_detail_kontrakan = de.id limit 1) from transaction tr inner join detail_kontrakan as de on de.id = tr.id_kontrakan inner join category_kontrakan as ca on ca.id = de.id_kontrakan inner join users as us on us.id = ca.id_user where us.id = $1 and tr.status_booking = $2 and tr.deleted_at_owner is null";
    postgreDb.query(query, [id,status], (err, result) => {
      if (err) {
        console.log(err);
        return reject({ status: 500, msg: "internal server error" });
      }
      let totalIncome = 0
      result?.rows?.map((e)=>{
        totalIncome += e.total_price
      })
      return resolve({ status: 200, msg: "history found", data: {data:result.rows,totalIncome} });
    });
  });
};

const getStatusPaid = (id , status) => {
  return new Promise((resolve, reject) => {
    if(status === 'paid') {
      const query = `SELECT tr.id, de.tipe_kontrakan,(select full_name from users where tr.id_users = id) as customers,(select no_ktp from users where tr.id_users = id) as no_ktp_customer, us.full_name AS owner, tr.checkin, tr.checkout, tr.status_booking, tr.order_date, tr.total_price, tr.payment_method, (SELECT image FROM image_transfer WHERE id_transaksi = tr.id limit 1) FROM transaction tr INNER JOIN detail_kontrakan AS de ON de.id = tr.id_kontrakan INNER JOIN category_kontrakan AS ca ON ca.id = de.id_kontrakan INNER JOIN users AS us ON us.id = ca.id_user WHERE us.id = $1 AND tr.status_booking = 'paid'`;
    postgreDb.query(query, [id], (err, result) => {
      if (err) {
        console.log(err);
        return reject({ status: 500, msg: "internal server error" });
      }
      return resolve({ status: 200, msg: "data found", data: result.rows });
    });
    }
    if(status === 'process'){
      const query = `select tr.id,de.tipe_kontrakan,(select full_name from users where tr.id_users = id) as customers,(select no_ktp from users where tr.id_users = id) as no_ktp_customer,us.full_name as owner,tr.checkin,tr.checkout,tr.status_booking,tr.order_date,tr.total_price,tr.payment_method,(select image from image_kontrakan where id_detail_kontrakan = de.id and deleted_at is null limit 1) as image from transaction tr inner join detail_kontrakan as de on de.id = tr.id_kontrakan inner join category_kontrakan as ca on ca.id = de.id_kontrakan inner join users as us on us.id = ca.id_user where us.id = $1 and tr.status_booking = 'process' and  now() >= tr.checkout`;
    postgreDb.query(query, [id], (err, result) => {
      if (err) {
        console.log(err);
        return reject({ status: 500, msg: "internal server error" });
      }
      return resolve({ status: 200, msg: "data found", data: result.rows });
    });
    }
  });
};

const acceptOrder = (id, status) => {
  return new Promise((resolve, reject) => {
    if (status === "accept") {
      const query =
        "update transaction set status_booking = 'process' where id = $1 returning id_kontrakan ";
      postgreDb.query(query, [id], (err, result) => {
        if (err) {
          console.log(err);
          return reject({ status: 500, msg: "internal server error" });
        }
        const id_kontrakan = result.rows[0].id_kontrakan;
        const queryUpdate = `update detail_kontrakan set status = 'rented' where id = $1`;
        postgreDb.query(queryUpdate, [id_kontrakan], (err, result) => {
          if (err) {
            console.log(err);
            return reject({ status: 500, msg: "internal server error" });
          }
          return resolve({ status: 200, msg: "order accepted" });
        });
      });
    }
    if (status === "decline") {
      const query =
        "update transaction set status_booking = 'cancel' where id = $1 returning id_kontrakan ";
      postgreDb.query(query, [id], (err, result) => {
        if (err) {
          console.log(err);
          return reject({ status: 500, msg: "internal server error" });
        }
        const id_kontrakan = result.rows[0].id_kontrakan;
        const queryUpdate = `update detail_kontrakan set status = 'ready' where id = $1`;
        postgreDb.query(queryUpdate, [id_kontrakan], (err, result) => {
          if (err) {
            console.log(err);
            return reject({ status: 500, msg: "internal server error" });
          }
          return resolve({ status: 200, msg: "order canceled" });
        });
      });
    }
  });
};

const finishOrder = (id) => {
  return new Promise((resolve, reject) => {
    const query =
      "update transaction set status_booking = 'done' where id = $1 returning id_kontrakan ";
    postgreDb.query(query, [id], (err, result) => {
      if (err) {
        console.log(err);
        return reject({ status: 500, msg: "internal server error" });
      }
      const id_kontrakan = result.rows[0].id_kontrakan;
      const queryUpdate = `update detail_kontrakan set status = 'ready' where id = $1`;
      postgreDb.query(queryUpdate, [id_kontrakan], (err, result) => {
        if (err) {
          console.log(err);
          return reject({ status: 500, msg: "internal server error" });
        }
        return resolve({ status: 200, msg: "order finished" });
      });
    });
  });
};

const deleteTransactionCustomer = (id) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now() / 1000;
    const query = `update transaction set deleted_at = to_timestamp($1) where id = $2 `;
    postgreDb.query(query, [timestamp, id], (err, result) => {
      if (err) {
        console.log(err);
        return reject({ status: 500, msg: "internal server error" });
      }
      return resolve({
        status: 200,
        msg: "delete history success",
        data: result.rows,
      });
    });
  });
};
const deleteTransactionOwner = (id) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now() / 1000;
    const query = `update transaction set deleted_at_owner = to_timestamp($1) where id = $2 `;
    postgreDb.query(query, [timestamp, id], (err, result) => {
      if (err) {
        console.log(err);
        return reject({ status: 500, msg: "internal server error" });
      }
      return resolve({
        status: 200,
        msg: "delete history success",
        data: result.rows,
      });
    });
  });
};

const transactionRepo = {
  postBooking,
  payment,
  payment,
  getTransactionsByStatus_booking,
  getStatusPaid,
  getHistoryCustomer,
  acceptOrder,
  finishOrder,
  deleteTransactionCustomer,
  deleteTransactionOwner,
};

module.exports = transactionRepo;
