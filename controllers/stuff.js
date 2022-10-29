
const sauce = require('../models/sauce');
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
    const sauceObject = req.file
        // ? - si on modifie en renvoyant une nouvelle image
        ? {
            ...JSON.parse(req.body.sauce), imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
            // : - sinon on récupère les infos (image) dans le req.body
        } : { ...req.body };

    // l'utilisateur ne pourra modifier une sauce qu'avec ses identifiant (userId)
    delete sauceObject._userId;
    sauce.findById(req.params.id)
        .then((sauceFound) => {
            // si les userId ne correspondent pas, alors l'utilisateur n'est pas autorisé à modifié la sauce
            if (sauceFound.userId != req.auth.userId) {
                res.status(403).json({ message: "Non autorisé" });
                //Sinon on efface l'ancienne image du serveur si il y en a une nouvelle dans la requête
            } else {
                if (req.file) {
                    const filename = sauceFound.imageUrl.split("/images/")[1];
                    // unlink retire l'image du serveur 
                    fs.unlink(`images/${filename}`, () => {
                        // updateOne met à jour l'image lors de la modification
                        sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                            .then(() => res.status(200).json({ message: "Sauce modifiée!" }))
                            .catch(error => res.status(401).json({ error }));
                    });
                }
                else {
                    // sinon, mise à jour de la sauce avec la même image
                    sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: "Sauce modifiée!" }))
                        .catch(error => res.status(401).json({ error }));
                }
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
}


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
                sauce.likes--;
                const index = sauce.usersLiked.indexOf(req.body.userId);
                sauce.usersLiked.splice(index, 1);
                //si il n'y a pas de like 
            } else if (like === 1) {
                sauce.likes++;
                sauce.usersLiked.push(req.body.userId);
            }
            // si il y a déjà un dislike
            if (sauce.usersDisliked.includes(req.body.userId)) {
                sauce.dislikes--;
                const index = sauce.usersDisliked.indexOf(req.body.userId);
                sauce.usersDisliked.splice(index, 1);
                // si il n'y a pas de de dislike
            } else if (like === -1) {
                sauce.dislikes++;
                sauce.usersDisliked.push(req.body.userId);
            }
            sauce.save()
                .then(() => res.status(200).json({ message: "like/dislike effectué" }))
                .catch((error) => res.status(400).json({ error }));
        })
        .catch((error) => res.status(400).json({ error }));
};


