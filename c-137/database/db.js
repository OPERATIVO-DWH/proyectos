const mysql = require('mysql2')

const conexion = mysql.createConnection({
    host: '10.47.18.110',
    user: 'operdat',
    password: 'operacionesJ4',
    // database: 'crud_nodejs'
    database: 'gob_datos',
    connectTimeout: 30000  // Tiempo de espera en milisegundos (30 segundos)
})


conexion.connect((error) => {
    if(error){
        console.error('Error de conexión MySQL:', error.code, error.sqlMessage, error.stack);
        return
    }
    console.log('se conecto a la base de datos mysql')
});

module.exports = conexion;


