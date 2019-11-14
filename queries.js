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

//GET a single bank_user by id
const getBankUserById = (request, response) => {
    const id_user = parseInt(request.params.id_user)

    pool.query('select surname, name, father_name, position, login, system_role, filial.address from bank_user,filial where bank_user.id_filial=filial.id_filial and id_user = $1;', [id_user], (error, results) => {
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
}