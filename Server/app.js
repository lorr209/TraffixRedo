import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

import auth from "./routers/auth.js";
import tokenChecker from "./routers/tokenChecker.js";
import logs from "./routers/logs.js";
import users from "./routers/users.js";
import modules from "./routers/modules.js";
import roles from "./routers/roles.js";
import complaints from "./routers/complaints.js";
import traffic from "./routers/traffic.js";
import prizes from "./routers/prizes.js";

// Percorsi assoluti
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontend = process.env.FRONTEND || "dist";
const frontendPath = path.join(__dirname, "..", frontend);

// Setup iniziale
const app = express();

// Abilita cors
app.use(cors());

// Abilita la lettura di file JSON
app.use(express.json());

// Abilita cookies
app.use(cookieParser());

// Routes pubbliche
app.use("/api/auth", auth);

// Serve la pagina di login
app.get("/login.html", (req, res) => {
	res.sendFile(path.join(frontendPath, "login.html"));
});

// Serve gli asset del frontend
app.use("/assets", express.static(path.join(frontendPath, "assets")));

// Routes protette
app.use("/", tokenChecker, express.static(frontendPath));

app.use("/api/logs", tokenChecker, logs);
app.use("/api/users", tokenChecker, users);
app.use("/api/modules", tokenChecker, modules);
app.use("/api/roles", tokenChecker, roles);
app.use("/api/complaints", tokenChecker, complaints);
app.use("/api/traffic", tokenChecker, traffic);
app.use("/api/prizes", tokenChecker, prizes);

// Error handler
app.use((err, req, res, next) => {
	console.log(err);
	res.status(500).send({
		success: false,
		message: "Something went wrong!",
	});
});

export default app;