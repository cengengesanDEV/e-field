const postgreDb = require('../config/postgre.js');

const getIncomes = (id, year) => {
  return new Promise((resolve, reject) => {
    const selectedYear = year ?? new Date().getFullYear().toString();
    const query = `WITH all_months AS (
      SELECT generate_series(1, 12) AS period
    )
    SELECT
      to_char(to_timestamp(am.period::text, 'MM'), 'Month') AS month,
      COALESCE(SUM(b.total_payment), 0) AS income
    FROM
      all_months am
    LEFT JOIN
      (
        SELECT
          EXTRACT(month FROM b.booking_date) as period,
          SUM(b.total_payment) AS total_payment
        FROM
          field f
        LEFT OUTER JOIN
          booking b ON b.field_id = f.id AND b.status = $2
        LEFT OUTER JOIN
          users u ON f.users_id = u.id
        WHERE
          u.id = $1 AND EXTRACT(year FROM b.booking_date) = $3
        GROUP BY
          period
      ) b ON am.period = b.period
    GROUP BY
      am.period
    ORDER BY
      am.period ASC;
    `;

    postgreDb.query(query, [id, 'success', selectedYear], (error, result) => {
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
