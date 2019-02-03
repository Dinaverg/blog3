let uuid = require('uuid');
let mongoose = require("mongoose")
mongoose.Promise = global.Promise

let authorSchema = mongoose.Schema({
    firstName: 'string',
    lastName: 'string',
    userName: {
        type: 'string',
        unique: true
    }
})

let commentSchema = mongoose.Schema({
    content: 'string'
})

let blogPostSchema = mongoose.Schema({
    title: 'string',
    date: 'date',
    content: 'string',
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'Author'},
    comments: [commentSchema]
});

blogPostSchema.pre('findOne', function(next) {
  this.populate('author');
  next();
});

blogPostSchema.pre('find', function(next) {
  this.populate('author');
  next();
});

blogPostSchema.virtual("authorString").get(function() {
    console.log(this.author)
  return `${this.author.firstName} ${this.author.lastName}`.trim()
})

blogPostSchema.methods.serialize = function() {
  return {
    title: this.title,
    content: this.content,
    author: this.authorString,
    publishDate: this.publishDate,
    comments: this.comments
  }
}

let Author = mongoose.model('Author', authorSchema)
let BlogPost = mongoose.model('BlogPost', blogPostSchema)

module.exports = {Author, BlogPost}