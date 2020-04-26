const mongoose = require ('mongoose');
const uniqueValidator = require ('mongoose-unique-validator');

let allowedRoles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};


//1. declaración del Schema
let Schema = mongoose.Schema;


//2. inicialización del Schema
let usuarioSchema = new Schema({
    nombre:{
        type: String,
        required: [true, 'Nombre es obligatorio']
    },
    email: {
        type: String,
        unique:true,
        required: [true, 'Nombre es obligatorio']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    img:{
        type: String,
        required: false
    },
    role:{
        type: String,
        default: 'USER_ROLE',
        enum: allowedRoles
    },
    estado:{
        type:Boolean,
        default: true
    },
    google:{
        type:Boolean,
        default: false 
    }
});

//Con esto lo que conseguimos es que en la respuesta no mostremos el password
usuarioSchema.methods.toJSON = function () { //No usar funciones de flecha para poder usar el this

    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

usuarioSchema.plugin( uniqueValidator, {message: '{PATH} debe de ser único '});

//3. exportar el Schema como modelo con el nombre deseado
module.exports = mongoose.model( 'Usuario' , usuarioSchema);



