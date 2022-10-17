const thing = require('../models/thing');
const sauce = require('../models/thing');
const fs = require('fs');



//récupération de toutes les sauces de l'api
exports.findAllSauces = (req, res, next) => {
    sauce.find()
        .then(things => res.status(200).json(things))
        .catch(error => res.status(400).json({ error }));
};

//récupération d'un élément spécifique de l'api
exports.findSauce = (req, res, next) => {
    sauce.findOne({ _id: req.params.id })
        .then(thing => res.status(200).json(thing))
        .catch(error => res.status(404).json({ error }));
};

//création d'une nouvelle sauce avec (ou non) fichier 
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.thing);
    delete sauceObject._id;
    delete sauceObject.userId;
    const thing = new sauce({
        ...sauceObject,
        user: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/image/${req.file.filename}`
    });
    thing.save()
        .then(() => { res.status(201).jason({ message: 'Sauce enregistrée!' }) })
        .catch(error => res.status(400).json({ error }))
};

//modification d'une sauce existante
exports.modifySauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.thing);
    delete sauceObject._id;
    delete sauceObject._userId;
    const thing = new sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    thing.save()
        .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
        .catch(error => { res.status(400).json({ error }) })
};

//supression d'une sauce
exports.deleteSauce = (req, res, next) => {
    sauce.findOne({ _id: req.params.id })
        .then(thing => {
            if (thing.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non authorisé' });
            } else {
                const filename = thing.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Sauce supprimée !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(400).json({ error });
        });
};

// compteur de likes
exports.likesCounter = (req, res, next) => {
    sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            // like
            if (req.body.like == -1) {
                sauce.dislikes++; //ajout dislike
                sauce.usersDisliked.push(req.body.userId); //userId dans le tab des dislikes
                sauce.save();
            }
            //dislike
            if (req.body.like == 1) {
                sauce.likes++; //ajout like  
                sauce.usersliked.push(req.body.userId); //userId dans le tb des likes          
                sauce.save();
            }
        })
};
