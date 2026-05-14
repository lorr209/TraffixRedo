import mongoose from "mongoose";
const { Schema } = mongoose;

export default mongoose.model(
	"Premi",
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
			costo: {
				type: Number,
			},
			creato: {
				type: Date,
			},
			termina: {
				type: Date,
			},
		},
		{
			collection: "Premi",
			versionKey: false,
		},
	),
);
