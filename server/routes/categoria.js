const express = require ('express');

let { verificarToken, verificarAdminRol }= require ('../middlewares/authentication');

let app = express ();

let Categoria =  require ('../models/categoria');

app.get('/categoria',verificarToken, (req,res)=>{
//Devuelve todas las categorías ( sin paginación )
Categoria.find({})
    .sort('descripcion')
    .populate('usuario','nombre email')
    .exec((err,categorias)=>{
        if (err) {
            return res.status(400).json({
                ok:false,
                err
            });
        }
        res.json({
            ok:true,
            categorias
        })
    
    })
});

app.get('/categoria/:id', verificarToken, (req,res)=>{
//Muestra una categoría por ID
    //Categoria.findById(...);
    let id = req.params.id;

    Categoria.findById(id)
        .populate('usuario','nombre email')
        .exec((err,categoria)=>{
        if (err) {
            return res.status(400).json({
                ok:false,
                err
            });
        }

        if(!categoria){
            res.json({
                ok:true,
                err:{
                    msg: 'La categoría solicitada no existe'
                }
            })
        }else{
            res.json({
                ok:true,
                categoria
            })
        }
 
    })
});


app.post('/categoria', verificarToken, (req, res) => {
    // regresa la nueva categoria
    // req.usuario._id
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });


    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });


    });


});


app.put('/categoria/:id', (req,res)=>{
//Actualiza la descripción de la categoría
    let id = req.params.id;
    let body = req.body;

    Categoria.findByIdAndUpdate(id, body, {new: true, runValidators: true }, (err, categoriaDB)=>{ //findByIdAndUpdate es palabra reservada de mongo --> Si no se pone el new: true, en el request no veremos el objeto actualizado aunque en BD se realizará el cambio
        if (err) {
            return res.status(400).json({
                ok:false,
                err
            });
        }
        res.json({
                ok: true,
                categoria: categoriaDB
        });
    })
});

app.delete('/categoria/:id', [verificarToken, verificarAdminRol], function (req,res){
//Borra la categoría. Debe cumplir 2 condiciones:
// 1. Sólo un administrador puede borrar categorías
// 2. Tiene que pedir el token
//Categoria.findByIdAndRemove()

    let id = req.params.id

    Categoria.findByIdAndRemove ( id, (err,categoriaBorrada) =>{
        if (err) {
            return res.status(400).json({
                ok:false,
                err
            });
        };

        if(categoriaBorrada === null){ // if(!categoriaBorrada){ ---> Igualmente válido
            return res.status(400).json({
                ok:false,
                err: {
                    message: 'ERROR: Categoría no encontrada'
                }
            });
        };

        res.json({
            ok: true,
            usuario: categoriaBorrada
        });
    })

});


module.exports = app;