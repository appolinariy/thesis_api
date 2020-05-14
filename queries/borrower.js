const nodemailer = require("nodemailer");
const db = require("../db");

const pool = db.pool;

//get clients
const getAllClients = (request, response) => {
  pool.query("select * from client order by surname ASC;", (error, results) => {
    if (error) {
      response.status(500).send({ message: "Something went wrong", status: false });
    }
    response.status(200).send({ data: results.rows, status: true });
  });
};

//post a new Client
const createClient = (request, response) => {
  const {
    surname,
    name,
    father_name,
    birthday,
    mail,
    phone_number,
    address,
    passport_number,
    exp_passport_date,
    passport_by,
  } = request.body;
  console.log("createClient", request.params, request.body);
  pool.query(
    "insert into client (surname, name, father_name, birthday, mail, phone_number, address, passport_number, exp_passport_date, passport_by) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning id_client",
    [
      surname,
      name,
      father_name,
      birthday,
      mail,
      phone_number,
      address,
      passport_number,
      exp_passport_date,
      passport_by,
    ],
    (error, results) => {
      if (error) {
        response.status(500).send({ message: "Something went wrong", status: false });
      }
      response.status(201).send({
        message: `Client added with ID: ${results.rows[0].id_client}`,
        id_client: results.rows[0].id_client,
        status: true,
      });
    }
  );
};

//put updated data in the Client
const updateClient = (request, response) => {
  const id_client = parseInt(request.params.id_client);
  const {
    surname,
    name,
    father_name,
    birthday,
    mail,
    phone_number,
    address,
    passport_number,
    exp_passport_date,
    passport_by,
  } = request.body;
  console.log("updateClient", request.params, request.body);
  if (id_client) {
    pool.query(
      "update client set surname = $1, name = $2, father_name = $3, birthday = $4, mail = $5, phone_number = $6, address = $7, passport_number = $8, exp_passport_date = $9, passport_by = $10 where id_client = $11",
      [
        surname,
        name,
        father_name,
        birthday,
        mail,
        phone_number,
        address,
        passport_number,
        exp_passport_date,
        passport_by,
        id_client,
      ],
      (error, results) => {
        if (error) {
          response.status(500).send({ message: "Something went wrong", status: false });
        }
        response
          .status(200)
          .send({ message: `Client modified with ID: ${id_client}`, status: true });
      }
    );
  } else {
    response.status(400).send({ message: "Empty fields", status: false });
  }
};

//delete a Сlient
const deleteClient = async (request, response) => {
  const id_client = parseInt(request.params.id_client);
  console.log("deleteClient", request.params, request.body);
  try {
    await pool.query("delete from client where id_client = $1", [id_client]);
    response.status(200).send({ message: `Client deleted with ID: ${id_client}`, status: true });
  } catch (error) {
    console.log(error);
    console.log("Something went wrong");
    response.status(500).send({ message: "Something went wrong", status: false });
  }
};

// search a client
const findClient = async (request, response) => {
  const { surname } = request.params;
  console.log("findClient", request.params, request.body);
  try {
    let results = await pool.query(
      `select client.* from client where client.surname like '%${surname}%' or client.name like '%${surname}%' or client.father_name like '%${surname}%' order by client.id_client ASC`
    );
    response.status(200).send({ data: results.rows, status: true });
  } catch (err) {
    response.status(500).send({ message: "Something went wrong", status: false });
  }
};

