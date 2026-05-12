import express from "express";
import Lamentela from "./models/lamentela.js";
import LamentelaTag from "./models/lamentelaTag.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { tagId } = req.query; 
        let lamentele;

        if (tagId) {
            const associazioni = await LamentelaTag.find({ Id_Tag: tagId });

            const idsLamentele = associazioni.map(a => a.Id_Lamentela);

            lamentele = await Lamentela.find({ _id: { $all: idsLamentele } });
        } else {
            lamentele = await Lamentela.find({});
        }

        const risposta = await Promise.all(lamentele.map(async (lam) => {
            const tutteLeAssociazioni = await LamentelaTag.find({ Id_Lamentela: lam._id })
                                                           .populate("Id_Tag");

            return {
                self: "/lamentele/" + lam._id,
                testo: lam.Testo,
                posizione: { lat: lam.Latitudine, lng: lam.Longitudine },
                tags: tutteLeAssociazioni.map(a => a.Id_Tag),
                data: lam.DataInvio
            };
        }));

        res.status(200).json(risposta);
    } catch (err) {
        res.status(500).json({ error: "Errore nel filtraggio lamentele" });
    }
});

export default router;