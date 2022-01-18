const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet')
require('dotenv').config();
const userRoutes = require('./routes/user');
const sauceRoutes= require('./routes/sauce');

// connection a MongoDB
mongoose.connect(process.env.SECRET_MDB,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();


// Autorisation d'accès au differente methode
app.use(helmet())
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    // pour Helmet qui me bloque les images sinon... a voir avec mentor
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    // -----------------------------------------------------------
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
  });
  
app.use(express.json());  

// gestion de requête vers le dossier images/
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/auth/', userRoutes);
app.use('/api/sauces/', sauceRoutes);
app.use('/api/sauce/:id/like', sauceRoutes);

module.exports = app;