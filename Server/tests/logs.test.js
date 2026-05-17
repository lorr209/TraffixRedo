import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../app.js";

describe("GET /logs", () => {
	beforeAll(async () => {
		jest.setTimeout(8000);
		app.locals.db = await mongoose.connect(process.env.DB_URL);
	});

	afterAll(() => {
		mongoose.connection.close(true);
	}); //establish connection to db

	var token = jwt.sign(
		{ email: "Esempio@mail.com" },
		process.env.SUPER_SECRET,
		{
			expiresIn: 300,
		},
	); // create a valid token

	test("GET /logs without providing a token should return 401", async () => {
		return request(app)
			.get("/logs")
			.expect(401)
			.then((res) => {
				expect(res.body.success == false);
			});
	});

	test("GET /logs with invalid token should return 403", async () => {
		return request(app)
			.get("/logs")
			.set("x-access-token", "InvalidTokenExample")
			.set("Accept", "application/json")
			.expect(403)
			.then((res) => {
				expect(res.body.success == false);
			});
	});

	test("GET /logs with token should return 200 and the results", async () => {
		return request(app)
			.get("/logs")
			.set("x-access-token", token)
			.set("Accept", "application/json")
			.expect(200)
			.then((res) => {
				if (res.body && res.body[0]) {
					expect(res.body[0]).toEqual({
						data: "2026-01-01T00:00:00.000Z",
						utente: "6a04de6bc4596efe8f3b4fb7",
					});
				}
			});
	});
});
