import mongoose from "mongoose";
const { Schema } = mongoose;

export default mongoose.model(
	"Log_Accessi",
	new Schema(
		{
			Data: {
				type: Date,
			},
			Id_Utente: {
				type: Schema.Types.ObjectId,
			},
		},
		{
			collection: "Log_Accessi",
			versionKey: false,
		},
	),
);
