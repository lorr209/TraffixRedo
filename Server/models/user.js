import mongoose from "mongoose";
const { Schema } = mongoose;

export default mongoose.model(
	"Utenti",
	new Schema(
		{
			Attivo: {
				type: Boolean,
			},
			Nome: {
				type: String,
			},
			Cognome: {
				type: String,
			},
			Email: {
				type: String,
			},
			Password: {
				type: String,
			},
			Data_Creazione: {
				type: Date,
			},
			Ruolo: {
				type: Schema.Types.ObjectId,
			},
		},
		{
			collection: "Utenti",
		},
	),
);
