import express from "express";
const router = express.Router();

router.get("/:id", async (req, res) => {
	res.status(200).json({ message: req.params.id });
});

export default router;
