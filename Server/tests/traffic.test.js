import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import Density from "../routers/models/density.js";
import Vehicle from "../routers/models/vehicle.js";
import mongoose from "mongoose";
import app from "../app.js";

let densitySpy;
let vehicleSpy;

const mockVehicles = [
	{
		_id: "000000000000000000000000",
		data: "2000-00-00T00:00:00.000Z",
		lat: 0,
		lon: 0,
	},
	{
		_id: "111111111111111111111111",
		data: "2010-00-00T00:00:00.000Z",
		lat: 0,
		lon: 0,
	},
	{
		_id: "222222222222222222222222",
		data: "2020-00-00T00:00:00.000Z",
		lat: 0,
		lon: 0,
	},
];

const mockDensities = [
	{
		_id: "000000000000000000000000",
		data: "2000-00-00T00:00:00.000Z",
		lat: 0,
		lon: 0,
		quantità: 1,
	},
	{
		_id: "111111111111111111111111",
		data: "2000-00-00T00:00:00.000Z",
		lat: 0,
		lon: 0,
		quantità: 2,
	},
	{
		_id: "222222222222222222222222",
		data: "2000-00-00T00:00:00.000Z",
		lat: 0,
		lon: 0,
		quantità: 3,
	},
];

var token = jwt.sign({ email: "Esempio@mail.com" }, process.env.SUPER_SECRET, {
	expiresIn: 300,
});

beforeAll(() => {
	densitySpy = jest.spyOn(Density, "find").mockImplementation(async (query) => {
		return mockDensities;
	});

	vehicleSpy = jest.spyOn(Vehicle, "find").mockImplementation(async (query) => {
		return mockVehicles;
	});
});

afterAll(async () => {
	densitySpy.mockRestore();
	densitySpy.mockRestore();
});

describe("GET /api/traffic/densities", () => {
	test("GET /api/traffic/densities without providing a token should return 401", async () => {
		return request(app)
			.get("/api/traffic/densities")
			.expect(401)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	test("GET /api/traffic/densities with invalid token should return 403", async () => {
		return request(app)
			.get("/api/traffic/densities")
			.set("x-access-token", "InvalidTokenExample")
			.set("Content-Type", "application/json")
			.expect(403)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	test("GET /api/traffic/densities with token should return 200 and the results", async () => {
		return request(app)
			.get("/api/traffic/densities")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(200)
			.then((res) => {
				if (res.body && res.body[0]) {
					expect(res.body[0]).toEqual({
						data: "2000-00-00T00:00:00.000Z",
						lat: 0,
						lon: 0,
						quantità: 1,
					});
				}
			});
	});
});

describe("GET /api/traffic/vehicles", () => {
	test("GET /api/traffic/vehicles without providing a token should return 401", async () => {
		return request(app)
			.get("/api/traffic/vehicles")
			.expect(401)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	test("GET /api/traffic/vehicles with invalid token should return 403", async () => {
		return request(app)
			.get("/api/traffic/vehicles")
			.set("x-access-token", "InvalidTokenExample")
			.set("Content-Type", "application/json")
			.expect(403)
			.then((res) => {
				expect(res.body.success).toEqual(false);
			});
	});

	test("GET /api/traffic/vehicles with token should return 200 and the results", async () => {
		return request(app)
			.get("/api/traffic/vehicles")
			.set("x-access-token", token)
			.set("Content-Type", "application/json")
			.expect(200)
			.then((res) => {
				if (res.body && res.body[0]) {
					expect(res.body[0]).toEqual({
						data: "2000-00-00T00:00:00.000Z",
						lat: 0,
						lon: 0,
					});
				}
			});
	});
});
