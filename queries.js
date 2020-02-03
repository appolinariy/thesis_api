//4 types queries: GET POST PUT DELETE
// const Pool = require('pg').Pool
// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'Bank',
//     password: '12345',
//     port: 5432,
// })

// //MODULE AUTHORIZATION
// //post bank_user by login and password
// const authorization = async (request, response) => {
//     const { login, password } = request.body
//     try {
//         let results = await pool.query('select password, id_user, system_role from bank_user where login = $1', [login]);
//         if (!results.rows.length) {
//             console.log('Empty RESULTS')
//             response.status(400).send({ message: 'No such user', status: false })
//         }
//         if (results.rows[0].password !== password) {
//             response.status(401).send({ message: "Incorrect password", status: false })
//         }
//         console.log('RESULT is ok')
//         response.status(200).send({ message: 'Success', status: true, id_user: results.rows[0].id_user, system_role: results.rows[0].system_role })
//     } catch (err) {
//         response.status(500).send({ message: 'Something went wrong', status: false })
//     }
// }

// //MODULE FILIALS
// //get all filials by id - Fillials
// const getFilials = (request, response) => {
//     pool.query('select * from filial order by id_filial ASC', (error, results) => {
//         if (error) {
//             response.status(500).send({ message: 'Something went wrong', status: false });
//         }
//         response.status(200).send({ data: results.rows, status: true })
//     })
// }

// //MODULE CLIENTS
// //get clients
// const getAllClients = (request, response) => {
//     pool.query('select * from client order by id_client ASC;', (error, results) => {
//         if (error) {
//             response.status(500).send({ message: 'Something went wrong', status: false });
//         }
//         results.rows.map(row => {
//             row.birthday = row.birthday.toLocaleDateString();
//             row.exp_passport_date = row.exp_passport_date.toLocaleDateString();
//         })
//         response.status(200).send({ data: results.rows, status: true })
//     })
// }

// //post a new Client
// const createClient = (request, response) => {
//     const { surname, name, father_name, birthday, mail, phone_number, address, passport_number, exp_passport_date, passport_by } = request.body
//     pool.query('insert into client (surname, name, father_name, birthday, mail, phone_number, address, passport_number, exp_passport_date, passport_by) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning id_client',
//         [surname, name, father_name, birthday, mail, phone_number, address, passport_number, exp_passport_date, passport_by],
//         (error, results) => {
//             if (error) {
//                 response.status(500).send({ message: 'Something went wrong', status: false });
//             }
//             response.status(201).send({ message: `Client added with ID: ${results.rows[0].id_client}`, id_client: results.rows[0].id_client, status: true })
//         })
// }

// //put updated data in the Client
// const updateClient = (request, response) => {
//     const id_client = parseInt(request.params.id_client)
//     const { surname, name, father_name, birthday, mail, phone_number, address, passport_number, exp_passport_date, passport_by } = request.body
//     if (id_client) {
//         pool.query(
//             'update client set surname = $1, name = $2, father_name = $3, birthday = $4, mail = $5, phone_number = $6, address = $7, passport_number = $8, exp_passport_date = $9, passport_by = $10 where id_client = $11',
//             [surname, name, father_name, birthday, mail, phone_number, address, passport_number, exp_passport_date, passport_by, id_client],
//             (error, results) => {
//                 if (error) {
//                     response.status(500).send({ message: 'Something went wrong', status: false });
//                 }
//                 response.status(200).send({ message: `Client modified with ID: ${id_client}`, status: true })
//             }
//         )
//     } else {
//         response.status(400).send({ message: 'Empty fields', status: false });
//     }
// }

// //delete a Сlient
// const deleteClient = (request, response) => {
//     const id_client = parseInt(request.params.id_client)
//     console.log(id_client);
//     pool.query('delete from client where id_client = $1', [id_client], (error, results) => {
//         if (error) {
//             response.status(500).send({ message: 'Something went wrong', status: false });
//         }
//         response.status(200).send({ message: `Client deleted with ID: ${id_client}`, status: true })
//     })
// }

// //search a client
// // const findClient = async (request, response) => {
// //     const { surname } = request.params
// //     console.log('findClient', request.params)
// //     try {
// //         let results = await pool.query(`select client.* from client where client.surname like '%${surname}%' order by client.id_client ASC`)
// //         console.log('results SearchClient', results.rows)
// //         response.status(200).send({ data: results.rows, status: true });
// //     } catch (err) {
// //         response.status(500).send({ message: 'Something went wrong', status: false });
// //     }
// // }

