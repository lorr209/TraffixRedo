import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import User from "../routers/models/user.js";
import mongoose from "mongoose";
import app from "../app.js";

let userSpyFindOne;

const mockUsers = [
	{
		_id: "000000000000000000000000",
		attivo: true,
		email: "fakeuser1@mail.com",
		password: "$2b$04$Wytnlm.opUBch7M9LrRysOYmtY.qrDEqJLUjDUsPk7btuH.eUfy8O",
		nome: "fake",
		cognome: "uno",
		creato: "2000-00-00T00:00:00.000Z",
		ruolo: "aaaaaaaaaaaaaaaaaaaaaaaa",
	},
	{
		_id: "111111111111111111111111",
		attivo: true,
		email: "fakeuser2@mail.com",
		password: "$2b$04$wLwrV96rZcVvi0dPjmiTz.t3L47y1l.h7zK9m1rgGvIWqPvW2GLKy",
		nome: "fake",
		cognome: "due",
		creato: "2000-00-00T00:00:00.000Z",
		ruolo: "bbbbbbbbbbbbbbbbbbbbbbbb",
	},
	{
		_id: "222222222222222222222222",
		attivo: false,
		email: "fakeuser3@mail.com",
		password: "$2b$04$yjTAmqz4F9mlNU/6Sk7Fduc51zf79cPkoFz17/2v/Of8sES99XCki",
		nome: "fake",
		cognome: "tre",
		creato: "2000-00-00T00:00:00.000Z",
		ruolo: "cccccccccccccccccccccccc",
	},
];

beforeAll(() => {
	userSpyFindOne = jest
		.spyOn(User, "findOne")
		.mockImplementation(async (query) => {
			const result = mockUsers.filter((user) => {
				if (!query || Object.keys(query).lenght === 0) {
					return true;
				} else {
					return Object.keys(query).every((key) => user[key] === query[key]);
				}
			});
			return result[0];
		});
});

afterAll(async () => {
	userSpyFindOne.mockRestore();
});

describe("POST /auth", () => {
	// * Testa 400 (/auth)
	test("POST /auth with incorrect argumets should return 400", async () => {
		return request(app)
			.post("/auth")
			.set("Content-Type", "application/json")
			.send({})
			.expect(400)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 404 (/auth)
	test("POST /auth providing a non existing mail should return 404", async () => {
		return request(app)
			.post("/auth")
			.set("Accept", "application/json")
			.send({ email: "fakeuser4@mail.com", password: "password4" })
			.expect(404)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 401 (/auth)
	test("POST /auth without providing the correct password should return 401", async () => {
		return request(app)
			.post("/auth")
			.set("Accept", "application/json")
			.send({ email: "fakeuser1@mail.com", password: "WrongPassword" })
			.expect(401)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 200 (/auth)
	test("POST /auth with correct credentials should return 200", async () => {
		return request(app)
			.post("/auth")
			.set("Content-Type", "application/json")
			.send({
				email: "fakeuser1@mail.com",
				password: "password1",
			})
			.expect(200)
			.then((res) => {
				expect(res.body.success).toEqual(true);
			});
	});
});
