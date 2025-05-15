import fs from 'fs'; // Importation de fs pour la gestion des fichiers
import path from 'path'; // Importation de path pour la gestion des chemins de fichiers
import express from 'express';
import bodyParser from 'body-parser';
import placeRoutes from './routes/places-routes.js';
import utilisateursRoutes from './routes/utilisateurs-routes.js'
import HttpError from './models/http-error.js';
import mongoose from 'mongoose';
import cors from 'cors'; // Importation de cors pour gérer les problèmes de CORS
const app= express();
const port =5000;
app.use(cors()); // Utilisation de cors pour gérer les problèmes de CORS
/* Middleware pour contourner l' erreur  "Access to fetch at 'http://localhost:5000/api/users/signup' 
from origin 'http://localhost:3000' has been blocked by CORS policy ..." visible dans la console du navigateur */

//app.use(bodyParser.json());
app.use(express.urlencoded({extended:true})); // pour parser les données envoyées par le formulaire
app.use(express.json()); // pour parser les données envoyées par le formulaire




app.use('/uploads/images',express.static(path.join('uploads','images'))); // permet d'accéder aux images téléchargées dans le dossier uploads/images

app.use((req, res, next)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers',
    'Origin, X-requested-With, Content-Type, Accept, Authorization'); 
    // on autorise les entêtes clients à envoyer des requêtes avec ces entêtes
    // ils ne sont sensibles à la casse
   res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE'); 
  next();
})
app.use('/api/places/',placeRoutes); //=> /api/places/... express ne transmettra que les requêtes commençant par
                                     // /api/places/

 app.use('/api/users/',utilisateursRoutes); 
                
  app.use((req, res, next)=>{
       const error = new HttpError('Chemin non valide',404);
       throw error;

  })
app.use((error, req, res, next)=>{  // si vous utilisez un middleware avec quatre paramètres, express le considera comme une fonction erreur
 
  if(req.file){ // si un fichier a été téléchargé, on le supprime lors d'une erreur
    fs.unlink(req.file.path, err=>{ 
        console.log(err); // on affiche l'erreur dans la console
    })
    // on supprime le fichier du serveur
  }

  if(res.headerSent){
  return next (error);
}
res.status(error.code|| 500); // on pouvais .json() greffer à la suite status(). pour des soucis de lisibilité on prefère le mettre sur une ligne
res.json({message:error.message || "Une erreur inconnue s est produite"})

})
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8kvqtgc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
 mongoose.connect(url)
 .then(()=>{
  app.listen(port,()=>{

    console.log(`Le serveur tourne sur le port ${port}`);
})

 })
 .catch(error=>{
    console.log(error);

 })


