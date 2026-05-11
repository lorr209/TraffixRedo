import mongoose from "mongoose";
const { Schema } = mongoose;

export default mongoose.model(
	"Utenti",
	new Schema(
		{
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
			Id_Ruolo: {
				type: Schema.Types.ObjectId,
			},
		},
		{
			collection: "Utenti",
		},
	),
);
