import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";

import APItest from "./routers/APItest.js";
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

// Setup iniziale
const app = express();

// Abilita cors
app.use(cors());

// Abilita la lettura di file JSON
app.use(express.json());

// Serve la pagina di vue (Va buildata in precedenza)
app.use("/", express.static(frontend));

// Test
app.use("/APItest", APItest);

// API effettive
app.use("/auth", auth);
app.use("/logs", tokenChecker, logs);
app.use("/users", tokenChecker, users);
app.use("/modules", tokenChecker, modules);
app.use("/roles", tokenChecker, roles);
app.use("/complaints", tokenChecker, complaints);
app.use("/traffic", tokenChecker, traffic);
app.use("/prizes", tokenChecker, prizes);
/*
! Ricorda logica per reindirizzare alla pagina di login
! Tecnicamente da gestire da vue, credo
var logged = false;
app.get("/", (req, res) => {
  if (logged) {
    res.redirect("/main-page.html");
    console.log("afa");
  } else {
    res.redirect("/login.html");
  }
});

*/

/**
 * ! Per servire API, almeno la prima parte
 * app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    app.use((req,res,next) => {
      console.log(req.method + ' ' + req.url)
      next()
    })
 */

export default app;
