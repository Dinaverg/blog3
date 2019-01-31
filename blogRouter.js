let express = require('express')
let uuid = require('uuid')
let bodyParser = require('body-parser')
let jsonParser = bodyParser.json()
let router = express.Router()
let mongoose = require("mongoose")
let {DATABASE_URL, PORT} = require("./config")
let {BlogPost, Author} = require("./models")

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
    .then(blogPosts => {
        res.json(blogPosts.forEach(blogPost => {
            console.log(blogPost)
            blogPost.serialize()
        })
    )})
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
    let requiredFields = ["title", "content", "author_id"]
    for (let i=0; i < requiredFields.length; i++) {
        let field = requiredFields[i]
        if (!(field in req.body)) {
            let message = `Missing ${field} in request body`
            console.error(message)
            return res.status(400).send(message)
        }
    }
    Author.findById(req.body.author_id)
    .then(author => {
        BlogPost.create({
            "title": req.body.title,
            "content": req.body.content,
            "author": author
        })
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

router.get('/authors', (req, res) => {
    Author.find()
    .then(authors => {
        res.status(200).json(authors.map(function(author) {
            return {
                id: author.id,
                name: `${author.firstName} ${author.lastName}`,
                userName: author.userName
            }
        }))
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({message: "internal server error"});
    });
})

router.post('/authors', (req, res) => {
    let requiredFields = ['firstName', 'lastName', 'userName'];
    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            let message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    });

    Author.findOne({userName: req.body.userName})
    .then(author => {
        if (author) {
            let message = `Username already taken`;
            console.error(message);
            return res.status(400).send(message);
        } else {
        Author.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName
        })
        .then(author => res.status(201).json({
            _id: author.id,
            name: `${author.firstName} ${author.lastName}`,
            userName: author.userName
        }))
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
          });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went horribly awry' });
    });
})

app.put('/authors/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
      res.status(400).json({
        error: 'Request path id and request body id values must match'
      });
    }
  
    const updated = {};
    const updateableFields = ['firstName', 'lastName', 'userName'];
    updateableFields.forEach(field => {
      if (field in req.body) {
        updated[field] = req.body[field];
      }
    });
  
    Author
      .findOne({ userName: updated.userName || '', _id: { $ne: req.params.id } })
      .then(author => {
        if(author) {
          const message = `Username already taken`;
          console.error(message);
          return res.status(400).send(message);
        }
        else {
          Author
            .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
            .then(updatedAuthor => {
              res.status(200).json({
                id: updatedAuthor.id,
                name: `${updatedAuthor.firstName} ${updatedAuthor.lastName}`,
                userName: updatedAuthor.userName
              });
            })
            .catch(err => res.status(500).json({ message: err }));
        }
      });
  });
  
  
  app.delete('/authors/:id', (req, res) => {
    BlogPost
      .remove({ author: req.params.id })
      .then(() => {
        Author
          .findByIdAndRemove(req.params.id)
          .then(() => {
            console.log(`Deleted blog posts owned by and author with id \`${req.params.id}\``);
            res.status(204).json({ message: 'success' });
          });
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'something went terribly wrong' });
      });
  });
  

module.exports = router