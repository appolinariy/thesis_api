let jwt = require("jsonwebtoken");
const db = require("../db");

const pool = db.pool;

//post bank_user by login and password
const authorization = async (request, response) => {
  const { login, password } = request.body;
  console.log("auth", request.body);
  try {
    let results = await pool.query(
      "select password, id_user, system_role, surname, name, father_name from bank_user where login = $1",
      [login]
    );
    if (!results.rows.length) {
      response.status(400).send({ message: "No such user", status: false });
    }
    let resPassword = jwt.verify(results.rows[0].password, process.env.PRIVATE_KEY);
    console.log("resPass", resPassword);
    if (resPassword.passport !== password) {
      console.log("ERROR");
      response.status(401).send({ message: "Incorrect password", status: false });
    } else {
      console.log("RESULT is ok");
      response.status(200).send({
        message: "Success",
        status: true,
        id_user: results.rows[0].id_user,
        system_role: results.rows[0].system_role,
        surname: results.rows[0].surname,
        name: results.rows[0].name,
        father_name: results.rows[0].father_name,
      });
    }
  } catch (err) {
    response.status(500).send({ message: "Something went wrong", status: false });
  }
};

module.exports = { authorization };
