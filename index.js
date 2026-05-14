import app from "./Server/app.js";
import mongoose from "mongoose";
import "dotenv/config";
const port = process.env.PORT || 3000;

/* 
  ? Setup per multiple connessioni, vedere se implementarlo cosi o meno (preferibilmente, no) (anche perchè questo non va)
const baseUri = process.env.BASE_CONNECTION_STRING;

//Crea le singole connesioni
export const userDB = mongoose.createConnection(`${baseUri}/Traffix_MongoDB`);
const complaintDB = mongoose.createConnection(`${baseUri}/Traffix_Lamentele`);
const dashboardDB = mongoose.createConnection(`${baseUri}/Traffix_Dashboard`);
 */

app.locals.db = mongoose
	.connect(process.env.DASHBOARD_CONNECTION_STRING)
	.then(() => {
		console.log("Connected to Database");

		app.listen(port, () => {
			console.log("Server listening on port", port);
		});
	});
