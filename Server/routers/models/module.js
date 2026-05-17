import mongoose from "mongoose";
const { Schema } = mongoose;

export default mongoose.model(
	"Moduli",
	new Schema(
		{
			attivo: {
				type: Boolean,
			},
			nome: {
				type: String,
			},
			descrizione: {
				type: String,
			},
			percorso: {
				type: String,
			},
		},
		{
			collection: "Moduli",
			versionKey: false,
		},
	),
);
