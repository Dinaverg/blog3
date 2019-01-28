let uuid = require('uuid');
let mongoose = require("mongoose")

let blogPostSchema = mongoose.Schema({
  title: {type: String, required: true},
  publishDate: Date,
  content: {type: String, required: true},
  author: {
    firstName: String,
    lastName: String
  }
})

blogPostSchema.virtual("authorString").get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim()
})

blogPostSchema.methods.serialize = function() {
  return {
    title: this.title,
    content: this.content,
    author: this.authorString,
    publishDate: this.publishDate
  }
}

let BlogPost = mongoose.model('BlogPost', blogPostSchema)

module.exports = {BlogPost}