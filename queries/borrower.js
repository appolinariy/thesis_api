const db = require("../db");

const pool = db.pool;

//get clients
const getAllClients = (request, response) => {
  pool.query("select * from client order by id_client ASC;", (error, results) => {
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
    passport_by
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
      passport_by
    ],
    (error, results) => {
      if (error) {
        response.status(500).send({ message: "Something went wrong", status: false });
      }
      response.status(201).send({
        message: `Client added with ID: ${results.rows[0].id_client}`,
        id_client: results.rows[0].id_client,
        status: true
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
    passport_by
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
        id_client
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
const deleteClient = (request, response) => {
  const id_client = parseInt(request.params.id_client);
  cconsole.log("deleteClient", request.params, request.body);
  pool.query("delete from client where id_client = $1", [id_client], (error, results) => {
    if (error) {
      response.status(500).send({ message: "Something went wrong", status: false });
    }
    response.status(200).send({ message: `Client deleted with ID: ${id_client}`, status: true });
  });
};

// search a client - положить в экспорт еще
const findClient = async (request, response) => {
  const { surname } = request.params;
  console.log("findClient", request.params, request.body);
  try {
    let results = await pool.query(
      `select client.* from client where client.surname like '%${surname}%' order by client.id_client ASC`
    );
    response.status(200).send({ data: results.rows, status: true });
  } catch (err) {
    response.status(500).send({ message: "Something went wrong", status: false });
  }
};

module.exports = { getAllClients, createClient, updateClient, deleteClient, findClient };
