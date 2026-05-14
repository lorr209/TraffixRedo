import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "./models/user.js"; // Importa il modello di mongoose

// * REQUEST EXAMPLE curl -X POST http://localhost:3000/auth  -H "Content-Type: application/json" -d "{\"email\":\"mario.rossi@example.com\",\"password\":\"PasswordSicura123!\"}

const router = express.Router();

router.post("/", async (req, res) => {
	const { email, password } = req.body;
	let user = await User.findOne({ Email: email });

	if (!user) {
		return res.status(404).json({ success: false, message: "User not found" });
	}

	const validPass = await bcrypt.compare(password, user.Password);
	if (!validPass) {
		return res
			.status(401)
			.json({ success: false, message: "Wrong credentials" });
	}

	var payload = {
		email: user.email,
		id: user._id,
		//*other_data: encrypted_in_the_token,
	};

	var options = { expiresIn: 300 }; // expires in 5min

	var token = jwt.sign(payload, process.env.SUPER_SECRET, options);

	var response = {
		success: true,
		message: "Enjoy your token!",
		token: token,
		email: user.email,
		id: user._id,
		self: "auth/" + user._id,
	};

	return res.status(200).json(response);
});

export default router;
