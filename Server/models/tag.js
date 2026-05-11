import mongoose from "mongoose";
const { Schema } = mongoose;

export default mongoose.model(
	"Tag",
	new Schema(
		{
			Nome: {
				type: String,
                required: true,     // il tag deve sempre avere un nome
                trim: true          // rimozione spazzi vuoti accidentali
			},
			Descrizione: {
				type: String,
                default: ""         // nel caso sia mancante
			},
		},
		{
			collection: "Tag",
		},
	),
);