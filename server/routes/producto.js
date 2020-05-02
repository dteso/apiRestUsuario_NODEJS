
const express = require ('express');

const { verificarToken } = require ('../middlewares/authentication');

let app = express();
let Producto = require('../models/producto');



//================================
// Obtener productos
//================================
app.get('/producto', (req,res)=>{
    let desde = req.query.desde || 0; //---> Query se va a indicar después de la petición con ..localhost:3000?desde =
    let limite = req.query.limite || null; //&limite=   Estos parámetros son los llamados req.params...
    desde = Number(desde);
    limite = Number(limite);

    Producto.find({ disponible: true })
        .populate('usuario','nombre email')
        .populate('categoria','descripcion')
        .skip(desde) 
        .limit(limite) 
        .exec((err,productos) =>{
            if (err) {
                return res.status(400).json({
                    ok:false,
                    err
                });
            }
            res.json({
                    ok: true,
                    productos,//usuarios: usuarios,
                    cuantos: productos.length
             })
        });

});


//================================
// Obtener un producto por id
//================================
app.get('/producto/:id', (req,res)=>{
    //populate: usuario categoria
    //paginado
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario','nombre email')
        .populate('categoria','descripcion')
        .exec((err,producto)=>{
        if (err) {
            return res.status(400).json({
                ok:false,
                err
            });
        }

        if(!producto){
            res.json({
                ok:true,
                err:{
                    msg: 'El producto solicitado no existe'
                }
            })
        }else{
            res.json({
                ok:true,
                producto
            })
        }
 
    })

});



//================================
// Buscar productos
//================================
app.get('/producto/buscar/:termino', verificarToken, (req,res)=>{

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i'); //No hay que importar nada, la 'i' es para decirle que no sea Case Sensitive

    Producto.find({ nombre: regex })
        .populate('categoria','nombre')
        .exec((err,productos)=>{
            if (err) {
                return res.status(400).json({
                    ok:false,
                    err
                });
            }

            if (productos.length === 0) {
                return res.status(400).json({
                    ok:false,
                    err: {
                        mesasage: 'No se han encontrado productos'
                    }
                });
            }
            

            res.json({
                ok:true,
                productos
            })
        })

})



//================================
// Crear un producto
//================================
app.post('/producto', verificarToken, (req,res)=>{
    let body = req.body;


    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });


    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});



//================================
// Actualizar un producto por id
//================================
app.put('/producto/:id', (req,res)=>{
    //populate: usuario categoria
    //paginado
    let id = req.params.id;
    let body = req.body;

    console.log (req.body);

    Producto.findByIdAndUpdate(id, body, {new: true, runValidators: true }, (err, productoDB)=>{ //findByIdAndUpdate es palabra reservada de mongo --> Si no se pone el new: true, en el request no veremos el objeto actualizado aunque en BD se realizará el cambio
        if (err) {
            return res.status(400).json({
                ok:false,
                err
            });
        }
        res.json({
                ok: true,
                producto: productoDB
        });
    })

});


//================================
// Borrar un producto por id
//================================
app.delete('/producto/:id', (req,res)=>{
    //populate: usuario categoria
    //paginado
    //BORRADO LÓGICO ----> disponible a false
    let id = req.params.id;

    let cambiaDisponible = {
        disponible : false
    }

    Producto.findByIdAndUpdate( id, cambiaDisponible, {new: true}, (err,productoBorrado) =>{
        if (err) {
            return res.status(400).json({
                ok:false,
                err
            });
        };

        if(productoBorrado === null){ // if(!productoBorrado){ ---> Igualmente válido
            return res.status(400).json({
                ok:false,
                err: {
                    message: 'ERROR: Producto no encontrado'
                }
            });
        };

        res.json({
            ok: true,
            usuario: productoBorrado
        });
    })

});


module.exports = app;