const sauce = require('../models/thing');



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
    delete req.body._id;
    const thing = new sauce({
        ...req.body
    });
    thing.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistée !' }))
        .catch(error => res.status(400).json({ error }));
};

//modification d'une sauce existante
exports.modifySauce = (req, res, next) => {
    sauce.updateOne({ _id: req.params.id }, {
        ...req.body, _id: req.params.id
    })
        .then(() => res.status(200).json({ message: 'Sauce modifié !' }))
        .catch(error => res.status(400).json({ error }));
};

//supression d'une sauce
exports.deleteSauce = (req, res, next) => {
    sauce.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
        .catch(error => res.status(400).json({ error }));
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
