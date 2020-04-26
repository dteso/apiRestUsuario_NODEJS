
require ('./config/config');

const express = require ('express');
const mongoose = require ('mongoose');
const app = express();
const bodyParser = require('body-parser');


/* M I D D L E W A R E S*/
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());



/* C O N E X I Ó N   A    B D */ 
app.use(require('./routes/usuario'));
//Establecer conexión a la base da datos
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },(err,res)=>{ //'protocolo://server_url:puerto/base_de_datos
    
    if (err) throw (err);
    
    console.log('Base de datos Online');
});

app.listen(process.env.PORT,()=>{
    console.log('Escuchando puerto: ', process.env.PORT);
});