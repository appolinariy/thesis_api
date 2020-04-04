const db = require("../db");

const pool = db.pool;

//get payment schedule by number_contract
const getPaymentSchedule = async (request, response) => {
  const { number_contract } = request.params;
  console.log("getPaymentSchedule", request.params);
  try {
    let results = await pool.query(
      `select * from graphic_payment where id_contract=(select id_contract from contract where number_contract='${number_contract}');`
    );
    console.log(results, "results");
    response.status(200).send({ data: results.rows, status: true });
  } catch (err) {
    response.status(500).send({ message: "Smth went wrong", status: false });
    console.log(err);
  }
};

//search the contract / fio
// const findContractFio = async (request, response) => {
//   const { number_contract } = request.params;
//   console.log("findContractFio", request.params, request.body);
//   try {
//     let results = await pool.query(
//       `select id_contract, number_contract, client.surname, client.name, client.father_name from contract join client on contract.id_client=client.id_client where number_contract like '%${number_contract}%'order by id_contract ASC;`
//     );
//     response.status(200).send({ data: results.rows, status: true });
//   } catch (err) {
//     response.status(500).send({ message: "Something went wrong", status: false });
//     console.log(err);
//   }
// };

//put a new payment month debt
const addPaymentDebt = async (request, response) => {
  let { number_contract } = request.params;
  let current_amount_pay = parseFloat(request.body.current_amount_pay);
  console.log("currentAmountPay", current_amount_pay);
  let { current_date_pay } = request.body;
  console.log("addPaymentDebt", request.params, request.body);
  try {
    let pays = [];
    let dates = [];

    let rows = await pool.query(
      `select * from graphic_payment where id_contract=(select id_contract from contract where number_contract='${number_contract}') order by plan_date_pay;`
    );
    let results = rows.rows.map((payment) => {
      const plan_amount_pay = parseFloat(payment.plan_amount_pay);
      const fact_amount_pay = parseFloat(payment.fact_amount_pay);
      console.log(plan_amount_pay, fact_amount_pay);
      if (current_amount_pay != 0) {
        let z = 0;
        if (plan_amount_pay > fact_amount_pay) {
          let dif = plan_amount_pay - fact_amount_pay;
          if (dif <= current_amount_pay) {
            z = dif;
          } else {
            z = current_amount_pay;
          }
          pays.push(`when id_pay=${payment.id_pay} then ${(fact_amount_pay + z).toFixed(2)}`);
          dates.push(`when id_pay=${payment.id_pay} then '${current_date_pay}'`);
        }

        // pays.push([payment.id_pay, (fact_amount_pay + z).toFixed(2), current_date_pay]);
        current_amount_pay -= z;
        return {
          ...payment,
          fact_amount_pay: fact_amount_pay + z,
          fact_date_pay: current_date_pay,
        };
      } else return payment;
    });
    console.log(`${pays.join(" ")}`);
    const updatePays = await pool.query(
      `update graphic_payment set fact_amount_pay = case ${pays.join(
        " "
      )} else fact_amount_pay end;`
    );
    const updateDates = await pool.query(
      `update graphic_payment set fact_date_pay = case ${dates.join(" ")} else fact_date_pay end;`
    );
    console.log(results, "results");
    response.status(200).send({ results, status: true });
  } catch (err) {
    console.log(err);
    response.status(500).send({ message: "OOps", status: false });
  }
};

module.exports = { getPaymentSchedule, addPaymentDebt };
