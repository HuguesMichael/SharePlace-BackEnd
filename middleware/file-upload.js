import multer from 'multer';
import path from 'path';
import {v1 as uuidV1} from 'uuid';

/*
Les types MIME (Multipurpose Internet Mail Extensions) sont des identifiants de 
format de données utilisés principalement sur Internet pour indiquer le type de 
contenu d'un fichier ou d'une ressource numérique
*/
const MIME_TYPES_MAP = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
}

const fileUpload = multer({
    limits: 5000000, // on limite la taille de l'image à 5000ko soit 5Mo
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/images'); // on enregistre l'image dans le dossier uploads/images
        },
        filename: (req, file, cb) => {
            const ext = MIME_TYPES_MAP[file.mimetype]; // on récupère l'extension de l'image à partir du type MIME
            // le ligne ci-dessus permet de faire une comparaison dynamique entre le type MIME et l'extension de l'image
            // pour retouner l'extension qui aura machée


            //cb(null, file.fieldname + '-' + Date.now() + '.' + ext); // on renomme l'image avec le nom du champ, la date et l'extension
            
            // Voici une autre façon de renommer l'image
            // on utilise la fonction uuidV1 pour générer un identifiant unique pour l'image
        
            cb(null, uuidV1() + '.' + ext); // on renomme l'image avec un identifiant unique et l'extension
           
            // ou bien on peut utiliser la date et le nom d'origine de l'image
           // cb(null, new Date().toISOString() + '-' + file.originalname); // on renomme l'image avec la date et le nom d'origine
        }
    }),
    fileFilter: (req, file, cb) => {
        const isValid = !!MIME_TYPES_MAP[file.mimetype]; // on vérifie si le type MIME de l'image est valide
        const error = isValid ? null : new Error('Type de MIME invalide'); // si le type MIME n'est pas valide, on renvoie une erreur
        cb(error, isValid); // on renvoie l'erreur et la validité du type MIME
    }
})


export default fileUpload;