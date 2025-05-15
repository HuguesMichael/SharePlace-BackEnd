import mongoose from 'mongoose';

const Schema = mongoose.Schema;


const placeSchema = new Schema({
    title: {type:String, required: true},
    description: {type:String, required: true},
    image: {type:String, required: true},
    address: {type:String, required: true},
    creator: {type:mongoose.Types.ObjectId, required: true, ref :'User'},  //  c'est pour créer le lien entre user et places comme dans le MLD
    // on ne met pas dans un tableau parceque une place ne peut être créer que par un utilisateur
    localisation:{
        lat: {type:Number, required: true},
        lng: {type:Number, required: true}
    }
});

export default mongoose.model('Place',placeSchema);