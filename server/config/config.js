

/**==============================
 *            Puerto
 ================================*/

 process.env.PORT = process.env.PORT || 3000;



 /**==============================
 *            Entorno
 ================================*/

 process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

 /**==============================
 *       Vencimiento del token
 ================================*/
//60 segs
//60 mins
//24h
//30días
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;



  /**==============================
 *     SEED de Autenticación
 ================================*/
process.env.SEED = process.env.SEED || 'este_es_el_seed_desarrollo'

 /**==============================
 *            Base de datos
 ================================*/
 let urlDB;

 if (process.env.NODE_ENV === 'dev')
 {
     urlDB = 'mongodb://localhost:27017/cafe';
 }else{
     urlDB = process.env.MONGO_URI;
 }
process.env.URLDB = urlDB;



  /**==============================
 *     Google CLIENT_ID
 ================================*/
 process.env.CLIENT_ID = process.env.CLIENT_ID || '701057228806-ki0kj35gsl8jv1sqcu1k9j1r0jv1s7qg.apps.googleusercontent.com'