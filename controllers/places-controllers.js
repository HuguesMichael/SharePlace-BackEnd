import fs from 'fs'; // file system
import { validationResult } from 'express-validator';
import HttpError from '../models/http-error.js';
import getCoordForAdress from '../Util/localisation.js';
import Place from '../models/place.js';
import User from '../models/user.js';
import mongoose from 'mongoose';
 //-------------------------get place by Id -----------------------------

const getPlaceById = async (req, res, next)=>{   // ":" permet de creer un paramètre. pid sera remplacer par une valeur spécifique
    const placeId = req.params.pid; // permet de recuperer les paramètres sous cette forme par exemple {pid: 'p1'}
    let place;
    try{
         place = await Place.findById(placeId); // ne retourne pas de promesse pas nécessaire d'avoir async, await, ... pour avoir une promesse
        // il faut utiliser findById().exec()
    }  catch(error){
        return next (new HttpError('Erreur interne au serveur, impossible de trouver la place',500)); 
    } 
        if(!place){
            throw new HttpError('Nous ne pouvons pas trouver ce lieu',404); /*throw=lancer. Nous lançons simplement l'erreur. 
                          Pas besoin de return car throw annule déja l'exécution de la fonction
                          ceci est utiliser pour les opérations synchrones*/
                 }
        res.json({place:place.toObject({getters:true})}); // {place} <=> {place: place} 
        // toObject permet de faire la conversion d'un obejt Json vers un objet JS
        // mongoose lorsqu'il crée un document, il lui ajoute un récupérateur d'identifiant a
        // accessible via un get (qui renvoi ce dernier sous forme de chaine de caractères en supprimant de tiret de 8). 
        // Mais lorsque l'objet est crée le gettter est perdu
        // Pour empêcher cela que nous ajoutons {getters:true}
       
    
    }

//-------------------------get places by user Id -----------------------------

const getPlacesByUserId = async (req, res, next)=>{   
        const userId = req.params.uid; 

        /************************** 1ère approche**********************/
   /* let places;
   try{
        
       places = await Place.find({creator:userId}) ; // sans {creator:userId}, find() retournera toutes 
         les places.  dans mongoose find() retourne directement un tableau or dans mongoDB il retourne un 
         pointeur vers le resultat.
   }  catch(error){
       return next (new HttpError(
          'Erreur interne au serveur, impossible de trouver les places de cet utilisateur',500
     )); 
   } 
  
    if(!places||places.length===0){
            throw new HttpError(
                'Nous ne pouvons pas trouver ses lieux',404
            ); 
                 }
        res.json({places:places.map(place=>place.toObject({getters:true}))}); 
       
        
        
  
   */

     /************************** 2ème  approche*********************** en utilisant populate()*/

   let userWithPlaces;
   try {
      userWithPlaces = await User.findById(userId).populate('places');
   } catch (error) {
    return next (new HttpError(
          'Erreur interne au serveur, impossible de trouver les places de cet utilisateur',500
     )); 
   }

   if(!userWithPlaces||userWithPlaces.length===0){
    return next (new HttpError(
        'Nous ne pouvons pas trouver ses lieux',404
    )); 
         }
         console.log(userWithPlaces);
res.json({places:userWithPlaces.places.map(place=>place.toObject({getters:true}))}); 
        
}
//-------------------------create new place -----------------------------
    const createPlace = async (req, res, next)=>{
            const errors= validationResult(req); // il se sert da la configuration de check effectuée
             
            if(!errors.isEmpty()){
             return next(
                new HttpError(
                'Les Entrées sont invalides, vérifiez vos données', 
                422)
            );
            }

            const {title, description,address,lat, lng } =req.body;
          
            
           /* let localisation;
            try{
                localisation= await getCoordForAdress(address);

            } catch(error){   // voici le bout de code à utliser lorsque nous aurions notre clé API

                return next (error);
            }*/ 
           

            const createdPlace= new Place({
                title,
                description,
                image:req.file.path, // on utilise le middleware fileUpload pour gérer l'upload de l'image
                address,
                creator: req.userData.userId, 
                localisation:{
                    lat:parseFloat(lat),
                    lng:parseFloat(lng)
                }
            });
            // on se rassure si l'utlisateur qui veut créer la place existe vraiment
             
  
            let user;
            try {
                user = await User.findById(req.userData.userId); // on utilise le middleware checkAuth pour vérifier si l'utilisateur est authentifié
                
            } catch (err) {
                const error = new HttpError('La création a echoué, si vous plait ressayer encore',500);
                return next(error);
            }
        
            if(!user){
                const error = new HttpError('Nous ne pouvons pas trouver l identifiant de cet utilisateur',404);
                return next(error);
            }
 
             // si l'utilisateur existe nous devons non seulement créer la place mais aussi ajouter l'Id du créateur
             // cela nous fait multiple opérations. pour ce faire, nous allons utiliser le principe
             //  de transactions et sessions.
            try{
                // initialisation de la session
                const sess = await mongoose.startSession();
                // demarrage des transactions
                sess.startTransaction();
                await createdPlace.save({session:sess}); // ici on sauvergade effectivement dans le BD dans la session active
                 user.places.push(createdPlace) // push ( ) ici n' a pas la même sémentique que celui d'un tableau
                 // en JS. En effet il permet à moogoose d'établir en coulisse la relation entre User et place
                 // en effet moogoose , recupéra l'id de la place crée et le stockera.
                 await user.save({session:sess}); // Nous mettons à jour user. 
                 await sess.commitTransaction(); // Nous devons nous rassurer que la session valide la transaction
                 // ce n'est qu'a ce niveau que les modifications sont prises en compte dans le BD
                 // si quelque chose avait mal tournée durant la session et la transction
                 // toutes les modfications auraient été  automatiquement aannulées par mongoDB
                 // une chose importante ici. si la collection n'existe pas, elle ne sera pas créee automatique
                 // donc il faut d'abord le faire manuelement dans la BD
             } catch(err){
                  const error = new HttpError('La création a echoué, si vous plait ressayer encore',500);
                  return next(error);
             };
             
            
            res.status(201).json({place:createdPlace}); 
         

    }

    //-------------------------update place -----------------------------
        const updatePlace =  async (req, res, next)=>{
            const {title, description } =req.body;
            const errors= validationResult(req); // il se sert da la configuration de check effectuée
             console.log(errors);
            if(!errors.isEmpty()){
             throw new HttpError('Les Entrées sont invalides, vérifiez vos données', 422);

            }
            
            const placeId = req.params.pid; 
           let place;
        try{
            place = await Place.findById(placeId); // ne retourne pas de promesse pas nécessaire d'avoir async, await, ... pour avoir une promesse
        // il faut utiliser findById().exec()
         }  catch(error){
            return next (
                new HttpError(
                'Erreur interne au serveur, impossible de faire la mise à jour'
                ,500)
            ); 
         } 
        
        if(place.creator.toString()!==req.userData.userId){
            return next (
                new HttpError(
                'Vous ne pouvez pas faire la mise à jour de cette place'
                ,401)
            );
        }

        place.title =title;  // je vais la mise à jour
        place.description=description;
        try {
            await place.save();
            
        } catch (error) {
            return next (
                new HttpError(
                'Erreur interne au serveur, impossible de faire la mise à jour'
                ,500)
            ); 
        }
       
            res.status(200).json({place:place.toObject({getters:true})}); 
         

        }
