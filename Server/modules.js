import express from "express";
import Modulo from "./models/module.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const moduli = await Modulo.find({});
        
        const risposta = moduli.map((m) => {
            return {
                self: "/tags/" + m._id,
                id: m._id,
                nome: m.Nome,
                descrizione: m.Descrizione,
                path: m.Path,
                attivo: m.Attivo
            };
        });

        res.status(200).json(risposta);
    } catch (err) {
        res.status(500).json({ error: "Errore nel caricamento dei moduli" });
    }
});

export default router;