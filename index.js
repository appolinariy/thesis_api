const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3001;

const queries = require("./queries");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

//Auth
app.post("/auth", queries.authorization);

//Filial
app.get("/filials", queries.getFilials);

//Client
app.get("/allclients", queries.getAllClients);
app.post("/allclients", queries.createClient);
app.put("/allclients/:id_client", queries.updateClient);
app.delete("/allclients/:id_client", queries.deleteClient);
app.get("/findclients/:surname", queries.findClient);

// Contract

// Payment

//Adminka
app.get("/bankuser/:id_user", queries.getBankUserById);
app.get("/allbankusers", queries.getAllBankUser);
app.post("/allbankusers", queries.createBankUser);
app.delete("/allbankusers/:id_user", queries.deleteBankUser);
app.put("/allbankusers/:id_user", queries.updateBankUser);
app.get("/findbankuser/:surname", queries.findBankUser);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
