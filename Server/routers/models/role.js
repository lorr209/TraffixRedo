import mongoose from "mongoose";
const { Schema } = mongoose;

export default mongoose.model(
	"Ruolo",
	new Schema(
		{
			nome: {
				type: String,
			},
			descrizione: {
				type: String,
			},
			moduli: [
				{
					type: Schema.Types.ObjectId,
					ref: "Modulo",
				},
			],
		},
		{
			collection: "Ruolo",
			versionKey: false,
		},
	),
);
