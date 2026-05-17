import request from "supertest";
import app from "../app.js";

test("GET /APItest/:id should respond with json", async () => {
	return request(app)
		.get("/APItest/3b")
		.expect("Content-Type", /json/)
		.expect(200, {
			message: "3b",
		});
});
