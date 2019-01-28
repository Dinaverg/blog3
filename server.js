let express = require('express')
let morgan = require('morgan')
let bodyParser = require('body-parser')
let jsonParser = bodyParser.json()
let app = express()
let blogRouter = require('./blogRouter')
let mongoose = require("mongoose");

mongoose.Promise = global.Promise;

app.use(morgan('common'))
app.use('/blogposts', blogRouter)

let {DATABASE_URL} = require("./config")
let {BlogPost} = require("./models")

/* app.listen(process.env.PORT || 8080, () => {
    console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
}); */

app.get('/', (req, res) => res.send('yo'))

let server

function runServer() {
    const port = process.env.PORT || 8080;
    return new Promise((resolve, reject) => {
      server = app
        .listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve(server);
        })
        .on("error", err => {
          reject(err);
        });
    });
  }

function closeServer() {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

if (require.main === module) {
    runServer().catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer}