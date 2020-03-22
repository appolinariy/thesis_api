//4 types queries: GET POST PUT DELETE
//export - to access these functions from index.js

const authQueries = require("./queries/auth");
const filialQueries = require("./queries/filial");
const borrowerQueries = require("./queries/borrower");
const contractQueries = require("./queries/contract");
const paymentQueries = require("./queries/payment");
const adminkaQueries = require("./queries/adminka");

module.exports = {
  ...authQueries,
  ...filialQueries,
  ...borrowerQueries,
  ...contractQueries,
  ...paymentQueries,
  ...adminkaQueries
};
