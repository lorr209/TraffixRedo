import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";

var token = jwt.sign(
	{ email: "fakeuser1@mail.com" },
	process.env.SUPER_SECRET,
	{
		expiresIn: 300,
	},
);

describe("Basic definition", () => {
	test("app module should be defined", () => {
		expect(app).toBeDefined();
	});
});

describe("GET /login.html", () => {
	test("GET /login.html should return 200", () => {
		return request(app).get("/login.html").expect(200);
	});
});

describe("GET /", () => {
	test("GET / without token should return 401", () => {
		return request(app).get("/").expect(401);
	});

	test("GET / without token by a browser should return 302", () => {
		return request(app).get("/").set("Accept", "text/html").expect(302);
	});

	test("GET / with an invalid token should return 403", () => {
		return request(app)
			.get("/")
			.set("x-access-token", "InvalidToken")
			.set("Content-Type", "application/json")
			.expect(403);
	});

	test("GET / with an invalid token by a browser should return 302", () => {
		return request(app)
			.get("/")
			.set("x-access-token", "InvalidToken")
			.set("Accept", "text/html")
			.set("Content-Type", "application/json")
			.expect(302);
	});

	test("GET / with token should return 200", () => {
		return request(app)
			.get("/")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(200);
	});
});
