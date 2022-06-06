const express = require('express')
const app = express()
const connection = require("./db-config")
require('dotenv').config()

const setupRoutes = require('./routes');

setupRoutes(app);

app.use(express.json())

connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion: ' + err.stack);
  } else {
    console.log("Connecté à la base de données");
  }
});


app.listen(process.env.SERVER_PORT, (err) => {
  if (err) {
    console.log("Erreur lors de la création du serveur")
  }else {
    console.log("Serveur en place sur http://localhost:"+process.env.SERVER_PORT)
  }
})