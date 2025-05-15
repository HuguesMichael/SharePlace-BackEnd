import express from 'express';
import * as utilisateursControllers from "../controllers/utilisateurs-controllers.js"
import {check} from 'express-validator';
import fileUpload from '../middleware/file-upload.js';

const router = express.Router();
router.get('/', utilisateursControllers.getUtilisateurs);
router.post(
    '/signup',
    fileUpload.single('image'),
     // on utilise le middleware fileUpload pour gérer l'upload de l'image
    // on utilise le middleware fileUpload pour gérer l'upload de l'image
    //on precise 'image' parceque c'est une image qui est envoyée dans le formulaire
    // et aussi parceque c'est le nom du champ dans le formulaire
    // on utilise le middleware express-validator pour valider les données du formulaire
    
    [check('nom').not().isEmpty(),    
     check('email').isEmail(),
     check('motdepasse').isLength({min:8})
   ],
    utilisateursControllers.createUser)
router.post('/login', utilisateursControllers.loginUser)

export default router;

