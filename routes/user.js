const express = require('express');
const router = express.Router();
const userCrtl = require('../controllers/user');


// hachage du mot + ajout user à la BD
router.post('/signUp', userCrtl.signUp);
// vérification identification user avec dans la res. id + token 
router.post('/login', userCrtl.login);



module.exports = router;