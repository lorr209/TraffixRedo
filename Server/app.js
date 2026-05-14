import express from "express";
import cors from "cors";
import test from "./test.js";
import auth from "./auth.js";
import tokenChecker from "./tokenChecker.js";
import logs from "./logs.js";
import mongoose from "mongoose";
import users from "./users.js";
import modules from "./modules.js";
import roles from "./roles.js";
import complaints from "./complaints.js";
import traffic from "./traffic.js";
import prizes from "./prizes.js";

// ? Sarebbe un failsafe ma non avendo static (e non sapendo se implementarlo) non so se sia necessario
const frontend = process.env.FRONTED || "static";

// Setup iniziale
const app = express();

// Abilita cors
app.use(cors());

// Abilita la lettura di file JSON
app.use(express.json());

// Serve la pagina di vue (Va buildata in precedenza)
app.use("/", express.static(frontend));

// Test
app.use("/test", test);

// API protette

// API effettive
app.use("/auth", auth);
app.use("/logs", tokenChecker, logs);
app.use("/users", users);
app.use("/modules", modules);
app.use("/roles", roles);
app.use("/complaints", complaints);
app.use("/traffic", traffic);
app.use("/prizes", prizes);
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
