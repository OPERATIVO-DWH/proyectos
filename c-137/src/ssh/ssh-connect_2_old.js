const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Conectado por SSH');
  
  // Ejecutar un comando en el servidor remoto
  conn.exec('df -m', (err, stream) => {
    if (err) throw err;
    
    stream.on('close', (code, signal) => {
      console.log(`Comando finalizado con código: ${code}, señal: ${signal}`);
      conn.end();  // Cierra la conexión
    }).on('data', (data) => {
      console.log(`Salida del comando: ${data}`);
    }).stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
    });
  });
}).connect({
  host: '10.40.3.59',
  port: 22,  // Puerto SSH, usualmente 22
  username: 'dpi',
  password: 'Nuevatel2025'
  //privateKey: require('fs').readFileSync('/ruta/a/tu/clave_privada')  // Clave privada para autenticación
});

conn.on('error', (err) => {
    console.error('Error en la conexión:', err);
});
  