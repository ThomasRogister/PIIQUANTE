const express = require('express');
const userCrtl = require('../controllers/user');

const router = express.Router();

// hachage du mot + ajout user à la BD
router.post('/signUp', userCrtl.signUp);
// vérification identification user avec dans la res. id + token 
router.post('/login', userCrtl.login);



module.exports = router;