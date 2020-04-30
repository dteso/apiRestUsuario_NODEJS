const express = require ('express');
const Usuario = require ('../models/usuario');
const app = express();


const bcrypt = require ('bcrypt');
const _ = require ('underscore');


const { verificarToken, verificarAdminRol } = require ('../middlewares/authentication');

//RUTAS

/* GET */
app.get('/usuario', verificarToken , function(req,res){ //verificarToken es un middleware

    // return res.json({
    //     usuario: req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email
    // })

    let desde = req.query.desde || 0; //---> Query se va a indicar después de la petición con ..localhost:3000?desde =
    let limite = req.query.limite || null; //&limite=   Estos parámetros son los llamados req.params...
    desde = Number(desde);
    limite = Number(limite);

    //Usuario.find({estado: true}, 'nombre email role') // -----> Dentro del find podemos especificar condiciones como {google: true}, para realizar un filtrado. Tambien podemos seleccionar que campos nos queremos traer
                                          // especificando unlistado de atributos después de la condición del find. Si nos queremos traer todos los atributos, simplemente no especificamos atributos 
    Usuario.find({ estado: true }) //Se pone {estado: true} para que traiga sólo los usuarios activos. Si se ha realizado borrado lógico
        .skip(desde) //---> Se saltaría los primeros registros desde desde
        .limit(limite) //---> Nos traería los primeros 5 usuarios
        .exec((err,usuarios) =>{
            if (err) {
                return res.status(400).json({
                    ok:false,
                    err
                });
            }
//            Usuario.count({}, (err, conteo =>{ //Dentro del count podríamos incluir alguna condicion que normalmente debe coincidir con el finde de arriba, por ejemplo {google:true} --> !!!NO FUNCIONA!!!
                res.json({
                    ok: true,
                    usuarios,//usuarios: usuarios,
                    cuantos: usuarios.length
                })
 //           }))
        });
    //res.json("GET Usuario  Request OK :)");
});




/* POST */
app.post('/usuario', [verificarToken, verificarAdminRol], function(req,res){
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), //Primer parámetro es el parámetro a encrptar y el segundo es configurable y es el nº de vueltas que se le quiere aplicar al hash
        role: body.role
    });

    usuario.save( (err,usuarioDB) => { //save es palabra reservada de mongo
        if (err) {
            return res.status(400).json({
                ok:false,
                err
            });
        }
        //Si no hay error NO hace el return y sigue
        //usuarioDB.password = null; //Para que no se muestre el pasword encriptado
        //Lo estamos haciendo en el model a travésde un usuarioSchema.toJSON para que no se muestre el campo password en la respuesta

        res.json({
            ok: true,
            usuario: usuarioDB
        })
    });
});



/* PUT */
app.put('/usuario/:id', [verificarToken, verificarAdminRol], function(req,res){ //PUT: localhost:3000/usuario/5ea53d748b175b42fcb3d3c8
    let id = req.params.id;
    //let body = req.body;
    let body = _.pick ( req.body, ['nombre', 'email','img', 'role', 'estado'] ); //Estamos utilizando la librería underscore y su función para definir que propiedades del objeto van a ser actualziables 

    //delete body.password; //para no actualizar el password
    //delete body.google; //para que no se actualice google

    Usuario.findByIdAndUpdate ( id, body, {new: true, runValidators: true }, (err, usuarioDB)=>{ //findByIdAndUpdate es palabra reservada de mongo --> Si no se pone el new: true, en el request no veremos el objeto actualizado aunque en BD se realizará el cambio
        if (err) {
            return res.status(400).json({
                ok:false,
                err
            });
        }
        res.json({
                ok: true,
                usuario: usuarioDB
        });
    })
});



// /* DELETE ----> Este sería el borrado físico usando una petición DELETE  */
// app.delete('/usuario/:id', function(req,res){ //DELETE: localhost:3000/usuario/5ea558ce8fc9cd331ca5a27a
//     //res.json("DELETE Usuario  Request OK :)");
//     let id = req.params.id;

//     Usuario.findByIdAndRemove ( id, (err,usuarioBorrado) =>{
//         if (err) {
//             return res.status(400).json({
//                 ok:false,
//                 err
//             });
//         };

//         if(usuarioBorrado === null){ // if(!usuarioBorrado){ ---> Igualmente válido
//             return res.status(400).json({
//                 ok:false,
//                 err: {
//                     message: 'ERROR: Usuario no encontrado'
//                 }
//             });
//         };

//         res.json({
//             ok: true,
//             usuario: usuarioBorrado
//         });
//     })
// });



/* DELETE ----> Este sería el borrado lógico usando una petición PUT  */
app.delete('/usuario/:id',[verificarToken, verificarAdminRol], function(req,res){ //DELETE: localhost:3000/usuario/5ea558ce8fc9cd331ca5a27a
    //res.json("DELETE Usuario  Request OK :)");
    let id = req.params.id;

    let cambiaEstado = {
        estado : false
    }

    Usuario.findByIdAndUpdate( id, cambiaEstado, {new: true}, (err,usuarioBorrado) =>{
        if (err) {
            return res.status(400).json({
                ok:false,
                err
            });
        };

        if(usuarioBorrado === null){ // if(!usuarioBorrado){ ---> Igualmente válido
            return res.status(400).json({
                ok:false,
                err: {
                    message: 'ERROR: Usuario no encontrado'
                }
            });
        };

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    })
});


module.exports=app;