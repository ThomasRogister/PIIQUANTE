
const express = require('express');
const stuffCrtl = require('../controllers/stuff');
const auth = require('auth');

const router = express.Router();


//récupération de toutes les sauces de l'api
router.get('/:id', auth, stuffCrtl.findAllSauces);
//récupération d'une sauce spécifique
router.get('/:id', auth, stuffCrtl.findSauce);
//création d'une nouvelle sauce avec (ou non) fichier 
router.post('/', auth, stuffCrtl.createSauce);
//modification d'une sauce existante
router.put('/:id', auth, stuffCrtl.modifySauce);
//supression d'une sauce
router.delete('/:id', auth, stuffCrtl.deleteSauce);
//compteur de likes
router.post('/', auth, stuffCrtl.likesCounter);

module.exports = router;



