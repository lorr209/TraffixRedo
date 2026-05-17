import express from "express";
import Density from "./models/density.js"; // Importa il modello di mongoose
import Vehicle from "./models/vehicle.js";

const router = express.Router();

router.get("/densities", async (req, res) => {
	let densities = await Density.find({});

	densities = densities.map((density) => {
		return {
			self: "/densities/" + density._id,
			data: density.data,
			lat: density.lat,
			lon: density.lon,
			quantità: density.quantità,
		};
	});

	res.status(200).json(densities);
});

router.get("/vehicles", async (req, res) => {
	let vehicles = await Vehicle.find({});

	vehicles = vehicles.map((vehicle) => {
		return {
			self: "/vehicle/" + vehicle._id,
			data: vehicle.data,
			lat: vehicle.lat,
			lon: vehicle.lon,
		};
	});

	res.status(200).json(vehicles);
});

export default router;
