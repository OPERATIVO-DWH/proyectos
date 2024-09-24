const mysql = require('mysql2')

const conexion2 = mysql.createConnection({
    host: '10.45.49.100',
    user: 'dmart_ins',
    password: '6M4r7LN5',    
    //database: 'record'

})
conexion2.connect((error) => {
    if(error){
        console.error('error de conexion mysql:' + error)
        return
    }
    console.log('se conecto a la base de datos mysql sin error')
})

module.exports = conexion2

