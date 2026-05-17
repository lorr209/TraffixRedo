import express from "express";
import Module from "./models/module.js"; // Importa il modello di mongoose

const router = express.Router();

router.get("/", async (req, res) => {
	let modules = await Module.find({});
	modules = modules.map((module) => {
		return {
			self: "/modules/" + module._id,
			attivo: module.attivo,
			nome: module.nome,
			descrizione: module.descrizione,
			percorso: module.percorso,
		};
	});

	res.status(200).json(modules);
});

//curl -X PATCH http://localhost:3000/modules/6a04dcc1dc20e82d65f6820a -H "Content-Type: application/json" -d "{\"attivo\":true}"
router.patch("/:id", async (req, res) => {
	const { id } = req.params;
	const { attivo } = req.body;

	const updatedModule = await Module.findByIdAndUpdate(
		id,
		{ attivo: attivo },
		{
			returnDocument: "after",
			runValidators: true,
		},
	).catch((e) => {
		return res.status(400).json({ success: false, message: "Invalid query" });
	});

	if (!updatedModule) {
		return res
			.status(404)
			.json({ success: false, message: "Module not found" });
	}

	res.status(200).json({
		success: true,
		message: "Module updated successfully",
		module: updatedModule,
	});
});

export default router;
