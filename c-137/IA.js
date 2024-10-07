const axios = require('axios');

// Clase IA que se conecta a Ollama local
class IA {
    constructor(model = 'llama3.2') {
        this.model = model;
        this.OLLAMA_LOCAL_URL = 'http://localhost:11434';
    }

    // Método para hacer consultas al modelo de Ollama local
    async consultar(query) {
        try {
            const response = await axios.post(this.OLLAMA_LOCAL_URL, {
                model: this.model,
                prompt: query
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Procesar la respuesta
            const data = response.data;
            console.log('Respuesta de Ollama local:', data);
            return data;
        } catch (error) {
            const errorMessage = error.response && error.response.data
                ? error.response.data.error
                : error.message;
            console.error('Error al consultar Ollama local:', errorMessage);
            throw new Error('Error al consultar Ollama local: ' + errorMessage);
        }
    }
}

// Ejemplo de uso
(async () => {
    try {
        const ia = new IA('llama3.2');
        const query = 'Describe the advantages of AI.';
        const respuesta = await ia.consultar(query);
        console.log('Respuesta procesada:', respuesta);
    } catch (error) {
        console.error('Error en la consulta:', error.message);
    }
})();
