import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import Prize from "../routers/models/prize.js";
import Role from "../routers/models/role.js";
import mongoose from "mongoose";
import app from "../app.js";

const {
	Types: { ObjectId },
} = mongoose;

let prizeSpy;
let prizeSpyFindById;
let prizeSpyFindOne;
let prizeSpySave;
let prizeSpyFindByIdAndUpdate;

const mockPrizes = [
	{
		_id: "000000000000000000000000",
		attivo: false,
		nome: "Premio 1",
		descrizione: "Premio uno",
		costo: 1,
		creato: "2000-00-00T00:00:00.000Z",
		termina: "2005-00-00T00:00:00.000Z",
	},
	{
		_id: "111111111111111111111111",
		attivo: false,
		nome: "Premio 2",
		descrizione: "Premio due",
		costo: 2,
		creato: "2000-00-00T00:00:00.000Z",
		termina: "2005-00-00T00:00:00.000Z",
	},
	{
		_id: "222222222222222222222222",
		attivo: false,
		nome: "Premio 3",
		descrizione: "Premio tre",
		costo: 3,
		creato: "2000-00-00T00:00:00.000Z",
		termina: "2005-00-00T00:00:00.000Z",
	},
];

const mockCreatedPrize = {
	_id: "333333333333333333333333",
	attivo: false,
	nome: "Premio 4",
	descrizione: "Premio quattro",
	costo: 4,
	creato: "2000-00-00T00:00:00.000Z",
	termina: "2005-00-00T00:00:00.000Z",
};

