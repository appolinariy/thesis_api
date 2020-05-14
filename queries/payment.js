const nodemailer = require("nodemailer");
const db = require("../db");

const pool = db.pool;

//get payment schedule by number_contract
const getPaymentSchedule = async (request, response) => {
  const { number_contract } = request.params;
  console.log("getPaymentSchedule", request.params);
  try {
    let results = await pool.query(
      `select * from graphic_payment where id_contract=(select id_contract from contract where number_contract='${number_contract}') order by plan_date_pay;`
    );
    console.log(results, "results");
    response.status(200).send({ data: results.rows, status: true });
  } catch (err) {
    response.status(500).send({ message: "Smth went wrong", status: false });
    console.log(err);
  }
};

//put a new debt payment
const addPaymentDebt = async (request, response) => {
  let { number_contract } = request.params;
  let current_amount_pay = parseFloat(request.body.current_amount_pay);
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

//put a new penya payment
const addPaymentPenya = async (request, response) => {
  let { number_contract } = request.params;
  let current_amount_penya = parseFloat(request.body.current_amount_penya);
  let { current_date_penya } = request.body;
  console.log("addPaymentPenya", request.params, request.body);
  try {
    let pays = [];
    let dates = [];

    let rows = await pool.query(
      `select * from graphic_payment where id_contract=(select id_contract from contract where number_contract='${number_contract}') order by plan_date_pay;`
    );
    let results = rows.rows.map((payment) => {
      const debt_penya = parseFloat(payment.debt_penya);
      const fact_amount_penya = parseFloat(payment.fact_amount_penya);
      console.log(debt_penya, fact_amount_penya);
      if (current_amount_penya != 0) {
        let z = 0;
        if (debt_penya > fact_amount_penya) {
          let dif = debt_penya - fact_amount_penya;
          if (dif <= current_amount_penya) {
            z = dif;
          } else {
            z = current_amount_penya;
          }
          pays.push(`when id_pay=${payment.id_pay} then ${(fact_amount_penya + z).toFixed(2)}`);
          dates.push(`when id_pay=${payment.id_pay} then '${current_date_penya}'`);
        }

        current_amount_penya -= z;
        return {
          ...payment,
          fact_amount_penya: fact_amount_penya + z,
          fact_date_penya: current_date_penya,
        };
      } else return payment;
    });
    console.log(`${pays.join(" ")}`);
    console.log(`${dates.join(" ")}`);
    const updatePays = await pool.query(
      `update graphic_payment set fact_amount_penya = case ${pays.join(
        " "
      )} else fact_amount_penya end;`
    );
    const updateDates = await pool.query(
      `update graphic_payment set fact_date_penya = case ${dates.join(
        " "
      )} else fact_date_penya end;`
    );
    console.log(results, "results");
    response.status(200).send({ results, status: true });
  } catch {
    console.log(err);
    response.status(500).send({ message: "OOps", status: false });
  }
};

//countDebts - рассчет остатка по задолженностям и обновление статусов контрактов (Завершен/Активен)
const countDebts = async (request, response) => {
  console.log("Рассчет остатка по задолженностям");
  let d = new Date();
  d.setDate(d.getDate() - 1);
  let current_date = new Date(d);
  try {
    let arr_debt_month_pay = [],
      arr_debt_penya = [],
      arr_debt_month_penya = [],
      arr_flag_payment = [];

    let rows_contracts_active = await pool.query(
      `select contract.*, client.surname, client.name from contract, client where contract.id_client=client.id_client and contract.flag_payment=false order by id_contract;`
    );
    let results_contracts = await rows_contracts_active.rows.map(async (contract) => {
      let rows_payments = await pool.query(
        `select * from graphic_payment where id_contract=(select id_contract from contract where number_contract='${contract.number_contract}') order by plan_date_pay;`
      );
      let count_pays = 0,
        count_flags = 0;
      let pays = [];
      let results_payments = rows_payments.rows.map((payment) => {
        count_pays += 1;
        const plan_amount_pay = parseFloat(payment.plan_amount_pay);
        const fact_amount_pay = parseFloat(payment.fact_amount_pay);
        let debt_penya = parseFloat(payment.debt_penya);
        const fact_amount_penya = parseFloat(payment.fact_amount_penya);
        let debt_month_pay = parseFloat(payment.debt_month_pay);
        let debt_month_penya = parseFloat(payment.debt_month_penya);
        const plan_date_pay = new Date(payment.plan_date_pay);
        if (plan_date_pay < current_date) {
          debt_month_pay = plan_amount_pay - fact_amount_pay;
          debt_penya = debt_penya + 0.01 * debt_month_pay;
          debt_month_penya = debt_penya - fact_amount_penya;
          if (debt_month_pay != 0) {
            debt_month_pay = debt_month_pay.toFixed(2);
          }
          if (debt_penya != 0) {
            debt_penya = debt_penya.toFixed(2);
          }
          if (debt_month_penya != 0) {
            debt_month_penya = debt_month_penya.toFixed(2);
          }
          arr_debt_month_pay.push(`when id_pay=${payment.id_pay} then ${debt_month_pay}`);
          arr_debt_penya.push(`when id_pay=${payment.id_pay} then ${debt_penya}`);
          arr_debt_month_penya.push(`when id_pay=${payment.id_pay} then ${debt_month_penya}`);
        }
        if (plan_amount_pay == fact_amount_pay && debt_penya == fact_amount_penya) {
          count_flags += 1;
        }
        const obj = {
          ...payment,
          debt_month_pay: debt_month_pay,
          debt_penya: debt_penya,
          debt_month_penya: debt_month_penya,
        };
        pays.push(obj);
        return obj;
      });
      if (count_pays == count_flags) {
        contract.flag_payment = true;
        arr_flag_payment.push(
          `when id_contract=${contract.id_contract} then ${contract.flag_payment}`
        );
        sendMail_status(
          `Добрый день, ${contract.surname} ${contract.name}! Ваш кредит по контракту <i>№${contract.number_contract}</i> успешно выплачен. Надеемся на дальнейшее сотрудничество с Вами.<br><br>С уважением, SkyBank.`
        );
      }
      return { ...contract, payments: pays };
    });

    Promise.all(results_contracts).then((res) => {
      const updateFlag_Payment = pool.query(
        `update contract set flag_payment = case ${arr_flag_payment.join(
          " "
        )} else flag_payment end;`
      );
      const updateDebt_Month_Pay = pool.query(
        `update graphic_payment set debt_month_pay = case ${arr_debt_month_pay.join(
          " "
        )} else debt_month_pay end;`
      );
      const updateDebt_Month_Penya = pool.query(
        `update graphic_payment set debt_month_penya = case ${arr_debt_month_penya.join(
          " "
        )} else debt_month_penya end;`
      );
      const updateDebt_Penya = pool.query(
        `update graphic_payment set debt_penya = case ${arr_debt_penya.join(
          " "
        )} else debt_penya end;`
      );
      response.status(200).send({ results: res, status: true });
    });
  } catch (err) {
    console.log(err);
    response.status(500).send({ message: "OOps", status: false });
  }
};

const sendMail_status = async (text) => {
  let emailAccount = { user: process.env.MAIL_LOGIN, pass: process.env.MAIL_PASS };
  let transporter = nodemailer.createTransport({
    host: "smtp.mail.ru",
    port: 465,
    secure: true,
    auth: {
      user: emailAccount.user,
      pass: emailAccount.pass,
    },
  });
  console.log(transporter);

  let mailOptions = {
    from: `"SkyBank", <${emailAccount.user}>`,
    to: "abramova.polina.2001@gmail.com",
    subject: "Сообщение от SkyBank",
    text: "Сообщение от SkyBank.",
    html: `${text}`,
  };
  let result = await transporter.sendMail(mailOptions);
  console.log("Result: ", result);
};

module.exports = { getPaymentSchedule, addPaymentDebt, addPaymentPenya, countDebts };
