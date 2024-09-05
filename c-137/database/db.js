const mysql = require('mysql2')

const conexion = mysql.createConnection({
    host: '10.47.18.110',
    user: 'operdat',
    password: 'operacionesJ4',
    // database: 'crud_nodejs'
    database: 'gob_datos'

})


conexion.connect((error) => {
    if(error){
        console.error('error de conexion mysql:' + error)
        return
    }
    console.log('se conecto a la base de datos mysql')
});

module.exports = conexion;


