import express from "express";
import User from "./models/user.js"; // Importa il modello di mongoose

// * REQUEST EXAMPLE: curl -X GET http://localhost:3000/users -H "x-access-token: yourtokenhere"

const router = express.Router();

router.get("/", async (req, res) => {
	/* if (!req.usergedUser) {
    return;
  } */

	// https://mongoosejs.com/docs/api.html#model_Model.find
	let users = await User.find({});

	users = users.map((user) => {
		return {
			self: "/users/" + user._id,
			attivo: user.Attivo, // Da aggiungere su mongo
			email: user.Email,
			nome: user.Nome,
			cognome: user.Cognome,
			data: user.Data_Creazione,
			ruolo: user.Ruolo,
		};
	});

	res.status(200).json(users);
});

router.post("/", (req, res) => {});

router.get("/:id", (req, res) => {});

router.patch("/:id/password", (req, res) => {});

router.get("/:id/moduli", (req, res) => {});

export default router;
