import app from "./Server/app.js";
import mongoose from "mongoose";

const port = process.env.PORT || 3000;

app.locals.db = mongoose.connect(process.env.DB_URL).then(() => {
	console.log("Connected to Database");

	app.listen(port, () => {
		console.log("Server listening on port", port);
	});
});
