import express from "express";
import Log from "./models/log.js"; // Importa il modello di mongoose

// * REQUEST EXAMPLE: curl -X GET http://localhost:3000/logs -H "x-access-token: yourtokenhere"

const router = express.Router();

router.get("/", async (req, res) => {
	let logs = await Log.find({});

	logs = logs.map((log) => {
		return {
			self: "/logs/" + log._id,
			data: log.Data,
			id_Utente: log.Id_Utente,
		};
	});

	res.status(200).json(logs);
});

export default router;
