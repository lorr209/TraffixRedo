import express from "express";
import Log from "./models/log.js"; // Importa il modello di mongoose

// * REQUEST EXAMPLE: curl -X GET http://localhost:3000/logs -H "x-access-token: yourtokenhere"

const router = express.Router();

router.get("/", async (req, res) => {
	const { id } = req.query;

	const filter = id ? { utente: id } : {};

	let logs = await Log.find(filter).catch((e) => {
		return res.status(400).json({ success: false, message: "Invalid query" });
	});

	logs = logs.map((log) => {
		return {
			data: log.data,
			utente: log.utente,
		};
	});

	res.status(200).json(logs);
});

export default router;
