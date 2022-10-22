
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
// conteur de likes
exports.likesCounter = (req, res, next) => {
    // cherche la bonne sauce à modifier
    sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            // ajout du statut like/dislike dans une constante
            const like = req.body.like;
            // si le user a déjà liké:
            if (sauce.usersLiked.includes(req.body.userId)) {
                // supprime son like
                sauce.likes--;
                // supprime son id de la base
                const index = sauce.usersLiked.indexOf(req.body.userId);
                sauce.usersLiked.splice(index, 1);
                //sinon si le user vient  de liker:
            } else if (like === 1) {
                // rajoute un like dans la base
                sauce.likes++;
                // rajoute l'id du user dans la base
                sauce.usersLiked.push(req.body.userId);
            }
            // si le user a déjà disliké:
            if (sauce.usersDisliked.includes(req.body.userId)) {
                // supprime son dislike
                sauce.dislikes--;
                // supprime son id de la base
                const index = sauce.usersDisliked.indexOf(req.body.userId);
                sauce.usersDisliked.splice(index, 1);
                //sinon si le user vient de disliker:
            } else if (like === -1) {
                // rajoute un dislike dans la base
                sauce.dislikes++;
                // rajoute l'id du user dans la base
                sauce.usersDisliked.push(req.body.userId);
            }
            sauce
                .save()
                .then(() => res.status(200).json({ message: "Sauce liké/disliké !" }))
                .catch((error) =>
                    res
                        .status(400)
                        .json({ error: "Impossible de liké/disliké la Sauce !" })
                );
        })
        .catch((error) => res.status(400).json({ error }));
};



// exports.likesCounter = (req, res, next) => {
//     // si on ajoute un like
//     console.log('titi');
//     if (req.body.like == 1) {
//         sauce.updateOne(
//             // $inc: https://www.mongodb.com/docs/manual/reference/operator/update/inc/
//             // $push: https://www.mongodb.com/docs/v4.4/reference/operator/aggregation/push/?_ga=2.176219173.1827655912.1666263678-886365038.1665163121&_gac=1.155570377.1665327942.Cj0KCQjw4omaBhDqARIsADXULuXdVFMNAnt7ykruzd46Fq1nJFNjNiXAbaXcnavwEngI6juOBhh2ntUaApi_EALw_wcB
//             { _id: req.params.id },
//             { $inc: { likes: +1 }, $push: { userLiked: req.body.userId } },
//             // // { _id: req.params.id }
//         )
//             .then(() => { res.status(200).json({ message: 'Like Ajouté!' }) })
//             .catch(error => res.status(400).json({ error }));
//         //si on ajoute un dislike
//     } if (req.body.like == -1) {
//         sauce.updateOne(
//             { _id: req.params.id },
//             { $inc: { dislikes: +1 }, $push: { userDisliked: req.body.userId } },
//             // { _id: req.params.id }
//         )
//             .then(() => { res.status(200).json({ message: 'Dislike Ajouté!' }) })
//             .catch(error => res.status(400).json({ error }));
//     } else {
//         console.log('tutu');
//         // on recherche la sauce avec findOne via son id
//         sauce.findOne({ _id: req.params.id })
//             .then((sauce) => {
//                 // si on retire un like
//                 // si userId est présent dans le tableau correspondant, alors:
//                 if (sauce.usersLiked.includes(req.body.userId)) {
//                     sauce.updateOne(
//                         { _id: req.params.id },
//                         { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } },
//                         // { _id: req.params.id }
//                     )
//                         .then(() => res.status(200).json({ message: 'Like retiré!' }))
//                         .catch((error) => res.status(400).json({ error }));
//                     // si on retire un dislike
//                     //si userId est présent dans le tableau correspondant, alors:
//                 }
//                 if (sauce.usersDisliked.includes(req.body.userId)) {
//                     sauce.updateOne(
//                         //On modifie la sauce correspondante à l'id envoyé dans les paramètres de requêtes enlevant userId du tableau usersDislikeiked (-1)
//                         { _id: req.params.id },
//                         { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } },
//                         // { _id: req.params.id }
//                     )
//                         .then(() => res.status(200).json({ message: 'Dislike retiré!' }))
//                         .catch((error) => res.status(400).json({ error }));
//                 }
//                 if (!sauce.usersLiked.includes(validateUserId) && !sauce.usersDisliked.includes(validateUserId)) {
//                     res.status(401).json({ message: "Vous n'avez pas encore laissé d'appréciation" });
//                 }
//             }
//             )
//             .catch((error) => res.status(400).json({ error }));
//     }
// }