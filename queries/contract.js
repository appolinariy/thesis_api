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
const createContract = async (request, response) => {
  console.log("createContract", request.body, request.params);
  const {
    number_contract,
    fio,
    start_date,
    term_contract,
    amount_contract,
    year_percent
  } = request.body;

  try {
    let arr_fio = fio.split(" ");
    let surname = arr_fio[0],
      name = arr_fio[1],
      father_name = arr_fio[2];
    console.log("ФИО: ", surname, name, father_name);
    const results = await pool.query(
      `insert into contract(id_client, number_contract, start_date, amount_contract, year_percent, month_pay, penya_percent_day, flag_payment, amount_debtpay, term_contract)
      values(
            (select id_client from client where surname='${surname}' and name='${name}' and father_name='${father_name}'), 
            '${number_contract}', 
            '${start_date}', 
            ${amount_contract}, 
            ${year_percent}, 
            round(${amount_contract} + (${amount_contract}*${year_percent}/100)/${term_contract}, 2), 
            1.0, 
            false, 
            round(${amount_contract} + (${amount_contract}*${year_percent}/100), 2), 
            ${term_contract}) returning id_contract`
    );

    response.status(201).send({
      message: `Contract added with ID: ${results.rows[0].id_contract}`,
      id_contract: results.rows[0].id_contract,
      status: true
    });
  } catch (err) {
    console.log(err);
    response.status(500).send({ message: "Something went wrong", status: false });
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

//contract filtering by period: from_date - to_date
const filterContract = async (request, response) => {
  const { from_date, to_date } = request.params;
  console.log("filterContract", request.params, request.body);
  try {
    let results = await pool.query(
      `select contract.*, client.surname, client.name, client.father_name from contract join client on contract.id_client=client.id_client where start_date>=${from_date} and start_date<=${to_date};`
    );
    let borrowers = await pool.query(`select surname, name, father_name, id_client from client;`);
    response.status(200).send({ data: results.rows, borrowers: borrowers.rows, status: true });
  } catch (err) {
    response.status(500).send({ message: "Something went wrong", status: false });
    console.log(err);
  }
};

module.exports = { getContracts, createContract, findContract, filterContract };
