import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import Module from "../routers/models/module.js";
import Role from "../routers/models/role.js";
import mongoose from "mongoose";
import app from "../app.js";

const {
	Types: { ObjectId },
} = mongoose;

let moduleSpy;
let moduleSpyFindById;
let moduleSpyFindByIdAndUpdate;

const mockModules = [
	{
		_id: "000000000000000000000000",
		attivo: true,
		nome: "Modulo 1",
		descrizione: "Modulo uno",
		percorso: "percorso 1",
	},
	{
		_id: "111111111111111111111111",
		attivo: true,
		nome: "Modulo 2",
		descrizione: "Modulo due",
		percorso: "percorso 2",
	},
	{
		_id: "222222222222222222222222",
		attivo: true,
		nome: "Modulo 3",
		descrizione: "Modulo tre",
		percorso: "percorso 3",
	},
];

beforeAll(() => {
	moduleSpy = jest.spyOn(Module, "find").mockImplementation(async (query) => {
		return mockModules;
	});

	moduleSpyFindById = jest
		.spyOn(Module, "findById")
		.mockImplementation(async (id) => {
			if (!ObjectId.isValid(id)) {
				throw new Error();
			}

			const result = mockModules.filter((module) => {
				return module._id === id ? true : false;
			});

			return result[0];
		});

	moduleSpyFindByIdAndUpdate = jest
		.spyOn(Module, "findByIdAndUpdate")
		.mockImplementation(async (id, query, options) => {
			if (!ObjectId.isValid(id)) {
				throw new Error();
			}

			const module = mockModules.filter((module) => {
				return module._id === id ? true : false;
			});

			if (!module[0]) {
				return null;
			}

			const { _id, ...rest } = module[0];

			result = { self: "/modules/" + id, ...rest, ...query };

			return result;
		});
});

afterAll(async () => {
	moduleSpy.mockRestore();
	moduleSpyFindById.mockRestore();
	moduleSpyFindByIdAndUpdate.mockRestore();
});

var token = jwt.sign(
	{ email: "fakemodule1@mail.com" },
	process.env.SUPER_SECRET,
	{
		expiresIn: 300,
	},
);

describe("GET /modules", () => {
	// * Testa 401
	test("GET /modules without providing a token should return 401", async () => {
		return request(app)
			.get("/modules")
			.expect(401)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 403
	test("GET /modules with invalid token should return 403", async () => {
		return request(app)
			.get("/modules")
			.set("x-access-token", "InvalidTokenExample")
			.set("Accept", "application/json")
			.expect(403)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 200
	test("GET /modules with token should return 200 and the results", async () => {
		return request(app)
			.get("/modules")
			.set("x-access-token", token)
			.set("Accept", "application/json")
			.expect(200)
			.then((res) => {
				if (res.body && res.body[0]) {
					expect(res.body[0]).toEqual({
						self: "/modules/000000000000000000000000",
						attivo: true,
						nome: "Modulo 1",
						descrizione: "Modulo uno",
						percorso: "percorso 1",
					});
				}
			});
	});

	// * Testa 400 (/modules/:id)
	test("GET /modules/:id with token but invalid id should return 400", async () => {
		return request(app)
			.get("/modules/InvalidID")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(400)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 404 (/modules/:id)
	test("GET /modules/:id with token but without a module associated to the id should return 404", async () => {
		return request(app)
			.get("/modules/999999999999999999999999")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(404)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 200 (/modules/:id)
	test("GET /modules/:id with token and an id of a module in the system should return 200 and the results", async () => {
		return request(app)
			.get("/modules/000000000000000000000000")
			.set("x-access-token", token)
			.set("Accept", "application/json")
			.expect(200)
			.then((res) => {
				if (res.body) {
					expect(res.body).toEqual({
						self: "/modules/000000000000000000000000",
						attivo: true,
						nome: "Modulo 1",
						descrizione: "Modulo uno",
						percorso: "percorso 1",
					});
				}
			});
	});
});

describe("PATCH /modules", () => {
	// * Testa 401 (/modules)
	test("PATCH /modules/:id without providing a token should return 401", async () => {
		return request(app)
			.patch("/modules")
			.expect(401)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 403 (/modules)
	test("PATCH /modules with invalid token should return 403", async () => {
		return request(app)
			.patch("/modules/000000000000000000000000")
			.set("x-access-token", "InvalidTokenExample")
			.set("Accept", "application/json")
			.expect(403)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 400 (/modules/:id)
	test("PATCH /modules/:id with token but invalid id should return 400", async () => {
		return request(app)
			.patch("/modules/InvalidID")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(400)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 404 (/modules)
	test("PATCH /modules/:id with token but with an id of an module not existing should return 404", async () => {
		return request(app)
			.patch("/modules/999999999999999999999999")
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

	test("PATCH /modules with token should return 200 and the results", async () => {
		return request(app)
			.patch("/modules/000000000000000000000000")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.send({
				attivo: false,
			})
			.expect(200)
			.then((res) => {
				if (res.body) {
					expect(res.body.module).toEqual({
						self: "/modules/000000000000000000000000",
						attivo: false,
						nome: "Modulo 1",
						descrizione: "Modulo uno",
						percorso: "percorso 1",
					});
				}
			});
	});
});
