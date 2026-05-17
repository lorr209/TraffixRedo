import mongoose from "mongoose";
const { Schema } = mongoose;

export default mongoose.model(
	"Log_Accessi",
	new Schema(
		{
			data: {
				type: Date,
			},
			utente: {
				type: Schema.Types.ObjectId,
			},
		},
		{
			collection: "Log_Accessi",
			versionKey: false,
		},
	),
);
