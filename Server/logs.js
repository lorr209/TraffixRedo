import express from "express";
import Log from "./models/log.js"; // Importa il modello di mongoose
const router = express.Router();

router.get("/", async (req, res) => {
	/* if (!req.loggedUser) {
		return;
	} */

	// https://mongoosejs.com/docs/api.html#model_Model.find
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
