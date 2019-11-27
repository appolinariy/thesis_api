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

//GET a bank_users
const getAllBankUser = (request, response) => {
    pool.query('select * from bank_user order by id_user ASC;', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

//var message = iconv.encode(iconv.decode(name, "utf8"), "cp1251").toString();

//POST a new Bank User
const createBankUser = (request, response) => {
    const { surname, name, father_name, position, login, password, id_filial, system_role } = request.body

    pool.query('insert into bank_user (surname, name, father_name, position, login, password, id_filial, system_role) values ($1, $2, $3, $4, $5, $6, $7, $8) returning id_user', [surname, name, father_name, position, login, password, id_filial, system_role], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`User added with ID: ${results.rows[0].id_user}`)
    })
}
//check in terminal: curl -d "surname=Абрамова&name=Полина&father_name=Глебовна&position=Заместитель&login=abram_pol&password=pol12345&id_filial=2&system_role=Юрист" http://localhost:3000/allbankusers

//export - to access these functions from index.js
module.exports = {
    getFilials,
    getBankUserById,
    getAllBankUser,
    createBankUser,
}