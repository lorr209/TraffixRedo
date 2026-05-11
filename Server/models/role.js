import mongoose from "mongoose";
const { Schema } = mongoose;

export default mongoose.model(
	"Ruolo",
	new Schema(
		{
			Nome: {
				type: String,
                required: true,     // il tag deve sempre avere un nome
                trim: true          // rimozione spazzi vuoti accidentali
			},
            Descrizione: {
				type: String,
                default: ""
			},
            Moduli: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "Modulo"
                }
            ],
		},
		{
			collection: "Ruolo",
		},
	),
);