// //MODULE ADMINISTRATION
// //get a single bank_user by id
// const getBankUserById = (request, response) => {
//     const id_user = request.params.id_user
//     pool.query('select surname, name, father_name, position, login, system_role, filial.address from bank_user,filial where bank_user.id_filial=filial.id_filial and id_user = $1;', [id_user], (error, results) => {
//         if (error) {
//             response.status(500).send({ message: 'Something went wrong', status: false });
//         }
//         response.status(200).send({ data: results.rows, status: true })
//     })
// }

// //get bank_users
// const getAllBankUser = async (request, response) => {
//     try {
//         let results = await pool.query('select bank_user.*, filial.address FROM BANK_USER join filial on filial.id_filial = bank_user.id_filial order by bank_user.id_user ASC')
//         let filials = await pool.query('select address, id_filial from filial');
//         response.status(200).send({ data: results.rows, status: true, filials: filials.rows });
//     } catch (err) {
//         response.status(500).send({ message: 'Something went wrong', status: false });
//         console.log(err);
//     }
// }

// //post a new Bank User - доделать
// const createBankUser = (request, response) => {
//     console.log('createBankUser', request.body, request.params);
//     const { surname, name, father_name, position, login, password, address, system_role } = request.body
//     pool.query('insert into bank_user (surname, name, father_name, position, login, password, id_filial, system_role) values ($1, $2, $3, $4, $5, $6, (select id_filial from filial where address = $7), $8) returning id_user', [surname, name, father_name, position, login, password, address, system_role], (error, results) => {
//         console.log('results', results.rows)
//         if (error) {
//             response.status(500).send({ message: 'Something went wrong', status: false });
//         }
//         response.status(201).send({ message: `User added with ID: ${results.rows[0].id_user}`, id_user: results.rows[0].id_user, status: true })
//     })
// }

// //delete a Bank User
// const deleteBankUser = (request, response) => {
//     const id_user = parseInt(request.params.id_user)
//     console.log(id_user);
//     pool.query('delete from bank_user where id_user = $1', [id_user], (error, results) => {
//         if (error) {
//             response.status(500).send({ message: 'Something went wrong', status: false });
//         }
//         response.status(200).send({ message: `User deleted with ID: ${id_user}`, status: true })
//     })
// }

// //put updated data in the Bank User
// const updateBankUser = (request, response) => {
//     const id_user = parseInt(request.params.id_user)
//     const { surname, name, father_name, position, login, password, id_filial, system_role } = request.body
//     if (id_filial && login && id_user) {
//         pool.query(
//             'update bank_user set surname = $1, name = $2, father_name = $3, position = $4, login = $5, password = $6, id_filial = $7, system_role = $8 where id_user = $9',
//             [surname, name, father_name, position, login, password, id_filial, system_role, id_user],
//             (error, results) => {
//                 if (error) {
//                     response.status(500).send({ message: 'Something went wrong', status: false });
//                 }
//                 response.status(200).send({ message: `User modified with ID: ${id_user}`, status: true })
//             }
//         )
//     } else {
//         response.status(400).send({ message: 'Empty fields', status: false });
//     }
// }

// //search data in the Bank User
// const findBankUser = async (request, response) => {
//     const { surname } = request.params
//     // console.log('findBankUser', request.params)
//     try {
//         let results = await pool.query(`select bank_user.*, filial.address FROM BANK_USER join filial on filial.id_filial = bank_user.id_filial where bank_user.surname like '%${surname}%' order by bank_user.id_user ASC`)
//         let filials = await pool.query('select address, id_filial from filial');
//         // console.log('results', results.rows)
//         response.status(200).send({ data: results.rows, status: true, filials: filials.rows });
//     } catch (err) {
//         response.status(500).send({ message: 'Something went wrong', status: false });
//     }
// }

//export - to access these functions from index.js

const authQueries = require('./queries/auth');
const filialQueries = require('./queries/filial');
const borrowerQueries = require('./queries/borrower');
const debtQueries = require('./queries/debt');
const adminkaQueries = require('./queries/adminka');

module.exports = {
    ...authQueries,
    ...filialQueries,
    ...borrowerQueries,
    ...debtQueries,
    ...adminkaQueries
};