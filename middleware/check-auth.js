import HttpError from '../models/http-error.js';
import jwt from 'jsonwebtoken'; // on va utiliser jsonwebtoken pour créer un token d'authentification

export default (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    try {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; 
        // le token sera  sous cette forme  Authorization: 'Bearer TOKEN'  d'ou le split
        if (!token) {
            throw new Error('Echec d Authentification !');
        }
        const decodedToken = jwt.verify(token, process.env.JWT_KEY); // on verifie le token avec la clé secrète
        req.userData = { userId: decodedToken.userId };
        next(); // on passe à la suite du traitement de la requête
    } catch (err) {
        const error = new HttpError('Echec d Authentification!', 403);
        return next(error);
    }
}   
