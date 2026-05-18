import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import Logs from "../routers/models/log.js";
import mongoose from "mongoose";
import app from "../app.js";

const mockLogs = [
	{
		_id: "000000000000000000000000",
		data: "2000-00-00T00:00:00.000Z",
		utente: "aaaaaaaaaaaaaaaaaaaaaaaa",
	},
	{
		_id: "111111111111111111111111",
		data: "2000-00-00T00:00:00.000Z",
		utente: "bbbbbbbbbbbbbbbbbbbbbbbb",
	},
	{
		_id: "222222222222222222222222",
		data: "2010-00-00T00:00:00.000Z",
		utente: "aaaaaaaaaaaaaaaaaaaaaaaa",
	},
];

var token = jwt.sign({ email: "Esempio@mail.com" }, process.env.SUPER_SECRET, {
	expiresIn: 300,
});

beforeAll(() => {
	logsSpy = jest.spyOn(Logs, "find").mockImplementation(async (query) => {
		return mockLogs.filter((log) => {
			if (!query || Object.keys(query).lenght === 0) {
				return true;
			} else {
				return Object.keys(query).every((key) => log[key] === query[key]);
			}
		});
	});
});

afterAll(async () => {
	logsSpy.mockRestore();
});

describe("GET /logs", () => {
	test("GET /logs without providing a token should return 401", async () => {
		return request(app)
			.get("/logs")
			.expect(401)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	test("GET /logs with invalid token should return 403", async () => {
		return request(app)
			.get("/logs")
			.set("x-access-token", "InvalidTokenExample")
			.set("Content-Type", "application/json")
			.expect(403)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	test("GET /logs with token should return 200 and the results", async () => {
		return request(app)
			.get("/logs")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(200)
			.then((res) => {
				if (res.body && res.body[0]) {
					expect(res.body[0]).toEqual({
						data: "2000-00-00T00:00:00.000Z",
						utente: "aaaaaaaaaaaaaaaaaaaaaaaa",
					});
				}
			});
	});

	test("GET /logs with token and provided id for filtering should return 200 and the results", async () => {
		return request(app)
			.get("/logs?id=aaaaaaaaaaaaaaaaaaaaaaaa")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(200)
			.then((res) => {
				if (res.body) {
					expect(res.body).toEqual([
						{
							data: "2000-00-00T00:00:00.000Z",
							utente: "aaaaaaaaaaaaaaaaaaaaaaaa",
						},
						{
							data: "2010-00-00T00:00:00.000Z",
							utente: "aaaaaaaaaaaaaaaaaaaaaaaa",
						},
					]);
				}
			});
	});
});