beforeAll(() => {
	prizeSpy = jest.spyOn(Prize, "find").mockImplementation(async (query) => {
		return mockPrizes.filter((prize) => {
			if (!query || Object.keys(query).length === 0) {
				return true;
			} else {
				return Object.keys(query).every((key) => prize[key] === query[key]);
			}
		});
	});

	prizeSpyFindById = jest
		.spyOn(Prize, "findById")
		.mockImplementation(async (id) => {
			if (!ObjectId.isValid(id)) {
				throw new Error();
			}

			const result = mockPrizes.filter((prize) => {
				return prize._id === id ? true : false;
			});

			return result[0];
		});

	prizeSpyFindOne = jest
		.spyOn(Prize, "findOne")
		.mockImplementation(async (query) => {
			const result = mockPrizes.filter((prize) => {
				if (!query || Object.keys(query).length === 0) {
					return true;
				} else {
					return Object.keys(query).every((key) => prize[key] === query[key]);
				}
			});
			return result[0];
		});

	prizeSpySave = jest
		.spyOn(Prize.prototype, "save")
		.mockResolvedValue(mockCreatedPrize);

	prizeSpyFindByIdAndUpdate = jest
		.spyOn(Prize, "findByIdAndUpdate")
		.mockImplementation(async (id, query, options) => {
			if (!ObjectId.isValid(id)) {
				throw new Error();
			}

			const prize = mockPrizes.filter((prize) => {
				return prize._id === id ? true : false;
			});

			if (!prize[0]) {
				return null;
			}

			const { _id, ...rest } = prize[0];

			result = { self: "/prizes/" + id, ...rest, ...query };

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
	prizeSpy.mockRestore();
	prizeSpyFindById.mockRestore();
	prizeSpyFindOne.mockRestore();
	prizeSpySave.mockRestore();
	prizeSpyFindByIdAndUpdate.mockRestore();
});

var token = jwt.sign(
	{ email: "fakeprize1@mail.com" },
	process.env.SUPER_SECRET,
	{
		expiresIn: 300,
	},
);

describe("GET /prizes", () => {
	// * Testa 401
	test("GET /prizes without providing a token should return 401", async () => {
		return request(app)
			.get("/prizes")
			.expect(401)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 403
	test("GET /prizes with invalid token should return 403", async () => {
		return request(app)
			.get("/prizes")
			.set("x-access-token", "InvalidTokenExample")
			.set("Accept", "application/json")
			.expect(403)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 200
	test("GET /prizes with token should return 200 and the results", async () => {
		return request(app)
			.get("/prizes")
			.set("x-access-token", token)
			.set("Accept", "application/json")
			.expect(200)
			.then((res) => {
				if (res.body && res.body[0]) {
					expect(res.body[0]).toEqual({
						self: "/prizes/000000000000000000000000",
						attivo: false,
						nome: "Premio 1",
						descrizione: "Premio uno",
						costo: 1,
						creato: "2000-00-00T00:00:00.000Z",
						termina: "2005-00-00T00:00:00.000Z",
					});
				}
			});
	});

	// * Testa 400 (/prizes/:id)
	test("GET /prizes/:id with token but invalid id should return 400", async () => {
		return request(app)
			.get("/prizes/InvalidID")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(400)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 404 (/prizes/:id)
	test("GET /prizes/:id with token but without a prize associated to the id should return 404", async () => {
		return request(app)
			.get("/prizes/999999999999999999999999")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(404)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 200 (/prizes/:id)
	test("GET /prizes/:id with token and an id of a prize in the system should return 200 and the results", async () => {
		return request(app)
			.get("/prizes/000000000000000000000000")
			.set("x-access-token", token)
			.set("Accept", "application/json")
			.expect(200)
			.then((res) => {
				if (res.body) {
					expect(res.body).toEqual({
						self: "/prizes/000000000000000000000000",
						attivo: false,
						nome: "Premio 1",
						descrizione: "Premio uno",
						costo: 1,
						creato: "2000-00-00T00:00:00.000Z",
						termina: "2005-00-00T00:00:00.000Z",
					});
				}
			});
	});
});

describe("POST /prizes", () => {
	// * Testa 401 (/prizes)
	test("POST /prizes without providing a token should return 401", async () => {
		return request(app)
			.post("/prizes")
			.expect(401)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 403 (/prizes)
	test("POST /prizes with invalid token should return 403", async () => {
		return request(app)
			.post("/prizes")
			.set("x-access-token", "InvalidTokenExample")
			.set("Accept", "application/json")
			.expect(403)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 400 (/prizes)
	test("POST /prizes with token but with a request with wrong arguments should return 400", async () => {
		return request(app)
			.post("/prizes")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.send({})
			.expect(400)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 400 (/prizes)
	test("POST /prizes with token but with a request regarding an already existing prize should return 400", async () => {
		return request(app)
			.post("/prizes")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.send({
				attivo: false,
				nome: "Premio 1",
				descrizione: "Premio uno",
				costo: 1,
				termina: "2005-00-00T00:00:00.000Z",
			})
			.expect(400)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 201 (/prizes)
	test("POST /prizes with token should return 201 and the results", async () => {
		return request(app)
			.post("/prizes")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.send({
				attivo: false,
				nome: "Premio 4",
				descrizione: "Premio quattro",
				costo: 4,
				termina: "2005-00-00T00:00:00.000Z",
			})
			.expect(201)
			.then((res) => {
				expect(res.body).toEqual({
					self: "/prizes/333333333333333333333333",
					attivo: false,
					nome: "Premio 4",
					descrizione: "Premio quattro",
					costo: 4,
					creato: "2000-00-00T00:00:00.000Z",
					termina: "2005-00-00T00:00:00.000Z",
				});
			});
	});
});

// ? test per i patch
describe("PATCH /prizes", () => {
	// * Testa 401 (/prizes)
	test("PATCH /prizes/:id without providing a token should return 401", async () => {
		return request(app)
			.patch("/prizes")
			.expect(401)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 403 (/prizes)
	test("PATCH /prizes with invalid token should return 403", async () => {
		return request(app)
			.patch("/prizes/000000000000000000000000")
			.set("x-access-token", "InvalidTokenExample")
			.set("Accept", "application/json")
			.expect(403)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 400 (/prizes/:id)
	test("PATCH /prizes/:id with token but invalid id should return 400", async () => {
		return request(app)
			.patch("/prizes/InvalidID")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(400)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 404 (/prizes)
	test("PATCH /prizes/:id with token but with an id of an prize not existing should return 404", async () => {
		return request(app)
			.patch("/prizes/999999999999999999999999")
			.set("x-access-token", token)
			.set("Accept", "application/json")
			.send({
				attivo: false,
			})
			.expect(404)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	test("PATCH /prizes with token should return 200 and the results", async () => {
		return request(app)
			.patch("/prizes/000000000000000000000000")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.send({
				attivo: true,
			})
			.expect(200)
			.then((res) => {
				if (res.body) {
					expect(res.body.prize).toEqual({
						self: "/prizes/000000000000000000000000",
						attivo: true,
						nome: "Premio 1",
						descrizione: "Premio uno",
						costo: 1,
						creato: "2000-00-00T00:00:00.000Z",
						termina: "2005-00-00T00:00:00.000Z",
					});
				}
			});
	});
});
