const { Client } = require('ssh2');

function executeSSHCommand3(callback, id_proceso) {
  const conn = new Client();
  const id2 = id_proceso;
  const command = `kill -9 ${id_proceso}`;
  
  console.log(id2); 

  conn.on('ready', () => {
    console.log('Conectado por SSH para KILL');  
    conn.exec(command, (err, stream) => {
      if (err) return callback(err);
      
      let output = '';
      stream.on('data', (data) => {
        output += data;
      }).on('close', (code, signal) => {
        console.log(`Comando finalizado con código: ${code}`);
        conn.end();  // Cierra la conexión
        callback(null, output);  // Devuelve el resultado a través del callback
      }).stderr.on('data', (data) => {
        callback(data.toString());
      });
    });
  }).connect({
    host: '10.40.3.59',
    port: 22,
    username: 'dpi',
    password: 'Nuevatel2025'
    //privateKey: require('fs').readFileSync('/ruta/a/tu/clave_privada')
  });
}
  
module.exports = { executeSSHCommand3 };
