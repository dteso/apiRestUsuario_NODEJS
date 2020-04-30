const express = require ('express');
const Usuario = require ('../models/usuario');
const app = express();

const bcrypt = require ('bcrypt');
const jwt = require ('jsonwebtoken');

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


})


module.exports=app;