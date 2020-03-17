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

//post a new contract
const createContract = (request, response) => {
  console.log("createContract", request.body, request.params);
  const {
    number_contract,
    fio,
    start_date,
    term_contract,
    amount_contract,
    year_percent,
    flag_payment
  } = request.body;
  let arr_fio = request.body.fio.split(" ");
  let surname = arr_fio[0],
    name = arr_fio[1],
    father_name = arr_fio[2];
  pool.query(
    `insert into contract(id_client, number_contract, start_date, end_date, amount_contract, year_percent, 
    month_pay, penya_percent_day, flag_payment, amount_debtpay, term_contract) 
    values((select id_client from client where surname=$6, name=$7, father_name=$8), $1, $2, $2 + $3 * interval '1 month',
    $4, $5, round(($4 + ($4*$5/100))/$3, 2), 1.0, false, round($4 + ($4*$5/100),2), $3) returning id_contract;`,
    [
      number_contract,
      start_date,
      term_contract,
      amount_contract,
      year_percent,
      surname,
      name,
      father_name
    ],
    (error, result) => {
      if (error) {
        response.status(500).send({ message: "Something went wrong", status: false });
      }
      response.status(201).send({
        message: `Contract added with ID: ${results.rows[0].id_contract}`,
        id_contract: results.rows[0].id_contract,
        status: true
      });
    }
  );
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

module.exports = { getContracts, createContract, findContract };
