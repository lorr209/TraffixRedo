import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import Complaint from "../routers/models/complaint.js";
import mongoose from "mongoose";
import app from "../app.js";

const {
	Types: { ObjectId },
} = mongoose;

let complaintSpy;
let complaintSpyFindById;

const mockComplaints = [
	{
		_id: "000000000000000000000000",
		lat: 0,
		lon: 0,
		tipo: "tpl",
		data: "2000-00-00T00:00:00.000Z",
		testo: "testo di esempio 1",
	},
	{
		_id: "111111111111111111111111",
		lat: 0,
		lon: 0,
		tipo: "traffico",
		data: "2000-00-00T00:00:00.000Z",
		testo: "testo di esempio 2",
	},
	{
		_id: "222222222222222222222222",
		lat: 0,
		lon: 0,
		tipo: "tpl",
		data: "2000-00-00T00:00:00.000Z",
		testo: "testo di esempio 3",
	},
];

var token = jwt.sign({ email: "Esempio@mail.com" }, process.env.SUPER_SECRET, {
	expiresIn: 300,
});

beforeAll(() => {
	complaintSpy = jest
		.spyOn(Complaint, "find")
		.mockImplementation(async (query) => {
			return mockComplaints;
		});

	complaintSpyFindById = jest
		.spyOn(Complaint, "findById")
		.mockImplementation(async (id) => {
			if (!ObjectId.isValid(id)) {
				throw new Error();
			}
			const result = mockComplaints.filter((complaint) => {
				return complaint._id === id ? true : false;
			});
			return result[0];
		});
});

afterAll(async () => {
	complaintSpy.mockRestore();
	complaintSpyFindById.mockRestore();
});

describe("GET /api/complaints", () => {
	test("GET /api/complaints without providing a token should return 401", async () => {
		return request(app)
			.get("/api/complaints")
			.expect(401)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	test("GET /api/complaints with invalid token should return 403", async () => {
		return request(app)
			.get("/api/complaints")
			.set("x-access-token", "InvalidTokenExample")
			.set("Content-Type", "application/json")
			.expect(403)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	test("GET /api/complaints with token should return 200 and the results", async () => {
		return request(app)
			.get("/api/complaints")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(200)
			.then((res) => {
				if (res.body && res.body[0]) {
					expect(res.body[0]).toEqual({
						self: "/api/complaints/000000000000000000000000",
						lat: 0,
						lon: 0,
						tipo: "tpl",
						data: "2000-00-00T00:00:00.000Z",
						testo: "testo di esempio 1",
					});
				}
			});
	});

	// * Testa 400 (/api/complaints/:id)
	test("GET /api/complaints/:id with token but invalid id should return 400", async () => {
		return request(app)
			.get("/api/complaints/InvalidID")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(400)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 404 (/api/complaints/:id)
	test("GET /api/complaints/:id with token but without a complaint associated to the id should return 404", async () => {
		return request(app)
			.get("/api/complaints/999999999999999999999999")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(404)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	// * Testa 200 (/api/complaints/:id)
	test("GET /api/complaints/:id with token and an id of a complaint in the system should return 200 and the results", async () => {
		return request(app)
			.get("/api/complaints/000000000000000000000000")
			.set("x-access-token", token)
			.set("Accept", "application/json")
			.expect(200)
			.then((res) => {
				expect(res.body).toEqual({
					self: "/api/complaints/000000000000000000000000",
					lat: 0,
					lon: 0,
					tipo: "tpl",
					data: "2000-00-00T00:00:00.000Z",
					testo: "testo di esempio 1",
				});
			});
	});
});
