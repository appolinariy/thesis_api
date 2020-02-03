const db = require('../db');

const pool = db.pool;

//post bank_user by login and password
const authorization = async (request, response) => {
    const { login, password } = request.body
    try {
        let results = await pool.query('select password, id_user, system_role from bank_user where login = $1', [login]);
        if (!results.rows.length) {
            console.log('Empty RESULTS')
            response.status(400).send({ message: 'No such user', status: false })
        }
        if (results.rows[0].password !== password) {
            response.status(401).send({ message: "Incorrect password", status: false })
        }
        console.log('RESULT is ok')
        response.status(200).send({ message: 'Success', status: true, id_user: results.rows[0].id_user, system_role: results.rows[0].system_role })
    } catch (err) {
        response.status(500).send({ message: 'Something went wrong', status: false })
    }
};

module.exports = { authorization };