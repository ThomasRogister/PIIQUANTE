
const sauce = require('../models/sauce');
const fs = require('fs');



//récupération de toutes les sauces de l'api

exports.findAllSauces = (req, res, next) => {
    // sauce.find({}, function (err, sauces) {
    //     console.log(sauces)
    // });
    console.log('toto');
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
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject.userId;
    const thing = new sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    thing.save()
        .then(() => { res.status(201).json({ message: 'Sauce enregistrée!' }) })
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
// compteur de likes/dislikes
exports.likesCounter = (req, res, next) => {
    // findOne cherche la sauce correspondante
    sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            const like = req.body.like;
            // si il y a déjà un like
            if (sauce.usersLiked.includes(req.body.userId)) {
                // on supprime le like
                sauce.likes--;
                // on supprime l'userId du tab dans la BD
                const index = sauce.usersLiked.indexOf(req.body.userId);
                sauce.usersLiked.splice(index, 1);
                //si il n'y a pas de like 
            } else if (like === 1) {
                // rajoute un like 
                sauce.likes++;
                // on rajoute l'userId dans le tab de la BD
                sauce.usersLiked.push(req.body.userId);
            }
            // si il y a déjçà un dislike
            if (sauce.usersDisliked.includes(req.body.userId)) {
                // on supprime le dislike
                sauce.dislikes--;
                // on supprime l'userId dans le tab dans la BD
                const index = sauce.usersDisliked.indexOf(req.body.userId);
                sauce.usersDisliked.splice(index, 1);
            } else if (like === -1) {
                // on rajoute un dislike
                sauce.dislikes++;
                // on rajoute l'userId dans le tab dans la BD
                sauce.usersDisliked.push(req.body.userId);
            }
            // on sauvegarde les changements de la sauce 
            sauce.save()
                .then(() => res.status(200).json({ message: "like/dislike effectué" }))
                .catch((error) => res.status(400).json({ error }));
        })
        .catch((error) => res.status(400).json({ error }));
};


