const express = require('express');
const mongoose = require('mongoose');

const app = express();

mongoose.connect('mongodb+srv://LeoBrd:43LHxFbLd4X2f7oy@mon-vieux-grimoire.oltcf.mongodb.net/?retryWrites=true&w=majority&appName=Mon-vieux-grimoire')
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res) => {
    res.json({ message: 'Votre requête a bien été recue !'})
})

module.exports = app;