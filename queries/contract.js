const db = require("../db");

const pool = db.pool;

//get contracts
const getContracts = async (request, response) => {
  try {
    let results = await pool.query(
      `select contract.*, client.surname, client.name, client.father_name from contract, client where contract.id_client=client.id_client order by id_contract ASC;`
    );
    let borrowers = await pool.query(
      `select surname, name, father_name, id_client from client order by surname ASC;`
    );
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
    year_percent,
  } = request.body;

  try {
    let arr_fio = fio.split(" ");
    let surname = arr_fio[0],
      name = arr_fio[1],
      father_name = arr_fio[2];
    console.log("START CREATE CONTRACT", request.body);
    const results = await pool.query(
      `insert into contract(id_client, number_contract, start_date, amount_contract, year_percent, month_pay, penya_percent_day, flag_payment, amount_debtpay, term_contract)
      values(
            (select id_client from client where surname='${surname}' and name='${name}' and father_name='${father_name}'), 
            '${number_contract}', 
            '${start_date}', 
            ${amount_contract}, 
            ${year_percent}, 
            round((${amount_contract} + (${amount_contract}*${year_percent}/100))/${term_contract}, 2), 
            1.0, 
            false, 
            round(${amount_contract} + (${amount_contract}*${year_percent}/100), 2), 
            ${term_contract}) returning id_contract`
    );

    response.status(201).send({
      message: `Contract added with ID: ${results.rows[0].id_contract}`,
      id_contract: results.rows[0].id_contract,
      status: true,
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
    response.status(200).send({ data: results.rows, status: true });
  } catch (err) {
    response.status(500).send({ message: "Something went wrong", status: false });
    console.log(err);
  }
};

//contract filtering by period: from_date - to_date
const filterContract = async (request, response) => {
  const { from_date, to_date } = request.params;
  console.log("filterContract by start_date", request.params, request.body);
  try {
    let results = await pool.query(
      `select contract.*, client.surname, client.name, client.father_name from contract join client on contract.id_client=client.id_client where start_date>='${from_date}' and start_date<='${to_date}';`
    );
    response.status(200).send({ data: results.rows, status: true });
  } catch (err) {
    response.status(500).send({ message: "Something went wrong", status: false });
    console.log(err);
  }
};

//filtration of contracts by delay - фильтраця контрактов по просрочке
const filterGraphs = async (request, response) => {
  console.log("Фильтрация контрактов по просрочке");
  let d = new Date();
  d.setDate(d.getDate());
  let current_date = new Date(d);
  try {
    let expContracts = [];

    let rows_contracts_active = await pool.query(
      `select * from contract where flag_payment=false order by id_contract;`
    );
    let results_contracts = await rows_contracts_active.rows.map(async (contract) => {
      let rows_payments = await pool.query(
        `select * from graphic_payment where id_contract=(select id_contract from contract where number_contract='${contract.number_contract}') order by plan_date_pay;`
      );
      rows_payments.rows.forEach((payment) => {
        const plan_date_pay = new Date(payment.plan_date_pay);
        const fact_date_pay = new Date(payment.fact_date_pay);
        if (current_date >= plan_date_pay && fact_date_pay > plan_date_pay) {
          console.log("expContracts", contract.number_contract);
          expContracts.push(contract);
          return contract;
        } else {
          return payment;
        }
      });
      return contract;
    });
    let rows_contracts = await pool.query(`select * from contract order by id_contract;`);
    Promise.all(results_contracts).then((res) => {
      console.log("Просроченные контракты", expContracts);
      let okContracts = rows_contracts.rows.filter((contract) => {
        let flag = true;
        expContracts.forEach((expContract) => {
          if (contract.number_contract == expContract.number_contract) {
            flag = false;
          }
        });
        return flag;
      });
      response
        .status(200)
        .send({ expContracts: expContracts, okContracts: okContracts, status: true });
    });
  } catch (err) {
    response.status(500).send({ message: "Something went wrong", status: false });
    console.log(err);
  }
};

module.exports = { getContracts, createContract, findContract, filterContract, filterGraphs };
