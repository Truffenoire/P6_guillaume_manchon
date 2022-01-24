const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  try {
// on recupère le token en splitant autour de l'espace entre bearer et lui
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
    const userId = decodedToken.userId;
// Si l'userId est présent et que celui ci est different, renvoi erreur 403
    if (req.body.userId && req.body.userId !== userId) {
      throw res.status(403).json({message: "utilisateur non autorisé."});
// sinon passe a la suite dans route (multer, method etc...)
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};