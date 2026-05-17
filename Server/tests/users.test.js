import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import User from "../routers/models/user.js";
import Role from "../routers/models/role.js";
import mongoose from "mongoose";
import app from "../app.js";

const {
	Types: { ObjectId },
} = mongoose;

let userSpy;
let userSpyFindById;
let userSpySave;
let userSpyFindByIdAndUpdate;
let roleSpyFindById;

const mockUsers = [
	{
		_id: "000000000000000000000000",
		attivo: true,
		email: "fakeuser1@mail.com",
		nome: "fake",
		cognome: "uno",
		creato: "2000-00-00T00:00:00.000Z",
		ruolo: "aaaaaaaaaaaaaaaaaaaaaaaa",
	},
	{
		_id: "111111111111111111111111",
		attivo: true,
		email: "fakeuser2@mail.com",
		nome: "fake",
		cognome: "due",
		creato: "2000-00-00T00:00:00.000Z",
		ruolo: "bbbbbbbbbbbbbbbbbbbbbbbb",
	},
	{
		_id: "222222222222222222222222",
		attivo: false,
		email: "fakeuser3@mail.com",
		nome: "fake",
		cognome: "tre",
		creato: "2000-00-00T00:00:00.000Z",
		ruolo: "cccccccccccccccccccccccc",
	},
];

const mockCreatedUser = {
	_id: "444444444444444444444444",
	attivo: true,
	email: "fakeuser4@mail.com",
	nome: "fake",
	cognome: "quattro",
	creato: "2000-00-00T00:00:00.000Z",
	ruolo: "aaaaaaaaaaaaaaaaaaaaaaaa",
};

const mockRoles = [
	{
		_id: "aaaaaaaaaaaaaaaaaaaaaaaa",
		creato: "2000-00-00T00:00:00.000Z",
		nome: "Ruolo1",
		descrizione: "Ruolo uno",
		moduli: [
			"a1a1a1a1a1a1a1a1a1a1a1a1",
			"b2b2b2b2b2b2b2b2b2b2b2b2",
			"c3c3c3c3c3c3c3c3c3c3c3c3",
		],
	},
	{
		_id: "bbbbbbbbbbbbbbbbbbbbbbbb",
		creato: "2000-00-00T00:00:00.000Z",
		nome: "Ruolo2",
		descrizione: "Ruolo due",
		moduli: ["a1a1a1a1a1a1a1a1a1a1a1a1", "b2b2b2b2b2b2b2b2b2b2b2b2"],
	},
	{
		_id: "cccccccccccccccccccccccc",
		creato: "2000-00-00T00:00:00.000Z",
		nome: "Ruolo3",
		descrizione: "Ruolo true",
		moduli: ["a1a1a1a1a1a1a1a1a1a1a1a1"],
	},
];

beforeAll(() => {
	userSpy = jest.spyOn(User, "find").mockImplementation(async (query) => {
		return mockUsers.filter((user) => {
			if (!query || Object.keys(query).lenght === 0) {
				return true;
			} else {
				return Object.keys(query).every((key) => user[key] === query[key]);
			}
		});
	});

	userSpyFindById = jest
		.spyOn(User, "findById")
		.mockImplementation(async (id) => {
			if (!ObjectId.isValid(id)) {
				throw new Error();
			}

			const result = mockUsers.filter((user) => {
				return user._id === id ? true : false;
			});

			return result[0];
		});

	userSpySave = jest
		.spyOn(User.prototype, "save")
		.mockResolvedValue(mockCreatedUser);

	userSpyFindByIdAndUpdate = jest
		.spyOn(User, "findByIdAndUpdate")
		.mockImplementation(async (id, query, options) => {
			if (!ObjectId.isValid(id)) {
				throw new Error();
			}

			const user = mockUsers.filter((user) => {
				return user._id === id ? true : false;
			});

			if (!user[0]) {
				return null;
			}

			const { _id, ...rest } = user[0];

			result = { self: "/users/" + id, ...rest, ...query };

			return result;
		});

	roleSpyFindById = jest
		.spyOn(Role, "findById")
		.mockImplementation(async (id) => {
			if (!ObjectId.isValid(id)) {
				throw new Error();
			}
			const result = mockRoles.filter((role) => {
				return role._id === id ? true : false;
			});
			return result[0];
		});
});

