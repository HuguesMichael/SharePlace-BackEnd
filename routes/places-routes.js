import express from 'express';
import * as placesControllers from "../controllers/places-controllers.js";
import { check } from 'express-validator';
import fileUpload from '../middleware/file-upload.js';
import checkAuth from '../middleware/check-auth.js'; // on importe le middleware checkAuth pour vérifier si l'utilisateur est authentifié

const router = express.Router();

// ces deux routes pour être accessible, sans token
router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesByUserId);

// on utilise le middleware checkAuth pour vérifier si l'utilisateur est authentifié
router.use(checkAuth); // on utilise le middleware checkAuth pour vérifier si l'utilisateur est authentifié 
// on ne l'excute pas ici, mais on l'ajoute à la pile de middleware
// on l'ajoute à la pile de middleware, donc toutes les routes ci-dessous

// les routes ci-dessous  doivent  être accessible, avec token
// car la lecture se fait du haut vers le bas, donc on doit d'abord
// définir les routes qui ne nécessitent pas de token avant celles qui en nécessitent

router.post(
    '/',
    fileUpload.single('image'), // on utilise le middleware fileUpload pour gérer l'upload de l'image
    [
        check('title').not().isEmpty(), // ici on met tous nos mesures de contrôles. les paramètres de check
        // doivent êtes les mêmes nom qui sont trasmis dans le body de la requête
        check('description').isLength({ min: 5 }),
        check('address').not().isEmpty(),
        check('lat').not().isEmpty(),
        check('lng').not().isEmpty()
    ],
    placesControllers.createPlace
); /* une remarque, lorsqu'on crée un tel middleware, on ne peut ajouter plus d'une méthode après
le chemin */

router.patch(
    '/:pid',
    [
        check('title').not().isEmpty(), // ici on met tous nos mesures de contrôles. les paramètres de check
        // doivent êtes les mêmes nom qui sont trasmis dans le body de la requête
        check('description').isLength({ min: 5 }),
    ],
    placesControllers.updatePlace
);

router.delete('/:pid', placesControllers.deletePlace);

export default router;