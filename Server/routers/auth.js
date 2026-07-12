import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "./models/user.js"; 
import Log from "./models/log.js";

const router = express.Router();

router.post("/", async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res
			.status(400)
			.json({ success: false, message: "Arguments not found" });
	}

	let user = await User.findOne({ email: email });

	if (!user) {
		return res.status(404).json({ success: false, message: "User not found" });
	}

	const validPass = await bcrypt.compare(password, user.password);

	if (!validPass) {
		return res
			.status(401)
			.json({ success: false, message: "Wrong credentials" });
	}

	// --- 2. SALVATAGGIO LOG ACCESSO ---
	try {
		const newLog = new Log({
			data: new Date(), // Salva la data e l'ora attuali
			utente: user._id   // Associa l'ID dell'utente appena validato
		});
		await newLog.save();
	} catch (error) {
		console.error("Errore durante il salvataggio del log di accesso:", error);
		// Non blocchiamo l'esecuzione del login se il log fallisce
	}
	// ----------------------------------

	var payload = {
		email: user.email,
		id: user._id,
	};

	var options = { expiresIn: 1800 }; // expires in 30 min

	var token = jwt.sign(payload, process.env.SUPER_SECRET, options);

	var response = {
		success: true,
		message: "Enjoy your token!",
		token: token,
		email: user.email,
		id: user._id,
		self: "users/" + user._id,
	};

	return res
		.status(200)
		.cookie("token", token, {
			httpOnly: true, // Blocca lettura tramite JS per maggiroe sicurezza
			maxAge: options.expiresIn * 1000, // * 1000 per passaggio s -> ms
		})
		.json(response);
});

export default router;