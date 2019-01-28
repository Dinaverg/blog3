let express = require('express')
let uuid = require('uuid')
let bodyParser = require('body-parser')
let jsonParser = bodyParser.json()
let router = express.Router()
let mongoose = require("mongoose")
let {DATABASE_URL} = require("./config")
let {BlogPost} = require("./models")

mongoose.Promise = global.Promise
mongoose.connect(DATABASE_URL, {useNewUrlParser: true})

router.get("/posts", (req, res) => {
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
    console.log("Retreiving posts")
    res.status(200)
})

router.get("/posts/:id", (req, res) => {
    BlogPost.findById(req.params.id)
    .then(blogPost => res.json(blogPost.serialize()))
    .catch(err => {
        console.error(err)
        res.status(500).json({message: "Internal server error"})
    })
    console.log("Retreiving identified post")
    res.status(200)
})

router.post('/posts', jsonParser, (req, res) => {
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
        "title": req.body.title,
        "content": req.body.content,
        "author": req.body.author, 
        "date": req.body.publishDate
    })
    .then(blogPost => res.status(201).json(blogPost.serialize()))
    .catch(err => {
        console.error(err)
        res.status(500).json({message: "internal server error"})
    })
    console.log(`Creating blog post`)
})

router.put('/posts/:id', jsonParser, (req, res) => {
    let updated = {}
    let fields = ["title", "content", "author"]
    for (let i=0; i < fields.length; i++) {
        let field = fields[i]
        if (field in req.body) {
            updated[field] = req.body[field]
        }
    }
    if (req.params.id !== req.body.id) {
        let message = (`request path id (${req.params.id}) and request body id (${req.body.id}) must match`)
        console.error(message)
        return res.status(400).send(message)
    }
    BlogPost.findByIdAndUpdate(req.params.id, {$set: updated})
    .then(res.status(203).send(`Updating blog post ${req.params.id}`))
    .catch(err => res.status(500).json({message: "Internal server error"}))
    console.log(`Updating blog post ${req.params.id}`)
})

router.delete('/posts/:id', (req, res) => {
    BlogPost.findByIdAndRemove(req.params.id)
    .then(res.status(204).end())
    .catch(err => {
        console.error(err)
        res.status(500).json({message: "internal server error"})
    })
    console.log(`Deleted blog post ${req.params.id}`)
})

module.exports = router