// ce code permettra de convertir une adress en coordonnées
// pour ce faire, il faut un un clé de l'API Geocoding de google.
// 
import axios from 'axios';
import HttpError from '../models/http-error.js';
const API_KEY = process.env.GOOGLE_API_KEY;


 const getCoordForAdress = async (address)=>{
   // return{
        //lat:,
        //lng:
  //  }

 const response = await axios.get(
           `https://maps.googleapis.com/maps/api/geocode/json?address=
            ${encodeURIComponent(address)}
            &key=${API_KEY}`)
       // https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY
       // cet URL est celle provenant de geocoding dans lequel on précise l'adresse et biensur il faut ta clé API
       // nous avons remplacer la section entre = et & par notre addresse en utilisant le methode encodeURIComponent(address)
       // cette méthode transforme notre addresse sous la forme se trouvant entre = et &

const data = response.data;
if(!data || data.status==='ZERO_RESULTS'){
   
    throw new HttpError(
        'Impossible de trouver la localisation pour cette adresse', 
        422
    )
  
}
const coordonnees = data.results[0].geometry.location 
// le resultat produit par le get plus haut est un tableau d'ou [0]
// Cf  https://developers.google.com/maps/documentation/geocoding/requests-geocoding?hl=fr
// avoir un exemple de réponse

return coordonnees;
 }

 export default getCoordForAdress;
