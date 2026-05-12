import mongoose from "mongoose";
const { Schema } = mongoose;

export default mongoose.model(
	"Visualizza",
	new Schema(
		{
			Id_Lamentele: {
				type: Schema.Types.ObjectId,
                ref: "Lamentela",
                required: true,     // il tag deve sempre avere un nome
                trim: true          // rimozione spazzi vuoti accidentali
			},
            Id_Tag: {
				type: Schema.Types.ObjectId,
                ref: "Tag",
                required: true,     // il tag deve sempre avere un nome
                trim: true          // rimozione spazzi vuoti accidentali
			}
		},
		{
			collection: "Visualizza",
		},
	),
);