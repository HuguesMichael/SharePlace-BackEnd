import HttpError from '../models/http-error.js';
import { validationResult } from 'express-validator';
import User from '../models/user.js';
import bcrypt from 'bcryptjs'; // on va utiliser bcrypt pour hasher le mot de passe
import jwt from 'jsonwebtoken'; // on va utiliser jsonwebtoken pour créer un token d'authentification

// ------------------ get users --------------------------------------------------------------
const getUtilisateurs = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-motdepasse');
    } catch (error) {
        return next(
            new HttpError(
                "Impossible de trouver les utilisateurs, veuillez reassez plutard",
                500
            )
        );
    }
    if (users.length === 0) {
        return res.json({ message: "Aucun utilisateur existant pour le moment" });
    }
    res.json({ users: users.map(u => u.toObject({ getters: true })) });
};

// ------------------------------- create user ------------------------------------------------
const createUser = async (req, res, next) => {
    const { nom, email, motdepasse } = req.body;

    const errors = validationResult(req); // il se sert da la configuration de check effectuée
    console.log(errors);
    if (!errors.isEmpty()) {
        throw new HttpError('Les Entrées sont invalides, vérifiez vos données', 422);
    }

    let existedUser;
    try {
        existedUser = await User.findOne({ email: email });
    } catch (error) {
        return next(
            new HttpError("Impossible de créer cet utilisateur, ressayez plutard", 500)
        );
    }

    if (existedUser) {
        return next(
            new HttpError(
                "Impossible de créer cet utilisateur, cet email existe déja",
                422
            )
        );
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(motdepasse, 12);
    } catch (error) {
        return next(
            new HttpError("Impossible de créer cet utilisateur, ressayez plutard", 500)
        );
    }

    const createdUser = new User({
        nom,
        email,
        motdepasse: hashedPassword,
        image: req.file.path, // on utilise l'url de l'image pour l'afficher dans le navigateur
        places: []
    });

    try {
        await createdUser.save();
    } catch (error) {
        return next(
            new HttpError("Impossible de créer cet utilisateur, ressayez plutard", 500)
        );
    }
    let token;
    try {
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            process.env.JWT_SECRET, //se rassurer d'utiliser la meme clé pour le login et le signup
            { expiresIn: '1h' }
        );
    } catch (error) {
        return next(
            new HttpError("Impossible de créer cet utilisateur, ressayez plutard", 500)
        );
    }

    res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
};

//---------------------- login user ---------------------------------------------------
const loginUser = async (req, res, next) => {
    const { email, motdepasse } = req.body;

    let findedUser;
    try {
        findedUser = await User.findOne({ email: email });
    } catch (error) {
        return next(
            new HttpError('Erreur de connexion, reasseyer plutard', 500)
        );
    }

    if (!findedUser) {
        return next(
            new HttpError(
                "Utilisateur inexistant, veuillez entrer les bonnes informations",
                401
            )
        );
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(motdepasse, findedUser.motdepasse);
    } catch (error) {
        return next(
            new HttpError('Erreur de connexion verifier, reasseyer plutard', 500)
        );
    }

    if (!isValidPassword) {
        return next(
            new HttpError(
                "Utilisateur inexistant, veuillez entrer les bonnes informations",
                401
            )
        );
    }

     let token;
    try {
        token = jwt.sign(
            { userId: findedUser.id, email: findedUser.email },
            process.env.JWT_SECRET, //se rassurer d'utiliser la meme clé pour le login et le signup
            { expiresIn: '1h' }
        );
    } catch (error) {
        return next(
            new HttpError("Erreur de connexion, ressayez plutard", 500)
        );
    }

    res.status(200).json({
        userId: findedUser.id,
        email: findedUser.email,
        token: token
    });
};

export { getUtilisateurs, createUser, loginUser };
