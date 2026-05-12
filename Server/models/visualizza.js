import mongoose from "mongoose";
const { Schema } = mongoose;

export default mongoose.model(
	"Visualizza",
	new Schema(
		{
			Id_Modulo: {
				type: Schema.Types.ObjectId,
				ref: "Modulo",
                required: true,     // il tag deve sempre avere un nome
                trim: true          // rimozione spazzi vuoti accidentali
			},
            Id_Ruolo: {
				type: Schema.Types.ObjectId,
				ref: "Ruolo",
                required: true,     // il tag deve sempre avere un nome
                trim: true          // rimozione spazzi vuoti accidentali
			}
		},
		{
			collection: "Visualizza",
		},
	),
);