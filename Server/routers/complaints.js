import express from "express";
import Complaint from "./models/complaint.js"; // Importa il modello di mongoose

const router = express.Router();

router.get("/", async (req, res) => {
	let complaints = await Complaint.find({});

	complaints = complaints.map((complaint) => {
		return {
			self: "/complaints/" + complaint._id,
			lat: complaint.lat,
			lon: complaint.lon,
			tipo: complaint.tipo,
			data: complaint.data,
			testo: complaint.testo,
		};
	});

	res.status(200).json(complaints);
});

export default router;
