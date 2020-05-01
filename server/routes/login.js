const express = require ('express');
const Usuario = require ('../models/usuario');
const app = express();
require ('../config/config');

const bcrypt = require ('bcrypt');
const jwt = require ('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

/** 
 *  L O G I N     N O R M A L 
 */
app.post('/login', (req,res)=>{

    let body = req.body;
    
    Usuario.findOne( {email: body.email} , (err,usuarioDB) => {


        if (err) {
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if ( !usuarioDB ){
            return res.status(400).json({
                ok:false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        if( !bcrypt.compareSync (body.password, usuarioDB.password)){
            return res.status(400).json({
                ok:false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        // jwt.sign({
        //     data: 'foobar'
        //   }, 'secret', { expiresIn: 60 * 60 });

        let token = jwt.sign({
            usuario : usuarioDB //payload
        },process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); //vER FICHERO DE CONFIGURACIÓN

        res.json({
            ok: true,
            usuario: usuarioDB,
            token // token: token
        });

    });
});





/** 
 *  L O G I N     G O O G L E     A U T H 
 */

//Configuraciones de Google
async function verify( token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    console.log('++++++++ Payload completo es: ++++++++ ' )
    console.log(ticket.getPayload());
    
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    console.log(">>>  Datos de Usuario:");
    console.log(payload.name);
    console.log(payload.email);
    console.log(payload.picture);
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
  }
  //verify().catch(console.error);


app.post('/google', async (req,res)=>{
   
    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(e=> {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });
    
    Usuario.findOne( {email: googleUser.email}, (err, usuarioDB)=>{

        if (err) {
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if (usuarioDB) { //Vamos a comporobar si, aunque exista el usuario ya se autenticó por Google previamente
            if (usuarioDB.google === false ){
                return res.status(500).json({
                    ok:false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });
            }else{
                let token = jwt.sign({
                    usuario : usuarioDB //payload
                },process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); //VER FICHERO DE CONFIGURACIÓN

                return res.json({
                    ok:true,
                    usuario: usuarioDB,
                    token
                });
            }
        }else{
            //Si el usuario no existe en la base de datos lo creo
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'; //Hay que pasar el password porque va requerido ---> Si lo pasamos así nunca va a coincidir al hacderese el HASH aunque un usuario inserte una :) carita feliz

            usuario.save ( (err,usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok:false,
                        err
                    });
                }
                
                let token = jwt.sign({
                    usuario : usuarioDB //payload
                },process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); //VER FICHERO DE CONFIGURACIÓN

                return res.json({
                    ok:true,
                    usuario: usuarioDB,
                    token
                });
            })
        }


    });
});


module.exports=app;