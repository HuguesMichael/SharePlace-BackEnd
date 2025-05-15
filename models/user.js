import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator'; 
// cet bibliothèque permet d'utiliser l'option unique devant email
// aussi, il facilitera sa recherche dans la BD

const Schema = mongoose.Schema;


const userSchema = new Schema({
    nom: {type:String, required: true},
    email: {type:String, required: true, unique:true},
    motdepasse: {type:String, required: true, minlength:8},
    image: {type:String, required: true},
    places:[{type:mongoose.Types.ObjectId, required: true, ref :'Place'}], //  c'est pour créer le lien entre user et places comme dans le MLD
    // on met dans un tableau parceque un utilisateurs peut créer plusieurs palces
});

userSchema.plugin(uniqueValidator);

export default mongoose.model('User',userSchema);