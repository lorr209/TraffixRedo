import mongoose from "mongoose";
const { Schema } = mongoose;

export default mongoose.model(
	"Densità",
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
			quantità: {
				type: Number,
			},
		},
		{
			collection: "Densità",
			versionKey: false,
		},
	),
);
