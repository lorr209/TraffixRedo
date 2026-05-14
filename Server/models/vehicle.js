import mongoose from "mongoose";
const { Schema } = mongoose;

export default mongoose.model(
	"Veicoli",
	new Schema(
		{
			data: {
				type: Date,
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
