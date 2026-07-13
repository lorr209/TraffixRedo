import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import Role from "../routers/models/role.js";
import mongoose from "mongoose";
import app from "../app.js";

const {
	Types: { ObjectId },
} = mongoose;

let roleSpy;
let roleSpyFindById;
let roleSpyFindOne;
let roleSpySave;
let roleSpyFindByIdAndUpdate;

const mockRoles = [
	{
		_id: "000000000000000000000000",
		nome: "Ruolo 1",
		descrizione: "Ruolo uno",
		moduli: [
			"aaaaaaaaaaaaaaaaaaaaaaaa",
			"bbbbbbbbbbbbbbbbbbbbbbbb",
			"cccccccccccccccccccccccc",
		],
	},
	{
		_id: "111111111111111111111111",
		nome: "Ruolo 2",
		descrizione: "Ruolo due",
		moduli: ["aaaaaaaaaaaaaaaaaaaaaaaa", "bbbbbbbbbbbbbbbbbbbbbbbb"],
	},
	{
		_id: "222222222222222222222222",
		nome: "Ruolo 3",
		descrizione: "Ruolo tre",
		moduli: ["aaaaaaaaaaaaaaaaaaaaaaaa"],
	},
];

const mockCreatedRole = {
	_id: "333333333333333333333333",
	nome: "Ruolo 4",
	descrizione: "Ruolo quattro",
	moduli: ["dddddddddddddddddddddddd"],
};

