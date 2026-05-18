import express from "express";
import Role from "./models/role.js"; // Importa il modello di mongoose

const router = express.Router();

router.get("/", async (req, res) => {
	let roles = await Role.find({});

	roles = roles.map((role) => {
		return {
			self: "/roles/" + role._id,
			nome: role.nome,
			descrizione: role.descrizione,
			moduli: role.moduli,
		};
	});

	res.status(200).json(roles);
});

router.get("/:id", async (req, res) => {
	const { id } = req.params;

	let role = await Role.findById(id).catch((e) => {
		return res.status(400).json({ success: false, message: "Invalid query" });
	});

	if (!role) {
		return res.status(404).json({ success: false, message: "Role not found" });
	}

	response = {
		self: "/roles/" + role._id,
		nome: role.nome,
		descrizione: role.descrizione,
		moduli: role.moduli,
	};

	res.status(200).json(response);
});

// * curl -X POST http://localhost:3000/roles -H "Content-Type: application/json" -d "{\"nome\":\"Test\",\"descrizione\":\"Ruolo di test\",\"moduli\":[]}"
router.post("/", async (req, res) => {
	const { nome, descrizione, moduli } = req.body;

	if (!nome || !descrizione || !moduli) {
		return res
			.status(400)
			.json({ success: false, message: "Invalid Arguments" });
	}

	const alreadyStored = await Role.findOne({ nome: nome });
	if (alreadyStored) {
		return res
			.status(400)
			.json({ success: false, message: "Role already present" });
	}

	let role = new Role({
		nome: nome,
		descrizione: descrizione,
		moduli: moduli,
	});

	role = await role.save().catch((e) => {
		return res
			.status(500)
			.json({ success: false, message: "Internal server error" });
	});

	const createdRole = {
		self: "/roles/" + role._id,
		nome: role.nome,
		descrizione: role.descrizione,
		moduli: role.moduli,
	};

	res
		.location("/roles/" + role._id)
		.status(201)
		.json(createdRole);
});

// * curl -X PATCH http://localhost:3000/roles/6a04eb8b8338a04e2783415d -H "Content-Type: application/json" -d "{\"nome\":\"TestConMappa\",\"descrizione\":\"Ruolo di test che può vedere una mappa\",\"moduli\":[\"6a04dc91dc20e82d65f68209\"]}"
router.patch("/:id", async (req, res) => {
	const { id } = req.params;

	// * NOTA: req.body deve avere i nomi dei parametri che matchano con quelli su mongoose
	const updatedRole = await Role.findByIdAndUpdate(id, req.body, {
		returnDocument: "after",
		runValidators: true,
	}).catch((e) => {
		return res.status(400).json({ success: false, message: "Invalid query" });
	});

	if (!updatedRole) {
		return res.status(404).json({ success: false, message: "Role not found" });
	}

	res.status(200).json({
		success: true,
		message: "Role updated successfully",
		role: updatedRole,
	});
});

export default router;
