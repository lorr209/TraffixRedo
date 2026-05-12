import express from "express";
import Ruolo from "./models/role.js";
import Visualizza from "./models/visualizza.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        let ruoli = await Ruolo.find({});

        const risposta = await Promise.all(ruoli.map(async (r) => {
            
            const associazioni = await Visualizza.find({ Id_Ruolo: r._id }).populate("Id_Modulo"); // Otteniamo i dati del Modulo

            return {
                self: "/ruolo/" + r._id,
                nome: r.Nome,
                descrizione: r.Descrizione,
                moduli: associazioni.map(a => a.Id_Modulo) 
            };
        }));

        res.status(200).json(risposta);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Errore nel recupero dei ruoli e moduli" });
    }
});

export default router;