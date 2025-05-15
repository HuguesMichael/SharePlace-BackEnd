class HttpError extends Error{
 
     constructor(message, errorCode){
      super(message); // cela permet deja d'ajouter la propriété "message" à une instance de classe.
      this.code=errorCode;  //cela permet deja d'ajouter la propriété "code" à une instance de classe.
     }
}
export default HttpError;