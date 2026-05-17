import express from "express";
import Prize from "./models/prize.js"; // Importa il modello di mongoose

const router = express.Router();

router.get("/", async (req, res) => {
	let prizes = await Prize.find({});

	prizes = prizes.map((prize) => {
		return {
			self: "/prizes/" + prize._id,
			attivo: prize.attivo,
			nome: prize.nome,
			descrizione: prize.descrizione,
			costo: prize.costo,
			creato: prize.creato,
			prize: prize.termina,
		};
	});

	res.status(200).json(prizes);
});

// * curl -X POST http://localhost:3000/prizes -H "Content-Type: application/json" -d "{\"attivo\": true, \"nome\":\"Test\",\"descrizione\":\"Premio di test\",\"costo\":9999,\"termina\":\"2026-12-31T23:00:00.000+00:00\"}"
router.post("/", async (req, res) => {
	const { attivo, nome, descrizione, costo, termina } = req.body;

	const alreadyStored = await Prize.findOne({ nome: nome });
	if (alreadyStored) {
		return res
			.status(400)
			.json({ success: false, message: "Prize already present" });
	}

	let prize = new Prize({
		attivo: attivo,
		nome: nome,
		descrizione: descrizione,
		costo: costo,
		creato: Date.now(),
		termina: termina,
	});

	prize = await prize.save().catch((e) => {
		return res
			.status(500)
			.json({ success: false, message: "Internal server error" });
	});

	let prizeID = prize._id;

	res
		.location("/prize/" + prizeID)
		.status(201)
		.send();
});

// * curl -X PATCH http://localhost:3000/prizes/6a04fa08c134aaeb67d9908b -H "Content-Type: application/json" -d "{\"nome\":\"Test2\", \"termina\":\"2026-08-31T23:00:00.000+00:00\"}"
router.patch("/:id", async (req, res) => {
	const { id } = req.params;
	// * NOTA: req.body deve avere i nomi dei parametri che matchano con quelli su mongoose
	const updatedPrize = await Prize.findByIdAndUpdate(id, req.body, {
		returnDocument: "after",
		runValidators: true,
	}).catch((e) => {
		return res.status(400).json({ success: false, message: "Invalid query" });
	});

	if (!updatedPrize) {
		return res.status(404).json({ success: false, message: "Prize not found" });
	}

	res.status(200).json({
		success: true,
		message: "Prize updated successfully",
		prize: updatedPrize,
	});
});

export default router;
