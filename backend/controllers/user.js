const bcrypt = require('bcrypt')
const User = require('../models/user')
const cryptojs = require('crypto-js')
const jwt = require('jsonwebtoken')
require('dotenv').config();

//middleware pour s'enregistrer
exports.signup = (req, res, next) => {
    // CryptoJs pour chiffrer l'adresse Email
    const cryptoEmail = cryptojs.HmacSHA1(req.body.email, process.env.KEY_SECRET).toString();
    // bcrypt pour chiffrer le MdP
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
            email: cryptoEmail,
            password: hash
        });
    user.save()
    .then(() => res.status(201).json({message: 'Utilisateur crée.'}))
    .catch(error => res.status(400).json({error : error}));
    })
    .catch(error => res.status(500).json({error}))
};

// middleware pour se loger
exports.login = (req, res, next) => {
// cryptage de l'email
    const cryptoEmail = cryptojs.HmacSHA1(req.body.email, process.env.KEY_SECRET).toString();

    User.findOne({email: cryptoEmail})
    .then(user => {
        if(!user){
            return res.status(401).json({message: "utilisateur non enregistré."})
        }
// comparaison du H avec bcrypt pour verifier le MdP
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if(!valid) {
                res.status(401).json({message: "Mot de passe incorrect."})
            }
// Si tout est valide création du token avec userId
            res.status(200).json({
                userId: user.id,
                token: jwt.sign(
                    {userId: user._id},
                    process.env.SECRET_TOKEN,
                    {expiresIn: '24h'}
                )
            })
        })
        .catch(error => res.status(500).json({error}));
    })
    .catch(error => res.status(500).json({error}));
};