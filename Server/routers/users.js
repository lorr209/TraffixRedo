import express from "express";
import bcrypt from "bcrypt";
import User from "./models/user.js"; // Importa il modello di mongoose
import Role from "./models/role.js";

// * REQUEST EXAMPLE: curl -X GET http://localhost:3000/users -H "x-access-token: yourtokenhere"

const router = express.Router();

router.get("/", async (req, res) => {
	const { role } = req.query;

	const filter = role ? { ruolo: role } : {};

	let users = await User.find(filter).catch((e) => {
		return res.status(400).json({ success: false, message: "Invalid query" });
	});

	users = users.map((user) => {
		return {
			self: "/users/" + user._id,
			attivo: user.attivo,
			email: user.email,
			nome: user.nome,
			cognome: user.cognome,
			creato: user.creato,
			ruolo: user.ruolo,
		};
	});

	res.status(200).json(users);
});

// Example: curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d "{\"nome\":\"Mario\",\"cognome\":\"Rossi\",\"email\":\"mario.rossi@example.com\",\"password\":\"PasswordSicura123!\",\"ruolo\":\"695b9d6f0d426d1902d2e8b2\"}"
router.post("/", async (req, res) => {
	const { nome, cognome, email, password, ruolo } = req.body;

	if (!nome || !cognome || !email || !password || !ruolo) {
		return res
			.status(400)
			.json({ success: false, message: "Invalid Arguments" });
	}

	const alreadyStored = await User.findOne({ email: email });

	if (alreadyStored) {
		return res
			.status(400)
			.json({ success: false, message: "User already present" });
	}

	const passHash = await bcrypt.hash(password, 1);

	let user = new User({
		attivo: true,
		nome: nome,
		cognome: cognome,
		email: email,
		password: passHash,
		creato: Date.now(),
		ruolo: ruolo,
	});

	user = await user.save().catch((e) => {
		return res
			.status(500)
			.json({ success: false, message: "Internal server error" });
	});

	const createdUser = {
		self: "/users/" + user._id,
		attivo: user.attivo,
		nome: user.nome,
		cognome: user.cognome,
		email: user.email,
		creato: user.creato,
		ruolo: user.ruolo,
	};

	res
		.location("/user/" + user._id)
		.status(201)
		.json(createdUser);
});

router.get("/:id", async (req, res) => {
	const { id } = req.params;

	let user = await User.findById(id).catch((e) => {
		return res.status(400).json({ success: false, message: "Invalid query" });
	});

	if (!user) {
		return res.status(404).json({ success: false, message: "User not found" });
	}

	const response = {
		self: "/users/" + user._id,
		attivo: user.attivo, // Da aggiungere su mongo
		email: user.email,
		nome: user.nome,
		cognome: user.cognome,
		creato: user.creato,
		ruolo: user.ruolo,
	};

	res.status(200).json(response);
});

router.patch("/:id", async (req, res) => {
	const { id } = req.params;

	// * NOTA: req.body deve avere i nomi dei parametri che matchano con quelli su mongoose
	const updatedUser = await User.findByIdAndUpdate(id, req.body, {
		returnDocument: "after",
	}).catch((e) => {
		return res.status(400).json({ success: false, message: "Invalid query" });
	});

	if (!updatedUser) {
		return res.status(404).json({ success: false, message: "User not found" });
	}

	res.status(200).json({
		success: true,
		message: "User updated successfully",
		user: updatedUser,
	});
});

router.patch("/:id/password", async (req, res) => {
	const { id } = req.params;
	const { password } = req.body;

	const passHash = await bcrypt.hash(password, 1);

	const updatedUser = await User.findByIdAndUpdate(
		id,
		{ password: passHash },
		{
			returnDocument: "after",
			runValidators: true,
		},
	).catch((e) => {
		return res.status(400).json({ success: false, message: "Invalid query" });
	});

	if (!updatedUser) {
		return res.status(404).json({ success: false, message: "User not found" });
	}

	res.status(200).json({
		success: true,
		message: "Password updated successfully",
	});
});

router.get("/:id/moduli", async (req, res) => {
	const { id } = req.params;

	const user = await User.findById(id).catch((e) => {
		return res.status(400).json({ success: false, message: "Invalid query" });
	});

	if (!user) {
		return res.status(404).json({ success: false, message: "User not found" });
	}

	const { moduli } = await Role.findById(user.ruolo);

	res.status(200).json(moduli);
});

export default router;
