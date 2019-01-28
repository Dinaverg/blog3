let express = require('express')
let uuid = require('uuid')
let bodyParser = require('body-parser')
let jsonParser = bodyParser.json()
let router = express.Router()
let mongoose = require("mongoose")
let {BlogPosts} = require('./models.js')
let {DATABASE_URL} = require("./config")
let {BlogPost} = require("./models")

mongoose.Promise = global.Promise
mongoose.connect(DATABASE_URL)

//BlogPost.create("Foo", "foo is a computer programming concept which...", "DMW")
//BlogPost.create("Bar", "Bar is an alternative concept that specifies...", "DMW")
/* 
router.get("/", (req, res) => {
    res.send("yo")
}) */

router.post('/', (req, res) => {
    let requiredFields = ["title", "content", "author"]
    for (let i=0; i < requiredFields.length; i++) {
        let field = requiredFields[i]
        if (!(field in req.body)) {
            let message = `Missing ${field} in request body`
            console.error(message)
            return res.status(400).send(message)
        }
    }
    BlogPost.create({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author, 
        date: req.body.publishDate
    })
    .then(blogPost => res.status(201).json(blogPost.serialize()))
    .catch(err => {
        console.error(err)
        res.status(500).json({message: "internal server error"})
    })
    console.log(`Creating blog post`)
    res.status(201).json(item)
})

router.get('/', (req, res) => {
    let filters = {};
    let queryableFields = ["title", "content", "publishDate"];
    queryableFields.forEach(field => {
        if (req.query[field]) {
            filters[field] = req.query[field];
        }
    });
    BlogPost.find(filters)
    .then(BlogPost => res.json(
        BlogPost.map(blogPost => blogPost.serialize())
    ))
    .catch(err => {
        console.error(err)
        res.status(500).json({message: "Internal server error"})
    })
})

/* router.post('/', jsonParser, (req, res) => {
    let requiredFields = ["title", "content", "author"]
    for (let i=0; i < requiredFields.length; i++) {
        let field = requiredFields[i]
        if (!(field in req.body)) {
            let message = `Missing ${field} in request body`
            console.error(message)
            return res.status(400).send(message)
        }
    }
    let item = BlogPosts.create(req.body.title, req.body.content, req.body.author, req.body.publishDate)
    console.log(`Creating blog post`)
    res.status(201).json(item)
}) */

router.put('/:id', jsonParser, (req, res) => {
    let requiredFields = ["title", "content", "author"]
    for (let i=0; i < requiredFields.length; i++) {
        let field = requiredFields[i]
        if (!(field in req.body)) {
            let message = `Missing ${field} in request body`
            console.error(message)
            return res.status(400).send(message)
        }
    }
    if (req.params.id !== req.body.id) {
        let message = (`request path id (${req.params.id}) and request body id (${req.body.id}) must match`)
        console.error(message)
        return res.status(400).send(message)
    }
    console.log(`Updating blog post ${req.params.id}`)
    let updatedPost = BlogPosts.update({
        id: req.params.id,
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        publishDate: req.body.publishDate
    })
    res.status(203).send(updatedPost)
})

router.delete('/:id', (req, res) => {
    BlogPosts.delete(req.params.id)
    console.log(`Deleted blog post ${req.params.id}`)
    res.status(204).end()
})

module.exports = router