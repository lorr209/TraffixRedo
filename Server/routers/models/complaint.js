import mongoose from "mongoose";
const { Schema } = mongoose;

export default mongoose.model(
	"Lamentele",
	new Schema(
		{
			lat: {
				type: Number,
			},
			lon: {
				type: Number,
			},
			tipo: {
				type: String,
				enum: ["traffico", "tpl"],
			},
			data: {
				type: Date,
			},
			testo: {
				type: String,
			},
		},
		{
			collection: "Lamentele",
			versionKey: false,
		},
	),
);
