const express = require('express');
const { exec } = require('child_process');

const app = express();
const port = 3000; // Puedes elegir el puerto que prefieras

// Ruta para abrir el archivo
app.get('/open-file', (req, res) => {
    // Ruta completa del archivo en la red en el servidor remoto
    const filePath = '\\\\10.40.3.208\\for_update\\VivaBox_temp_detalle.xlsm';

    // Comando SSH para abrir el archivo en el servidor remoto
    const command = `ssh user@10.40.3.208 "start \\"${filePath}\\""`

    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error('Error al intentar abrir el archivo en el servidor remoto:', err);
            return res.status(500).send('Error al abrir el archivo en el servidor remoto');
        }
        console.log('stdout:', stdout);
        console.error('stderr:', stderr);
        res.send('Archivo abierto exitosamente en el servidor remoto');
    });
});

// Inicia el servidor
app.listen(port, () => {
    console.log(`Servidor web escuchando en http://localhost:${port}`);
});
