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

// send e-mail to borrowers
const sentMail = async (request, response) => {
  console.log("Рассылка электронных писем");
  try {
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
      to: "abramova.polina.2001@gmail.com, you.awecome@gmail.com",
      subject: "Сообщение от SkyBank",
      text: "Сообщение от SkyBank.",
      html:
        "Добрый день, <i>Алиса Андреевна</i>!<br>Приглашаем Вас взять кредит в нашем банке на оплату обучения в Университете ИТМО. Будет рады видеть Вас в кругу наших заемщиков. <br><br> С уважением, SkyBank.",
    };
    let result = await transporter.sendMail(mailOptions);

    console.log("Result: ", result);
    console.log("Preview URL: ", nodemailer.getTestMessageUrl(result));
    response.status(200).send({ message: "Отправлено письмо", result: result, status: true });
  } catch (error) {
    response.status(500).send({ message: "Something went wrong", status: false });
  }
};

module.exports = { getAllClients, createClient, updateClient, deleteClient, findClient, sentMail };
