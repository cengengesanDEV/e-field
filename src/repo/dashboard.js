const postgreDb = require('../config/postgre.js');

const getIncomes = (id, type) => {
  return new Promise((resolve, reject) => {
    const incomeType = type || 'weekly';

    const datePartMap = {
      weekly: "DATE_TRUNC('week', b.booking_date)",
      monthly: 'EXTRACT(month FROM b.booking_date)',
      yearly: 'EXTRACT(year FROM b.booking_date)',
    };

    const datePart = datePartMap[incomeType] || datePartMap['weekly']; // Default to weekly if type is not recognized

    const query = `
        SELECT
          ${datePart} as period,
          f.name as fieldName,
          SUM(b.total_payment) AS income
        FROM
          booking b
        JOIN
          field f ON b.field_id = f.id
        JOIN
          users u ON f.users_id = u.id
        WHERE
          u.id = $1 AND b.status = $2
        GROUP BY
          period, fieldName
        ORDER BY
        period DESC
      `;

    postgreDb.query(query, [id, 'success'], (error, result) => {
      if (error) {
        console.log(error);
        reject({ status: 500, msg: 'internal server error' });
      } else {
        resolve({
          status: 200,
          msg: 'income data',
          data: result.rows,
        });
      }
    });
  });
};

const dashboardRepo = {
  getIncomes,
};

module.exports = dashboardRepo;
