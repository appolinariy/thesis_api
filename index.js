const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const db = require('./queries')
const port = 3000

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true
    })
)
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.post('/auth', db.authorization)
app.get('/filials', db.getFilials)
app.get('/allclients', db.getAllClients)
app.get('/bankuser/:id_user', db.getBankUserById)
app.get('/allbankusers', db.getAllBankUser)
app.post('/allbankusers', db.createBankUser)
app.delete('/allbankusers/:id_user', db.deleteBankUser)
app.put('/allbankusers/:id_user', db.updateBankUser)

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})