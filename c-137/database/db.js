// const mysql = require('mysql2')

// const conexion = mysql.createConnection({
//     host: '10.47.18.110',
//     user: 'operdat',
//     password: 'operacionesJ4',
//     // database: 'crud_nodejs'
//     database: 'gob_datos'    
// })


// conexion.connect((error) => {
//     if(error){
//         console.error('Error de conexión MySQL:', error.code, error.sqlMessage, error.stack);
//         return
//     }
//     console.log('se conecto a la base de datos mysql')
// });

// module.exports = conexion;

const mysql = require('mysql2');

const conexion = mysql.createConnection({
    host: '10.47.18.110',
    user: 'operdat',
    password: 'operacionesJ4',
    database: 'gob_datos'
});

conexion.connect((error) => {
    if (error) {
        console.error('Error de conexión MySQL:', error.code, error.sqlMessage, error.stack);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Función para mantener la conexión viva
const keepAlive = () => {
    conexion.ping((err) => {
        if (err) {
            console.log('Error al hacer ping a MySQL:', err);
        } else {
            console.log('Ping exitoso a MySQL');
        }
    });
};

// Ejecutar ping cada 5 minutos (300000 milisegundos)
setInterval(keepAlive, 300000);

// Exportar la conexión
module.exports = conexion;



// const mysql = require('mysql2');

// // Crear un pool de conexiones
// const pool = mysql.createPool({
//     host: '10.47.18.110',
//     user: 'operdat',
//     password: 'operacionesJ4',
//     database: 'gob_datos',
//     waitForConnections: true,
//     connectionLimit: 10,  // Número máximo de conexiones en el pool
//     queueLimit: 0         // Número máximo de solicitudes de conexión en cola (0 = ilimitado)
// });

// // Probar la conexión
// pool.getConnection((err, connection) => {
//     if (err) {
//         if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//             console.error('Conexión con la base de datos fue cerrada.');
//         }
//         if (err.code === 'ER_CON_COUNT_ERROR') {
//             console.error('Base de datos tiene demasiadas conexiones.');
//         }
//         if (err.code === 'ECONNREFUSED') {
//             console.error('Conexión a la base de datos fue rechazada.');
//         }
//     }

//     if (connection) {
//         connection.release();  // Liberar la conexión de vuelta al pool
//         console.log('Conectado a la base de datos MySQL');
//     }
// });

// // Exportar el pool para usarlo en otros archivos
// module.exports = pool;

// cambios

// const pool = require('./path/to/database.js');

// // Ejemplo de consulta
// pool.query('SELECT * FROM tabla', (err, results) => {
//     if (err) {
//         console.error(err);
//     } else {
//         console.log(results);
//     }
// });
