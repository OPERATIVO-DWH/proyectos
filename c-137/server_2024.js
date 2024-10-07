const { exec } = require('child_process');

// Función para ejecutar un comando en la consola
function ejecutarComando(comando) {
    exec(comando, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return;
        }
        console.log(`Resultado:\n${stdout}`);
    });
}

// Comando para interactuar con Ollama (ejemplo: generar un texto)

const comandoOllama = `ollama generate "${prompt}"`;

// Ejecutar el comando
ejecutarComando(comandoOllama);
const prompt = '¿Cuál es el clima hoy?';
