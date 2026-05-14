import mongoose from "mongoose";
const { Schema } = mongoose;

export default mongoose.model(
	"Utenti",
	new Schema(
		{
			attivo: {
				type: Boolean,
			},
			nome: {
				type: String,
			},
			cognome: {
				type: String,
			},
			email: {
				type: String,
			},
			password: {
				type: String,
			},
			creato: {
				type: Date,
			},
			ruolo: {
				type: Schema.Types.ObjectId,
			},
		},
		{
			collection: "Utenti",
			versionKey: false,
		},
	),
);