beforeAll(async () => {
	roleSpy = jest.spyOn(Role, "find").mockImplementation(async (query) => {
		return mockRoles;
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

	roleSpyFindOne = jest
		.spyOn(Role, "findOne")
		.mockImplementation(async (query) => {
			const result = mockRoles.filter((role) => {
				if (!query || Object.keys(query).length === 0) {
					return true;
				} else {
					return Object.keys(query).every((key) => role[key] === query[key]);
				}
			});
			return result[0];
		});

	roleSpySave = jest
		.spyOn(Role.prototype, "save")
		.mockResolvedValue(mockCreatedRole);

	roleSpyFindByIdAndUpdate = jest
		.spyOn(Role, "findByIdAndUpdate")
		.mockImplementation(async (id, query, options) => {
			if (!ObjectId.isValid(id)) {
				throw new Error();
			}

			const role = mockRoles.filter((role) => {
				return role._id === id ? true : false;
			});

			if (!role[0]) {
				return null;
			}

			const { _id, ...rest } = role[0];

			const result = { self: "/api/roles/" + id, ...rest, ...query };

			return result;
		});
});

afterAll(async () => {
	roleSpy.mockRestore();
	roleSpyFindOne.mockRestore();
	roleSpySave.mockRestore();
	roleSpyFindByIdAndUpdate.mockRestore();
});

var token = jwt.sign(
	{ email: "fakerole1@mail.com" },
	process.env.SUPER_SECRET,
	{
		expiresIn: 300,
	},
);

describe("GET /api/roles", () => {
	// * Testa 401
	test("GET /api/roles without providing a token should return 401", async () => {
		return request(app)
			.get("/api/roles")
			.expect(401)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 403
	test("GET /api/roles with invalid token should return 403", async () => {
		return request(app)
			.get("/api/roles")
			.set("x-access-token", "InvalidTokenExample")
			.set("Accept", "application/json")
			.expect(403)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 200
	test("GET /api/roles with token should return 200 and the results", async () => {
		return request(app)
			.get("/api/roles")
			.set("x-access-token", token)
			.set("Accept", "application/json")
			.expect(200)
			.then((res) => {
				if (res.body && res.body[0]) {
					expect(res.body[0]).toEqual({
						self: "/api/roles/000000000000000000000000",
						nome: "Ruolo 1",
						descrizione: "Ruolo uno",
						moduli: [
							"aaaaaaaaaaaaaaaaaaaaaaaa",
							"bbbbbbbbbbbbbbbbbbbbbbbb",
							"cccccccccccccccccccccccc",
						],
					});
				}
			});
	});

	// * Testa 400 (/api/roles/:id)
	test("GET /api/roles/:id with token but invalid id should return 400", async () => {
		return request(app)
			.get("/api/roles/InvalidID")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(400)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 404 (/api/roles/:id)
	test("GET /api/roles/:id with token but without a role associated to the id should return 404", async () => {
		return request(app)
			.get("/api/roles/999999999999999999999999")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(404)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 200 (/api/roles/:id)
	test("GET /api/roles/:id with token and an id of a role in the system should return 200 and the results", async () => {
		return request(app)
			.get("/api/roles/000000000000000000000000")
			.set("x-access-token", token)
			.set("Accept", "application/json")
			.expect(200)
			.then((res) => {
				if (res.body) {
					expect(res.body).toEqual({
						self: "/api/roles/000000000000000000000000",
						nome: "Ruolo 1",
						descrizione: "Ruolo uno",
						moduli: [
							"aaaaaaaaaaaaaaaaaaaaaaaa",
							"bbbbbbbbbbbbbbbbbbbbbbbb",
							"cccccccccccccccccccccccc",
						],
					});
				}
			});
	});
});

describe("POST /api/roles", () => {
	// * Testa 401 (/api/roles)
	test("POST /api/roles without providing a token should return 401", async () => {
		return request(app)
			.post("/api/roles")
			.expect(401)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 403 (/api/roles)
	test("POST /api/roles with invalid token should return 403", async () => {
		return request(app)
			.post("/api/roles")
			.set("x-access-token", "InvalidTokenExample")
			.set("Accept", "application/json")
			.expect(403)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 400 (/api/roles)
	test("POST /api/roles with token but with a request with wrong arguments should return 400", async () => {
		return request(app)
			.post("/api/roles")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.send({})
			.expect(400)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 400 (/api/roles)
	test("POST /api/roles with token but with a request regarding an already existing role should return 400", async () => {
		return request(app)
			.post("/api/roles")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.send({
				nome: "Ruolo 1",
				descrizione: "Ruolo uno",
				moduli: ["dddddddddddddddddddddddd"],
			})
			.expect(400)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 201 (/api/roles)
	test("POST /api/roles with token should return 201 and the results", async () => {
		return request(app)
			.post("/api/roles")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.send({
				nome: "Ruolo 4",
				descrizione: "Ruolo quattro",
				moduli: ["dddddddddddddddddddddddd"],
			})
			.expect(201)
			.then((res) => {
				expect(res.body).toEqual({
					self: "/api/roles/333333333333333333333333",
					nome: "Ruolo 4",
					descrizione: "Ruolo quattro",
					moduli: ["dddddddddddddddddddddddd"],
				});
			});
	});
});

// ? test per i patch
describe("PATCH /api/roles", () => {
	// * Testa 401 (/api/roles)
	test("PATCH /api/roles/:id without providing a token should return 401", async () => {
		return request(app)
			.patch("/api/roles")
			.expect(401)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 403 (/api/roles)
	test("PATCH /api/roles with invalid token should return 403", async () => {
		return request(app)
			.patch("/api/roles/000000000000000000000000")
			.set("x-access-token", "InvalidTokenExample")
			.set("Accept", "application/json")
			.expect(403)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 400 (/api/roles/:id)
	test("PATCH /api/roles/:id with token but invalid id should return 400", async () => {
		return request(app)
			.patch("/api/roles/InvalidID")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(400)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 404 (/api/roles)
	test("PATCH /api/roles/:id with token but with an id of an role not existing should return 404", async () => {
		return request(app)
			.patch("/api/roles/999999999999999999999999")
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

	test("PATCH /api/roles with token should return 200 and the results", async () => {
		return request(app)
			.patch("/api/roles/000000000000000000000000")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.send({
				attivo: false,
			})
			.expect(200)
			.then((res) => {
				if (res.body) {
					expect(res.body.role).toEqual({
						self: "/api/roles/000000000000000000000000",
						attivo: false,
						nome: "Ruolo 1",
						descrizione: "Ruolo uno",
						moduli: [
							"aaaaaaaaaaaaaaaaaaaaaaaa",
							"bbbbbbbbbbbbbbbbbbbbbbbb",
							"cccccccccccccccccccccccc",
						],
					});
				}
			});
	});
});
