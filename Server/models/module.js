import mongoose from "mongoose";
const { Schema } = mongoose;

export default mongoose.model(
	"Modulo",
	new Schema(
		{
			Nome: {
				type: String,
                required: true,     // il tag deve sempre avere un nome
                trim: true          // rimozione spazzi vuoti accidentali
			},
            Path: {
				type: String,
                required: true,     // il tag deve sempre avere un nome
                trim: true          // rimozione spazzi vuoti accidentali
			},
            Descrizione: {
				type: String,
                default: ""
			},
            Attivo: {
                type: Boolean,
                default: false
            }
		},
		{
			collection: "Modulo",
		},
	),
);