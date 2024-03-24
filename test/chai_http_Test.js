
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);

describe("Login and Access Control Test", () => {
	it('should return 403 status code for unauthorized access to "http://localhost:8080/urls/b2xVn2"', () => {
		const agent = chai.request.agent("http://localhost:8080");

		// Step 1: Login with valid credentials
		return agent
			.post("/login")
			.send({ email: "email@e.e", password: "password" })
			.then((loginRes) => {
				// Step 2: Make a GET request to a protected resource
				return agent.get("/urls/b2xVn2").then((accessRes) => {
					// Step 3: Expect the status code to be 403
					expect(accessRes).to.have.status(403);
				});
			});;
	});

	it('should redirect user to /login if they are not logged in', () => {
		const agent = chai.request.agent("http://localhost:8080");

		return agent
			//Step 1: Make a GET request to http://localhost:8080/urls
			.get("/urls")
			//Step 2: Expect to be redirected to http://localhost:8080/login
			.then((res) => {
				expect(res).to.redirectTo("/login"),
				//Step 3: Expect status code to be 302
				expect(res).to.have.status(302);
			});
	});

	it('should redirect if user is not logged in', () => {
		const agent = chai.request.agent("http://localhost:8080");

		return agent
			//Step 1: Make a GET request to http://localhost:3000/urls/new
			.get("/urls/new")
			//Step 2: Expect to be redirected to http://localhost:8080/login
			.then((res) => {
				expect(res).toRedirectTo("/login");
				//Step 3: Expect the status code to be 302
				expect(res).to.have.status(302);
			});
	});

	it("should see an error message if user is not logged in", () => {
		const agent = chai.request.agent("http://localhost:8080");

		return agent
		//Step 1: Make a GET request to "http://localhost:3000/urls/NOTEXISTS"
		.get("/urls/NOTEXISTS")
		//Step 2: Expect the status code to be 404
		.then((res) => {
			expect(res).to.have.status(404)
		})
	});

	it("should see an error message if the URL belong to the user", () => {
		const agent = chai.request.agent("http://localhost:8080");

		return agent
		//Step 1: Make an unauthorized request to http://localhost:3000/urls/b2xVn2
		.get("/urls/b2xVn2")
		.then((res) => {
		//Step 2: Expect the status code to be 403
			expect(res).to.have.status(403)
		})
	});
});
