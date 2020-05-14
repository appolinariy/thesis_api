let jwt = require("jsonwebtoken");
const db = require("../db");

const pool = db.pool;

//get bank_users
const getAllBankUser = async (request, response) => {
  try {
    let results = await pool.query(
      "select bank_user.*, filial.address from bank_user join filial on filial.id_filial = bank_user.id_filial order by bank_user.id_user ASC"
    );
    let res = results.rows.map((el) => {
      let resPass = jwt.verify(el.password, process.env.PRIVATE_KEY);
      el.password = resPass.passport;
      return el;
    });
    let filials = await pool.query("select address, id_filial from filial");
    response.status(200).send({ data: res, status: true, filials: filials.rows });
  } catch (err) {
    response.status(500).send({ message: "Something went wrong", status: false });
    console.log(err);
  }
};

//post a new Bank User
const createBankUser = (request, response) => {
  console.log("createBankUser");
  const {
    surname,
    name,
    father_name,
    position,
    login,
    password,
    address,
    system_role,
  } = request.body;
  try {
    let token = jwt.sign({ passport: password }, process.env.PRIVATE_KEY);

    if (token.length <= 150) {
      let results = pool.query(
        "insert into bank_user (surname, name, father_name, position, login, password, id_filial, system_role) values ($1, $2, $3, $4, $5, $6, (select id_filial from filial where address = $7), $8) returning id_user",
        [surname, name, father_name, position, login, token, address, system_role]
      );
    }
    response.status(201).send({
      message: `User added with ID: ${results.rows[0].id_user}`,
      id_user: results.rows[0].id_user,
      status: true,
    });
  } catch (error) {
    response.status(500).send({ message: "Something went wrong", status: false });
  }
};

//put updated data in the Bank User
const updateBankUser = (request, response) => {
  const id_user = parseInt(request.params.id_user);
  console.log("updateBankUser", request.params);
  const {
    surname,
    name,
    father_name,
    position,
    login,
    password,
    address,
    system_role,
  } = request.body;
  try {
    let token = jwt.sign({ passport: password }, process.env.PRIVATE_KEY);

    if (!!address && !!login && id_user !== undefined && token.length <= 150) {
      pool.query(
        "update bank_user set surname = $1, name = $2, father_name = $3, position = $4, login = $5, password = $6, id_filial = (select id_filial from filial where address = $7), system_role = $8 where id_user = $9",
        [surname, name, father_name, position, login, token, address, system_role, id_user]
      );
    }

    response.status(200).send({ message: `User modified with ID: ${id_user}`, status: true });
  } catch (error) {
    response.status(500).send({ message: "Something went wrong", status: false });
  }
};

//search data in the Bank User
const findBankUser = async (request, response) => {
  const { surname } = request.params;
  console.log("findBankUser", request.params, request.body);
  try {
    let results = await pool.query(
      `select bank_user.*, filial.address from bank_user join filial on filial.id_filial = bank_user.id_filial where bank_user.surname like '%${surname}%' or bank_user.name like '%${surname}%' or bank_user.father_name like '%${surname}%' order by bank_user.id_user ASC`
    );
    let filials = await pool.query(`select address, id_filial from filial`);
    response.status(200).send({ data: results.rows, status: true, filials: filials.rows });
  } catch (err) {
    response.status(500).send({ message: "Something went wrong", status: false });
  }
};

module.exports = {
  getAllBankUser,
  createBankUser,
  updateBankUser,
  findBankUser,
};
