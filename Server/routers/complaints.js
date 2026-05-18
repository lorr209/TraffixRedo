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

router.get("/:id", async (req, res) => {
	const { id } = req.params;

	let complaint = await Complaint.findById(id).catch((e) => {
		return res.status(400).json({ success: false, message: "Invalid query" });
	});

	if (!complaint) {
		return res
			.status(404)
			.json({ success: false, message: "Complaint not found" });
	}

	response = {
		self: "/complaints/" + complaint._id,
		lat: complaint.lat,
		lon: complaint.lon,
		tipo: complaint.tipo,
		data: complaint.data,
		testo: complaint.testo,
	};

	res.status(200).json(response);
});

export default router;