//-------------------------delete place -----------------------------

        const deletePlace= async (req, res, next)=>{
            const placeId = req.params.pid;
             let place;
                 // Nous devons nous rassurer que la place à supprimer existe parmi nos place ainsi que
                 //  le créateur c'est pour cette raison que nous ajoutons la méthode populate( )
                 // Elle prend en paramètre le champ de l'autre table qui a  créee la realtion

                 try {
                    place = await Place.findById(placeId).populate('creator')
                 } catch (error) {
                    return next (
                        new HttpError(
                        'Erreur interne au serveur, impossible de faire la suppression '
                        ,500)
                    ); 
                 }

                // on se rassure si la place qu'on trouvé plus haut existe
                if(!place){
                    return next (
                        new HttpError(
                        'Vous ne pouvez pas supprimez cette place'
                        ,404)
                    ); 
                 
                }
                   
                // on se rassure si l'utilisateur qui veut supprimer la place existe vraiment
                // et qu'il est bien le créateur de la place
                if(place.creator.id !== req.userData.userId){
                    return next (
                        new HttpError(
                        'Vous ne pouvez pas supprimez cette place'
                        ,401)
                    ); 
                }

                const imagePath = place.image; // on va supprimer l'image de la place
                 
             try {

                 // initialisation de la session
                 const sess = await mongoose.startSession();
                 // demarrage des transactions
                 sess.startTransaction();
                  await Place.deleteOne({_id:placeId},{session:sess});
                   place.creator.places.pull(place);
                   // accès à notre place stocké dans 'user'
                   // autrement dit en faisant place.creator, j'accède implicitement au document de 
                   // la  collection 'user' donc l'id est 'creator' 
                   //car creator dans 'place' fait reférence à 'user'. 
                   // une fois dans 'user' on accède à l'attribut places. 
                   // De plus dans au lieu de mettre placeId en paramètre, c'est plutot 'place' trouvée
                   //plus haut qui est mise. implicitement, moogoose va supprimer l'id. 
                   await place.creator.save({session:sess});
                   
                   await sess.commitTransaction(); 
               
               
             }  catch (error) {
                return next (
                    new HttpError(
                    'Erreur interne au serveur, impossible de faire la suppression '
                    ,500)
                ); 
             }
          
             fs.unlink(imagePath,err=>{ // on supprime l'image de la place
                console.log(err);
             });
            res.status(200).json({message:"place supprimée avec succès"}); 

        }

        export {getPlaceById, getPlacesByUserId, createPlace, updatePlace,deletePlace};