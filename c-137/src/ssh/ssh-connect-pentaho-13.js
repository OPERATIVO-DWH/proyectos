const { Client } = require('ssh2');

function executeSSHCommand(callback) {
  const conn = new Client();
  
  conn.on('ready', () => {
    console.log('Conectado por SSH');
    
    conn.exec('ps -fea | grep java', (err, stream) => {
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
    host: '10.49.3.13',
    port: 22,
    username: 'pentaho',
    password: 'WwoPT#oeXET!BYRfXpnKLh'
    //privateKey: require('fs').readFileSync('/ruta/a/tu/clave_privada')
  });
}

module.exports = { executeSSHCommand };
