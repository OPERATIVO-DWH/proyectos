const oracledb = require('oracledb');

// Inicializar Oracle Client (modo Thick) 
try { oracledb.initOracleClient({ libDir: 'C:\oracle' }); // Ruta donde instalaste Oracle Instant Client en tu máquina 
  console.log("Oracle Client inicializado correctamente"); 
} 
catch (err) { 
  console.error("No se pudo inicializar Oracle Client: ", err); process.exit(1); 
}

// Configuración de conexión a Oracle 
const dbConfig = { 
  user: 'TRAFICO', 
  password: 'trafico',
  connectString: '10.49.3.137:1521/fludb' // O usa la cadena completa si es necesario (ver los ejemplos anteriores) 
  };

// Función para obtener la conexión 
async function getConnection() { 
  let connection; 
  try { 
    connection = await oracledb.getConnection(dbConfig); console.log('Conexión exitosa a la base de datos Oracle'); 
    return connection; 
  } catch (err) { 
    console.error('Error al conectarse a la base de datos', err); throw err; 
  }
  }

// Exportar la función de conexión 
//module.exports = { getConnection };












// Configuración de conexión a Oracle
/*const dbConfig = {
  user: 'TRAFICO',
  password: 'trafico',
  //connectString: 'FLUDB'
  //connectString: '10.49.3.137:1521/fludb'
  //connectString: '10.49.3.137:1521/fludb' // Por ejemplo: 'localhost:1521/ORCL'
  connectString: '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=10.49.3.137)(PORT=1521))(CONNECT_DATA=(SERVER=dedicated)(SERVICE_NAME=fludb)))'
};

// Función para obtener la conexión
async function getConnection() {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    console.log('Conexión exitosa a la base de datos Oracle');
    return connection;
  } catch (err) {
    console.error('Error al conectarse a la base de datos', err);
    throw err;
  }
}*/



// Exportar la función de conexión
module.exports = {
  getConnection
};