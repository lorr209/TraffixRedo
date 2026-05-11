import express from "express";
import cors from "cors";
import test from "./test.js";
import auth from "./auth.js";
import tokenChecker from "./tokenChecker.js";
import logs from "./logs.js";
import mongoose from "mongoose";
import "dotenv/config";
import users from "./users.js";
const port = process.env.PORT || 3000;
const DB_connection = process.env.DASHBOARD_CONNECTION_STRING || null;

// Setup iniziale
const app = express();

// Abilita cors
app.use(cors());

// Abilita la lettura di file JSON
app.use(express.json());

// Serve la pagina di vue (Va buildata in precedenza)
app.use("/", express.static("dist"));

/*
/**
 * Serve front-end static files
 
const FRONTEND = process.env.FRONTEND || Path.join( __dirname, '..', 'node_modules', 'easylibvue', 'dist' );
app.use('/EasyLibApp/', express.static( FRONTEND ));
console.log( "Vue FRONTEND from", FRONTEND, "at http://localhost:" + process.env.PORT || 8080 + "/EasyLibApp" )

// If process.env.FRONTEND folder does not contain index.html then use the one from static
app.use('/', express.static('static')); // expose also this folder



/**!
!!! * Serve openAPI
!!!----------------------------- 
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



app.use((req,res,next) => {
    console.log(req.method + ' ' + req.url)
    next()
})
*/

/* connessioni Multiple
// The base URI without the database name at the end
const baseUri =
	"mongodb+srv://lorenzodenato_db_user:XUoRAkfXUqGdBrwS@traffix.gab4lt7.mongodb.net";

// Create specific connections
export const userDB = mongoose.createConnection(`${baseUri}/Traffix_MongoDB`);
export const complaintDB = mongoose.createConnection(
	`${baseUri}/Traffix_Lamentele`,
);
export const dashboardDB = mongoose.createConnection(
	`${baseUri}/Traffix_Dashboard`,
);

console.log("Connections initialized...");
*/

// Test
app.use("/test", test);

// API protette

// API effettive
app.use("/auth", auth);
app.use("/logs", tokenChecker, logs);
app.use("/users", users);
/*
  Serve front-end static files
 
const FRONTEND = process.env.FRONTEND || Path.join( __dirname, '..', 'node_modules', 'easylibvue', 'dist' );
app.use('/EasyLibApp/', express.static( FRONTEND ));
console.log( "Vue FRONTEND from", FRONTEND, "at http://localhost:" + process.env.PORT || 8080 + "/EasyLibApp" )

// If process.env.FRONTEND folder does not contain index.html then use the one from static
app.use('/', express.static('static')); // expose also this folder
*/
/*import express from "express";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use("/", express.static(__dirname + "/Pages"));

var logged = false;
app.get("/", (req, res) => {
  if (logged) {
    res.redirect("/main-page.html");
    console.log("afa");
  } else {
    res.redirect("/login.html");
  }
});

app.post("/main-page.html", (req, res) => {
  res.redirect("/main-page.html");
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
*/

export default app;
