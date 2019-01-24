let chai = require("chai")
let chaiHttp = require("chai-http");

let {app, runServer, closeServer} = require("../server");

const expect = chai.expect;

chai.use(chaiHttp);