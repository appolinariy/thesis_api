const db = require("../db");

const pool = db.pool;

//get contract / fio
const getContractFio = async (request, response) => {
  try {
    let results = await pool.query(
      `select id_contract, number_contract, client.surname, client.name, client.father_name from contract join client on client.id_client=contract.id_client order by id_contract ASC;`
    );
    response.status(200).send({ data: results.rows, status: true });
  } catch (err) {
    response.status(500).send({ message: "Smth went wrong", status: false });
    console.log(err);
  }
};

//get payment schedule by number_contract
const getPaymentSchedule = async (request, response) => {
  const { number_contract } = request.params;
  console.log("getPaymentSchedule", request.params, request.body);
  try {
    let results = await pool.query(
      `select * from graphic_payment where id_contract=(select id_contract from contract where number_contract='${number_contract}');`
    );
    response.status(200).send({ data: results.rows, status: true });
  } catch (err) {
    response.status(500).send({ message: "Smth went wrong", status: false });
    console.log(err);
  }
};

//search the contract / fio
const findContractFio = async (request, response) => {
  const { number_contract } = request.params;
  console.log("findContractFio", request.params, request.body);
  try {
    let results = await pool.query(
      `select id_contract, number_contract, client.surname, client.name, client.father_name from contract join client on contract.id_client=client.id_client where number_contract like '%${number_contract}%'order by id_contract ASC;`
    );
    response.status(200).send({ data: results.rows, status: true });
  } catch (err) {
    response.status(500).send({ message: "Something went wrong", status: false });
    console.log(err);
  }
};

//put a new payment debt
// const addPaymentDebt = async (request, response) => {
//   const {
//     number_contract,
//     fact_date_pay,
//     fact_amount_pay
//   } = request.body;
//   console.log("addPaymentDebt", request.params, request.body);
//   try {
//     const results = await pool.query(
//       ``
//     );

//     response.status(201).send({
//       message: `Contract added with ID: ${results.rows[0].id_contract}`,
//       id_contract: results.rows[0].id_contract,
//       status: true
//     });
//   } catch (err) {
//     console.log(err);
//     response.status(500).send({ message: "Something went wrong", status: false });
//   }
// };

module.exports = { getContractFio, getPaymentSchedule, findContractFio };