const sentMail = async (request, response) => {
  console.log("Рассылка электронных писем");
  let current_date = new Date();
  try {
    let rows_contracts_active = await pool.query(
      `select contract.*, client.surname, client.name from contract, client where contract.id_client=client.id_client and contract.flag_payment=false order by id_contract;`
    );
    let results_contracts = await rows_contracts_active.rows.map(async (contract) => {
      let rows_payments = await pool.query(
        `select * from graphic_payment where id_contract=(select id_contract from contract where number_contract='${contract.number_contract}') order by plan_date_pay;`
      );
      let results_payments = rows_payments.rows.map((payment) => {
        let plan_amount_pay = parseFloat(payment.plan_amount_pay);
        let fact_amount_pay = parseFloat(payment.fact_amount_pay);
        let debt_penya = parseFloat(payment.debt_penya);
        let fact_amount_penya = parseFloat(payment.fact_amount_penya);
        let debt_month_pay = parseFloat(payment.debt_month_pay);
        let debt_month_penya = parseFloat(payment.debt_month_penya);
        let plan_date_pay = new Date(payment.plan_date_pay);
        let fact_date_pay = new Date(payment.fact_date_pay);

        let timeDiff = Math.abs(plan_date_pay.getTime() - fact_date_pay.getTime());
        let day = Math.ceil(timeDiff / (1000 * 3600 * 24));
        let options = {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        };
        switch (day) {
          case 7:
            if (plan_amount_pay - fact_amount_pay == 0 && debt_penya - fact_amount_penya == 0) {
              sendMail_func(
                `Доброго времени суток, ${contract.surname} ${contract.name}! Вы успешно выплатили долг за текущий месяц по кредитному договору <i>№${contract.number_contract}</i>.<br><br>С уважением, SkyBank.`
              );
            } else {
              sendMail_func(
                `Доброго времени суток, ${contract.surname} ${
                  contract.name
                }! Через 7 дней истекает срок выплаты за текущий месяц по кредитному договору <i>№${
                  contract.number_contract
                }</i>. Вам необходимо внести выплату до <i>${plan_date_pay.toLocaleString(
                  "ru",
                  options
                )}</i>.<br>Сумма к выплате по основному долгу: ${
                  plan_amount_pay - fact_amount_pay
                } руб.<br>Сумма к выплате по пени:  ${
                  debt_penya - fact_amount_penya
                } руб.<br><br>С уважением, SkyBank.`
              );
            }
            break;
          case 3:
            if (plan_amount_pay - fact_amount_pay == 0 && debt_penya - fact_amount_penya == 0) {
              sendMail_func(
                `Доброго времени суток, ${contract.surname} ${contract.name}! Вы успешно выплатили долг за текущий месяц по кредитному договору <i>№${contract.number_contract}</i>.<br><br>С уважением, SkyBank.`
              );
            } else {
              sendMail_func(
                `Доброго времени суток, ${contract.surname} ${
                  contract.name
                }! Через 3 дня истекает срок выплаты за текущий месяц по кредитному договору <i>№${
                  contract.number_contract
                }</i>. Вам необходимо внести выплату до <i>${plan_date_pay.toLocaleString(
                  "ru",
                  options
                )}</i>.<br>Сумма к выплате по основному долгу: ${
                  plan_amount_pay - fact_amount_pay
                } руб.<br>Сумма к выплате по пени:  ${
                  debt_penya - fact_amount_penya
                } руб.<br><br>С уважением, SkyBank.`
              );
            }
            break;
        }
        if (
          current_date > plan_date_pay &&
          (plan_amount_pay - fact_amount_pay > 0 || debt_penya - fact_amount_penya > 0)
        ) {
          sendMail_func(
            `Доброго времени суток, ${contract.surname} ${
              contract.name
            }! Вы просрочили выплату за текущий месяц по кредитному договору <i>№${
              contract.number_contract
            }</i>. Выплату необходимо было внести до <i>${plan_date_pay.toLocaleString(
              "ru",
              options
            )}</i>.<br>Сумма к выплате по основному долгу: ${
              plan_amount_pay - fact_amount_pay
            } руб.<br>Сумма к выплате по пени:  ${
              debt_penya - fact_amount_penya
            } руб.<br><br>С уважением, SkyBank.`
          );
        }
      });
    });

    response.status(200).send({ message: "Отправлено письмо", status: true });
  } catch (error) {
    response.status(500).send({ message: "Something went wrong", status: false });
  }
};

const sendMail_func = async (text) => {
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

  let mailOptions = {
    from: `"SkyBank", <${emailAccount.user}>`,
    to: "abramova.polina.2001@gmail.com",
    subject: "Сообщение от SkyBank",
    text: "Сообщение от SkyBank.",
    html: `${text}`,
  };
  let result = await transporter.sendMail(mailOptions);
};

module.exports = { getAllClients, createClient, updateClient, deleteClient, findClient, sentMail };
