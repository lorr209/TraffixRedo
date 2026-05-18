import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
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

// ? Sarebbe un failsafe ma non avendo static (e non sapendo se implementarlo) non so se sia necessario
const frontend = process.env.FRONTEND || "static";
const loginPage = frontend + "/login.html";
const assets = frontend + "/assets";

// Setup iniziale
const app = express();

// Abilita cors
app.use(cors());

// Abilita la lettura di file JSON
app.use(express.json());

// Abilita cookies
app.use(cookieParser());

// Ruotes pubbliche
app.use("/auth", auth);
app.use("/login.html", express.static(loginPage));
app.use("/assets", express.static(assets));

// Routes protette
app.use("/", tokenChecker, express.static(frontend));

app.use("/logs", tokenChecker, logs);
app.use("/users", tokenChecker, users);
app.use("/modules", tokenChecker, modules);
app.use("/roles", tokenChecker, roles);
app.use("/complaints", tokenChecker, complaints);
app.use("/traffic", tokenChecker, traffic);
app.use("/prizes", tokenChecker, prizes);

// Error handler
app.use((err, req, res, next) => {
	res.status(500).send({ success: false, message: "Something went wrong!" });
});

/**
 * ! Per servire API, almeno la prima parte
 * app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    app.use((req,res,next) => {
      console.log(req.method + ' ' + req.url)
      next()
    })
 */

export default app;