afterAll(async () => {
	userSpy.mockRestore();
	userSpyFindById.mockRestore();
});

var token = jwt.sign(
	{ email: "fakeuser1@mail.com" },
	process.env.SUPER_SECRET,
	{
		expiresIn: 300,
	},
); // create a valid token

describe("GET /users", () => {
	// * Testa 401
	test("GET /users without providing a token should return 401", async () => {
		return request(app)
			.get("/users")
			.expect(401)
			.then((res) => {
				expect(res.body.success === false);
			});
	});

	// * Testa 403
	test("GET /users with invalid token should return 403", async () => {
		return request(app)
			.get("/users")
			.set("x-access-token", "InvalidTokenExample")
			.set("Accept", "application/json")
			.expect(403)
			.then((res) => {
				expect(res.body.success === false);
			});
	});

	// * Testa 200
	test("GET /users with token should return 200 and the results", async () => {
		return request(app)
			.get("/users")
			.set("x-access-token", token)
			.set("Accept", "application/json")
			.expect(200)
			.then((res) => {
				if (res.body && res.body[0]) {
					expect(res.body[0]).toEqual({
						self: "/users/000000000000000000000000",
						attivo: true,
						email: "fakeuser1@mail.com",
						nome: "fake",
						cognome: "uno",
						creato: "2000-00-00T00:00:00.000Z",
						ruolo: "aaaaaaaaaaaaaaaaaaaaaaaa",
					});
				}
			});
	});

	// * Testa 400 (/users/:id)
	test("GET /users/:id with token but invalid id should return 400", async () => {
		return request(app)
			.get("/users/InvalidID")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(400)
			.then((res) => {
				expect(res.body.success === false);
			});
	});

	// * Testa 404 (/users/:id)
	test("GET /users/:id with token but without a user associated to the id should return 404", async () => {
		return request(app)
			.get("/users/999999999999999999999999")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(404)
			.then((res) => {
				expect(res.body.success === false);
			});
	});

	// * Testa 200 (/users/:id)
	test("GET /users/:id with token and an id of a user in the system should return 200 and the results", async () => {
		return request(app)
			.get("/users/000000000000000000000000")
			.set("x-access-token", token)
			.set("Accept", "application/json")
			.expect(200)
			.then((res) => {
				if (res.body) {
					expect(res.body).toEqual({
						self: "/users/000000000000000000000000",
						attivo: true,
						email: "fakeuser1@mail.com",
						nome: "fake",
						cognome: "uno",
						creato: "2000-00-00T00:00:00.000Z",
						ruolo: "aaaaaaaaaaaaaaaaaaaaaaaa",
					});
				}
			});
	});

	// * Testa 400 (/users/:id/moduli)
	test("GET /users/:id/moduli with token but invalid id should return 400", async () => {
		return request(app)
			.get("/users/InvalidID/moduli")
			.set("x-access-token", token)
			.set("Content-type", "application/json")
			.expect(400)
			.then((res) => {
				expect(res.body.success === false);
			});
	});

	// * Testa 404 (/users/:id/moduli)
	test("GET /users/:id/moduli with token but without a user associated to the id should return 404", async () => {
		return request(app)
			.get("/users/999999999999999999999999/moduli")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(404)
			.then((res) => {
				expect(res.body.success === false);
			});
	});

	// * Testa 200 (/users/:id/moduli)
	test("GET /users/:id/moduli with token and an id of a user in the system should return 200 and the results", async () => {
		return request(app)
			.get("/users/000000000000000000000000/moduli")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(200)
			.then((res) => {
				if (res.body) {
					expect(res.body).toEqual([
						"a1a1a1a1a1a1a1a1a1a1a1a1",
						"b2b2b2b2b2b2b2b2b2b2b2b2",
						"c3c3c3c3c3c3c3c3c3c3c3c3",
					]);
				}
			});
	});
});

