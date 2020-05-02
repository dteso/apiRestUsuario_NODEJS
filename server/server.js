
require ('./config/config');

const express = require ('express');
const mongoose = require ('mongoose');
const app = express();
const bodyParser = require('body-parser');
const path = require ('path');





/* M I D D L E W A R E S*/
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use(require('./routes/index')); //----> Es dónde nos hemos llevado las rutas que están debajo
//Nos las llevamos al archivo de rutas
    // app.use(require('./routes/usuario'));
    // app.use(require('./routes/login'));

//Habilitar la carpeta public
app.use (express.static(path.resolve(__dirname , '../public')));
// --> console.log(path.resolve(__dirname , '../public')); //Necesitamos usar el path


/* C O N E X I Ó N   A    B D */ 
//Establecer conexión a la base da datos
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true,  useFindAndModify: false },(err,res)=>{ //'protocolo://server_url:puerto/base_de_datos
    
    if (err) throw (err);
    
    console.log('Base de datos Online');
});

app.listen(process.env.PORT,()=>{
    console.log('Escuchando puerto: ', process.env.PORT);
});