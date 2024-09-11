const { exec } = require('child_process');
const path = require('path');

// Especificar la ruta del script de Python
const pythonScriptPath = path.join('C:', 'Users', 'jhbalderrama', 'Desktop', 'python', 'extractor.py');

// Ejecutar el script de Python
exec(`python "${pythonScriptPath}"`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error al ejecutar el script de Python: ${error.message}`);
        return;
    }

    if (stderr) {
        console.error(`Error en el script de Python: ${stderr}`);
        return;
    }

    console.log(`Salida del script de Python:\n${stdout}`);
});
