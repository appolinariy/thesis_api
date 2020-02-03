const db = require('../db');

const pool = db.pool;

//get a single bank_user by id
const getBankUserById = (request, response) => {
    const id_user = request.params.id_user
    pool.query('select surname, name, father_name, position, login, system_role, filial.address from bank_user,filial where bank_user.id_filial=filial.id_filial and id_user = $1;', [id_user], (error, results) => {
        if (error) {
            response.status(500).send({ message: 'Something went wrong', status: false });
        }
        response.status(200).send({ data: results.rows, status: true })
    })
}

//get bank_users
const getAllBankUser = async (request, response) => {
    try {
        let results = await pool.query('select bank_user.*, filial.address FROM BANK_USER join filial on filial.id_filial = bank_user.id_filial order by bank_user.id_user ASC')
        let filials = await pool.query('select address, id_filial from filial');
        response.status(200).send({ data: results.rows, status: true, filials: filials.rows });
    } catch (err) {
        response.status(500).send({ message: 'Something went wrong', status: false });
        console.log(err);
    }
}

//post a new Bank User - доделать
const createBankUser = (request, response) => {
    console.log('createBankUser', request.body, request.params);
    const { surname, name, father_name, position, login, password, address, system_role } = request.body
    pool.query('insert into bank_user (surname, name, father_name, position, login, password, id_filial, system_role) values ($1, $2, $3, $4, $5, $6, (select id_filial from filial where address = $7), $8) returning id_user', [surname, name, father_name, position, login, password, address, system_role], (error, results) => {
        console.log('results', results.rows)
        if (error) {
            response.status(500).send({ message: 'Something went wrong', status: false });
        }
        response.status(201).send({ message: `User added with ID: ${results.rows[0].id_user}`, id_user: results.rows[0].id_user, status: true })
    })
}

//delete a Bank User
const deleteBankUser = (request, response) => {
    const id_user = parseInt(request.params.id_user)
    console.log(id_user);
    pool.query('delete from bank_user where id_user = $1', [id_user], (error, results) => {
        if (error) {
            response.status(500).send({ message: 'Something went wrong', status: false });
        }
        response.status(200).send({ message: `User deleted with ID: ${id_user}`, status: true })
    })
}

//put updated data in the Bank User
const updateBankUser = (request, response) => {
    const id_user = parseInt(request.params.id_user)
    const { surname, name, father_name, position, login, password, id_filial, system_role } = request.body
    if (id_filial && login && id_user) {
        pool.query(
            'update bank_user set surname = $1, name = $2, father_name = $3, position = $4, login = $5, password = $6, id_filial = $7, system_role = $8 where id_user = $9',
            [surname, name, father_name, position, login, password, id_filial, system_role, id_user],
            (error, results) => {
                if (error) {
                    response.status(500).send({ message: 'Something went wrong', status: false });
                }
                response.status(200).send({ message: `User modified with ID: ${id_user}`, status: true })
            }
        )
    } else {
        response.status(400).send({ message: 'Empty fields', status: false });
    }
}

//search data in the Bank User
const findBankUser = async (request, response) => {
    const { surname } = request.params
    // console.log('findBankUser', request.params)
    try {
        let results = await pool.query(`select bank_user.*, filial.address FROM BANK_USER join filial on filial.id_filial = bank_user.id_filial where bank_user.surname like '%${surname}%' order by bank_user.id_user ASC`)
        let filials = await pool.query('select address, id_filial from filial');
        // console.log('results', results.rows)
        response.status(200).send({ data: results.rows, status: true, filials: filials.rows });
    } catch (err) {
        response.status(500).send({ message: 'Something went wrong', status: false });
    }
}

module.exports = { getBankUserById, getAllBankUser, createBankUser, deleteBankUser, updateBankUser, findBankUser };