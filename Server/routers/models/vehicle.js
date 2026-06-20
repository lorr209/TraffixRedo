import mongoose from "mongoose";
const { Schema } = mongoose;

export default mongoose.model(
	"Veicoli",
	new Schema(
		{
			data: {
				type: Date,
			},
			id_veicolo: { 
				type: String, 
			},
			lat: {
				type: Number,
			},
			lon: {
				type: Number,
			},
		},
		{
			collection: "Veicoli",
			versionKey: false,
		},
	),
);
