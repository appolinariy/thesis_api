const db = require("../db");

const pool = db.pool;

//get contracts
const getContracts = async (request, response) => {
  try {
    let results = await pool.query(
      `select contract.*, client.surname, client.name, client.father_name from contract, client where contract.id_client=client.id_client order by id_contract ASC;`
    );
    let borrowers = await pool.query(`select surname, name, father_name, id_client from client;`);
    response.status(200).send({ data: results.rows, borrowers: borrowers.rows, status: true });
  } catch (err) {
    response.status(500).send({ message: "Something went wrong", status: false });
    console.log(err);
  }
};

//search the contract
const findContract = async (request, response) => {
  const { number_contract } = request.params;
  console.log("findContract", request.params, request.body);
  try {
    let results = await pool.query(
      `select contract.*, client.surname, client.name, client.father_name from contract join client on contract.id_client=client.id_client where number_contract like '%${number_contract}%'order by id_contract ASC;`
    );
    let borrowers = await pool.query(`select surname, name, father_name, id_client from client;`);
    response.status(200).send({ data: results.rows, borrowers: borrowers.rows, status: true });
  } catch (err) {
    response.status(500).send({ message: "Something went wrong", status: false });
    console.log(err);
  }
};

module.exports = { getContracts, findContract };