describe("POST /users", () => {
	// * Testa 401 (/users)
	test("POST /users without providing a token should return 401", async () => {
		return request(app)
			.post("/users")
			.expect(401)
			.then((res) => {
				expect(res.body.success === false);
			});
	});

	// * Testa 403 (/users)
	test("POST /users with invalid token should return 403", async () => {
		return request(app)
			.post("/users")
			.set("x-access-token", "InvalidTokenExample")
			.set("Accept", "application/json")
			.expect(403)
			.then((res) => {
				expect(res.body.success === false);
			});
	});

	// * Testa 400 (/users)
	test("POST /users with token but with a request with wrong arguments should return 400", async () => {
		return request(app)
			.post("/users")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.send({})
			.expect(400)
			.then((res) => {
				expect(res.body.success === false);
			});
	});

	// * Testa 400 (/users)
	test("POST /users with token but with a request regarding an already existing user should return 400", async () => {
		return request(app)
			.post("/users")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.send({
				email: "fakeuser1@mail.com",
				nome: "fake",
				cognome: "uno",
				password: "password",
				ruolo: "aaaaaaaaaaaaaaaaaaaaaaaa",
			})
			.expect(400)
			.then((res) => {
				expect(res.body.success === false);
			});
	});

	// * Testa 201 (/users)
	test("POST /users with token should return 201 and the results", async () => {
		return request(app)
			.post("/users")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.send({
				email: "fakeuser4@mail.com",
				nome: "fake",
				cognome: "quattro",
				password: "password",
				ruolo: "aaaaaaaaaaaaaaaaaaaaaaaa",
			})
			.expect(201);
	});
});

// ? test per i patch
describe("PATCH /users", () => {
	// * Testa 401 (/users)
	test("PATCH /users/:id without providing a token should return 401", async () => {
		return request(app)
			.patch("/users")
			.expect(401)
			.then((res) => {
				expect(res.body.success === false);
			});
	});

	// * Testa 403 (/users)
	test("PATCH /users with invalid token should return 403", async () => {
		return request(app)
			.patch("/users/000000000000000000000000")
			.set("x-access-token", "InvalidTokenExample")
			.set("Accept", "application/json")
			.expect(403)
			.then((res) => {
				expect(res.body.success === false);
			});
	});

	// * Testa 400 (/users/:id)
	test("PATCH /users/:id with token but invalid id should return 400", async () => {
		return request(app)
			.patch("/users/InvalidID")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(400)
			.then((res) => {
				expect(res.body.success === false);
			});
	});

	// * Testa 404 (/users)
	test("PATCH /users/:id with token but with an id of an user not existing should return 404", async () => {
		return request(app)
			.patch("/users/999999999999999999999999")
			.set("x-access-token", token)
			.set("Accept", "application/json")
			.send({
				attivo: false,
			})
			.expect(404)
			.then((res) => {
				expect(res.body.success === false);
			});
	});

	test("PATCH /users with token should return 200 and the results", async () => {
		return request(app)
			.patch("/users/000000000000000000000000")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.send({
				attivo: false,
			})
			.expect(200)
			.then((res) => {
				if (res.body) {
					expect(res.body.user).toEqual({
						self: "/users/000000000000000000000000",
						attivo: false,
						email: "fakeuser1@mail.com",
						nome: "fake",
						cognome: "uno",
						creato: "2000-00-00T00:00:00.000Z",
						ruolo: "aaaaaaaaaaaaaaaaaaaaaaaa",
					});
				}
			});
	});
});
