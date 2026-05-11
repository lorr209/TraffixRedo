import express from "express";
import Tag from "./models/tag.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const tags = await Tag.find({});
        
        const risposta = tags.map((t) => {
            return {
                self: "/tags/" + t._id,
                id: t._id,
                nome: t.Nome,
                descrizione: t.Descrizione
            };
        });

        res.status(200).json(risposta);
    } catch (err) {
        res.status(500).json({ error: "Errore nel caricamento tag" });
    }
});

export default router;