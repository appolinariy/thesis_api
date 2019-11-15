const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Bank',
    password: '12345',
    port: 5432,
})

//4 types queries: GET POST PUT DELETE

//GET all filials by id
const getFilials = (request, response) => {
    pool.query('select * from filial order by id_filial ASC', (error, results) => {
        if(error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

//GET a single bank_user by login
const getBankUserById = (request, response) => {
    const login = request.params.login
    //ecли int то parseInt(request.params.id)

    pool.query('select surname, name, father_name, position, login, system_role, filial.address from bank_user,filial where bank_user.id_filial=filial.id_filial and login = $1;', [login], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

//GET a bank_users from the one filial
const getBankUserFromFilial = (request, response) => {
    const login = request.params.login

    pool.query('select surname, name, father_name, position, login, system_role from bank_user where id_filial = (select id_filial from bank_user where login = $1);', [login], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

//export - to access these functions from index.js
module.exports = {
    getFilials,
    getBankUserById,
    getBankUserFromFilial,
}