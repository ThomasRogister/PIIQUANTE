const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userModel = require('../models/user');

// hachage du mot + ajout user à la BD
exports.signUp = (req, res, next) => {
    bcrypt.hash(req.body.password, 12, function (err, hash) {
        // Store hash in your password DB.
        const user = new userModel({
            email: req.body.email,
            password: hash
        });
        user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé!' }))
            .catch(error => res.status(400).json({ error, message: 'problème sauvegarde' }));
    });

    // .catch(error => res.status(400).json({ error,  message: 'problème connection' }));
}

// vérification identification user avec dans la res. id + token 
exports.login = (req, res, next) => {
    userModel.findOne({ email: req.body.email })
        .then(user => {
            if (user === null) {
                res.status(401).json({ message: 'paire identifiant/mot de passe incorecte' });
            } else {
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            res.status(401).json({ message: 'paire identifiant/mot de passe incorecte' });
                        } else {
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign(
                                    { userId: user._id },
                                    '9hF8-LOBuYv%aZ3VduvA-bR#Ez',
                                    { expiresIn: '24h' }
                                )
                            });
                        }
                    })
                    .catch(error => { res.status(500).json({ error }) })
            }
        })
        .catch(error => res.status(400).json({ error }));
};