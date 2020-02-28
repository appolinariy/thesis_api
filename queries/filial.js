const db = require("../db");

const pool = db.pool;

//get all filials by id - Fillials
const getFilials = (request, response) => {
  pool.query("select * from filial order by id_filial ASC", (error, results) => {
    if (error) {
      response.status(500).send({ message: "Something went wrong", status: false });
    }
    response.status(200).send({ data: results.rows, status: true });
  });
};

module.exports = { getFilials };
