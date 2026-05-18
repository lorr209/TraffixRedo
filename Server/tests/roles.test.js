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

			result = { self: "/roles/" + id, ...rest, ...query };

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

describe("GET /roles", () => {
	// * Testa 401
	test("GET /roles without providing a token should return 401", async () => {
		return request(app)
			.get("/roles")
			.expect(401)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 403
	test("GET /roles with invalid token should return 403", async () => {
		return request(app)
			.get("/roles")
			.set("x-access-token", "InvalidTokenExample")
			.set("Accept", "application/json")
			.expect(403)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 200
	test("GET /roles with token should return 200 and the results", async () => {
		return request(app)
			.get("/roles")
			.set("x-access-token", token)
			.set("Accept", "application/json")
			.expect(200)
			.then((res) => {
				if (res.body && res.body[0]) {
					expect(res.body[0]).toEqual({
						self: "/roles/000000000000000000000000",
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

	// * Testa 400 (/roles/:id)
	test("GET /roles/:id with token but invalid id should return 400", async () => {
		return request(app)
			.get("/roles/InvalidID")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(400)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 404 (/roles/:id)
	test("GET /roles/:id with token but without a role associated to the id should return 404", async () => {
		return request(app)
			.get("/roles/999999999999999999999999")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(404)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 200 (/roles/:id)
	test("GET /roles/:id with token and an id of a role in the system should return 200 and the results", async () => {
		return request(app)
			.get("/roles/000000000000000000000000")
			.set("x-access-token", token)
			.set("Accept", "application/json")
			.expect(200)
			.then((res) => {
				if (res.body) {
					expect(res.body).toEqual({
						self: "/roles/000000000000000000000000",
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

describe("POST /roles", () => {
	// * Testa 401 (/roles)
	test("POST /roles without providing a token should return 401", async () => {
		return request(app)
			.post("/roles")
			.expect(401)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 403 (/roles)
	test("POST /roles with invalid token should return 403", async () => {
		return request(app)
			.post("/roles")
			.set("x-access-token", "InvalidTokenExample")
			.set("Accept", "application/json")
			.expect(403)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 400 (/roles)
	test("POST /roles with token but with a request with wrong arguments should return 400", async () => {
		return request(app)
			.post("/roles")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.send({})
			.expect(400)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 400 (/roles)
	test("POST /roles with token but with a request regarding an already existing role should return 400", async () => {
		return request(app)
			.post("/roles")
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

	// * Testa 201 (/roles)
	test("POST /roles with token should return 201 and the results", async () => {
		return request(app)
			.post("/roles")
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
					self: "/roles/333333333333333333333333",
					nome: "Ruolo 4",
					descrizione: "Ruolo quattro",
					moduli: ["dddddddddddddddddddddddd"],
				});
			});
	});
});

// ? test per i patch
describe("PATCH /roles", () => {
	// * Testa 401 (/roles)
	test("PATCH /roles/:id without providing a token should return 401", async () => {
		return request(app)
			.patch("/roles")
			.expect(401)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 403 (/roles)
	test("PATCH /roles with invalid token should return 403", async () => {
		return request(app)
			.patch("/roles/000000000000000000000000")
			.set("x-access-token", "InvalidTokenExample")
			.set("Accept", "application/json")
			.expect(403)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 400 (/roles/:id)
	test("PATCH /roles/:id with token but invalid id should return 400", async () => {
		return request(app)
			.patch("/roles/InvalidID")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(400)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 404 (/roles)
	test("PATCH /roles/:id with token but with an id of an role not existing should return 404", async () => {
		return request(app)
			.patch("/roles/999999999999999999999999")
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

	test("PATCH /roles with token should return 200 and the results", async () => {
		return request(app)
			.patch("/roles/000000000000000000000000")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.send({
				attivo: false,
			})
			.expect(200)
			.then((res) => {
				if (res.body) {
					expect(res.body.role).toEqual({
						self: "/roles/000000000000000000000000",
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
