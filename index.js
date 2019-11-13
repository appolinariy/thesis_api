const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const db = require('./queries')
const port = 3000

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})

//get response from queries
app.get('/filials',db.getFilials)
app.get('/bankuser/:id_user', db.getBankUserById)

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})