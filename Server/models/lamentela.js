import mongoose from "mongoose";
const { Schema } = mongoose;

export default mongoose.model(
	"Lamentele",
	new Schema(
		{
			Data: {
				type: Date,
			},
			Testo: {
				type: String,
                required: true,     // il tag deve sempre avere un nome
                trim: true          // rimozione spazzi vuoti accidentali
			},
            Latitudine: {
                type: Double,
                default: 0
            },
            Longitudine: {
                type: Double,
                default: 0
            },
            Tags: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "Tag"
                }
            ],
		},
		{
			collection: "Lamentele",
		},
	),
);