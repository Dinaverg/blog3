let express = require('express')
let morgan = require('morgan')
let bodyParser = require('body-parser')
let jsonParser = bodyParser.json()
let app = express()
let blogRouter = require('./blogRouter')

app.use(morgan('common'))
app.use('/blog-posts', blogRouter)

app.listen(process.env.PORT || 8080, () => {
    console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});

if (require.main === module) {
    runServer().catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer}