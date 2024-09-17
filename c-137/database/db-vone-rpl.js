const mysql = require('mysql2')

const conexion2 = mysql.createConnection({
    host: '10.49.3.200',
    user: 'info',
    password: '1nf0U5R',    
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

