import express from "express";
import jwt from "jsonwebtoken";
import User from "./models/user.js"; // Importa il modello di mongoose

// * REQUEST EXAMPLE curl -X POST http://localhost:3000/auth  -H "Content-Type: application/json" -d "{\"email\":\"esempio@gmail.com\",\"password\":\"Hash_Esempio\"}"

const router = express.Router();

router.post("/", async (req, res) => {
	let user = await User.findOne({ Email: req.body.email }).exec();

	if (!user) {
		res.json({ success: false, message: "User not found" });
	}

	if (user.Password != req.body.password) {
		res.json({ success: false, message: "Wrong password" });
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

	res.status(200).json(response);
});

export default router;
