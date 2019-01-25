let chai = require("chai")
let chaiHttp = require("chai-http");

let {app, runServer, closeServer} = require("../server");

const expect = chai.expect;

chai.use(chaiHttp);

describe("Blog Posts", function() {

    before(function() {
        return runServer()
    })

    after(function() {
        return closeServer()
    })

    it("should list blog posts on GET", function() {
        return chai.request(app).get('/blog-posts')
        .then(function(res) {
            expect(res).to.have.status(200)
            expect(res).to.be.json
            expect(res.body).to.be.an("array")
            expect(res.body.length).to.be.at.least(1)
            let expectedKeys = ["id", "title", "content", "author", "publishDate"]
            res.body.forEach(function(post) {
                expect(post).to.be.an("object")
                expect(post).to.include.keys(expectedKeys)
            })
        })
    })

    it("should create a new blog post on POST", function() {
        let newItem = {
            "title": "bizz",
            "content": "bizz rounds out the trio of...",
            "author": "DMW"
        }
        return chai.request(app).post("/blog-posts").send(newItem)
        .then(function(res) {
            expect(res).to.have.status(201)
            expect(res).to.be.json
            expect(res.body).to.be.an("object")
            expect(res.body).to.include.keys("title", "content", "author")
            console.log(res.body)
            expect(res.body.id).to.not.equal(null)
        })
    })

    it("should update a post on PUT", function() {
        let updateData = {
            title: "bang",
            content: "in fact, with bang, the total number...",
            author: "DMW"
        }
        return (chai.request(app).get("/blog-posts")
        .then(function(res) {
            updateData.id = res.body[0].id
            return chai.request(app).put(`/blog-posts/${updateData.id}`).send(updateData)
        })
        .then(function(res) {
            expect(res).to.have.status(203)
            expect(res).to.be.json
            expect(res.body).to.be.an("object")
            expect(res.body).to.deep.equal(updateData)
        })
        )
    })

    it("should delete a post on DELETE", function() {
        return (chai.request(app).get("/blog-posts")
        .then(function(res) {
            return chai.request(app).delete(`/blog-posts/${res.body[0].id}`)
        })
        .then(function(res) {
            expect(res).to.have.status(204)
        }))
    })
})