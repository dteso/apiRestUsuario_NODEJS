const jwt = require ('jsonwebtoken');


//=============================
// Verificar token
//=============================

let verificarToken = (req,res,next) => { //next va a continuar con la ejecución del programa. 
    let token = req.get('token'); //Con get obtengo los headers y en este caos especifico el heade que tengo que mandar con la peticion

    // res.json({
    //     token: token
    // })

    jwt.verify(token, process.env.SEED, (err,decoded) => { //decoded en reaidad es el payload
        if(err) {
            return res.status(401).json({
                ok: false,
                err: err
            });
        }
        req.usuario = decoded.usuario; //como decoded es el payload, en realidad puedo obtener el usuario porque se encuentra encriptado dentro de él
    });

    next(); //Si no pongo el next no se va a continuar con la ejecución del programa tras el middlewarte
};


//=============================
// Verificar rol
//=============================

let verificarAdminRol = (req,res,next) => { //next va a continuar con la ejecución del programa. 
    let usuario = req.usuario;

    if ( usuario.role === 'ADMIN_ROLE'){
        next();  
    }else{
        return res.status(401).json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }
};


module.exports = {
    verificarToken,
    verificarAdminRol
}