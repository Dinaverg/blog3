let express = require('express')
let uuid = require('uuid')
let morgan = require('morgan')
let router = express.Router()
let bodyParser = require('body-parser')
let jsonParser = bodyParser.json()
let app = express()

app.use(morgan('common'))

app.listen(process.env.PORT || 8080, () => {
    console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});