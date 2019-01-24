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

    //it("she")
})