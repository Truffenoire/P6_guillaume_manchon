// modules và integrer
const Sauce = require('../models/sauce');
const fs = require('fs')


exports.getAllSauce = (req, res, next) => {
// Renvoi toutes les sauces
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({error}));
}

exports.getOneSauce = (req, res, next) => {
// Renvoi une seule sauce avec la recherche par l'id de la requête
    Sauce.findOne({_id: req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(400).json({error}));
}

exports.createSauce = (req, res, next) => {
// transforme la requête dans un objet utilisable avec parse
    const sauceObjet = JSON.parse(req.body.sauce)
    delete sauceObjet._id
    console.log(sauceObjet);
// créé un enfant de sauce avec tout ce qu'il y a dans la requête et ajoute l'url de l'image et tout ce qui concerne le like/disslike
    const sauce = new Sauce ({
        ...sauceObjet,
        likes: 0,
        dislikes: 0,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        usersLiked: [],
        usersDisliked: [],
    })
    console.log(sauce);
// enregistre la sauce
    sauce.save()
    .then(() => res.status(201).json({message: "Sauce ajouté !"}))
    .catch((error) => res.status(400).json({error}))
}

exports.deleteSauce = (req, res, next) =>{
// trouve la sauce qui correspond à la requête
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
// recupère le nom du fichier et le supprime avec fs
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
// supprime la sauce qui correspond à la requête
            Sauce.deleteOne({_id: req.params.id})
            .then(() => res.status(200).json({message: 'Sauce supprimé.'}))
            .catch(error => res.status(400).json({error}));
        });
    })
    .catch(error => res.status(500).json({error}));
}
  
// Modifier une sauce 
exports.upDateSauce = (req, res, next) => {
// Si l'image est modifiée, on supprime l'ancienne image dans /image
    if(req.file) {
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    const sauceObject = 
                    {   
                        ...JSON.parse(req.body.sauce),
                        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                    }
                    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce modifiée avec succès !' }))
                        .catch(error => res.status(400).json({ error }))
                });
            });
// Si l'image n'est pas modifée
    } else { 
        const sauceObject = { ...req.body } 
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce modifiée avec succès !' }))
            .catch(error => res.status(400).json({ error }))
    }
}

exports.likeDisslikeSauce = (req, res, next) => {
    const userId = req.body.userId;
    const like = req.body.like;

    console.log(like);
    Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
        const newSauceLike = {
            usersLiked: sauce.usersLiked,
            usersDisliked: sauce.usersDisliked,
            likes: 0,
            dislikes: 0
        }
        switch(like) {
// Si like = 0 verifie que l'user n'est pas présent dans l'array like/dislike si présent le supprime de l'array 
            case 0: 
            if(newSauceLike.usersLiked.includes(userId)) {
                const indexUser = newSauceLike.usersLiked.indexOf(userId)
                newSauceLike.usersLiked.splice(indexUser, 1)    

            } else if (newSauceLike.usersDisliked.includes(userId)) {
                const indexUser = newSauceLike.usersDisliked.indexOf(userId)
                newSauceLike.usersDisliked.splice(indexUser, 1)
            }
            break;
//si like = 1 ajoute son l'id dans l'array like
            case 1: newSauceLike.usersLiked.push(userId)
            break;
//si like = -1 ajoute son l'id dans l'array dislike
            case -1: newSauceLike.usersDisliked.push(userId)
            break;
        }

        console.log(newSauceLike);
// definie la valeur des likes/dislikes a la longueur de l'array
        newSauceLike.likes = newSauceLike.usersLiked.length;
        newSauceLike.dislikes = newSauceLike.usersDisliked.length;
// recupère l'id de la requete dans la base de donnée et la modifie 
        Sauce.updateOne({ _id: req.params.id }, {...newSauceLike, _id: req.params.id})
        .then(()=> res.status(201).json({message: 'like/dislike mis à jour.'}))
        .catch(error => res.status(400).json({error}))
    })
    .catch(error => res.status(400).json({error}));
}