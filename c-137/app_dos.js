const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const app_dos = express();
const PORT = 3000;

// Conexión a la base de datos
const pool = mysql.createPool({
    host: '10.47.18.110',
    user: 'operdat',
    password: 'operacionesJ4',
    database: 'gob_datos'
});

// Servir archivos estáticos
app_dos.use(express.static(path.join(__dirname)));

// Ruta principal para servir el archivo HTML
app_dos.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index22.html'));
});
/*
// Nueva ruta para devolver los datos en formato JSON
app_dos.get('/tendencias-data', async (req, res) => {
    try {
        res.json([
            { superior: 100, media: 0 , inferior: 50, periodo: 'Enero' },
            { superior: 120, media: 90.5, inferior: 60, periodo: 'Febrero' },
            { superior: 120, media: 90.5, inferior: 60, periodo: 'marzo' },
            { superior: 120, media: 90.5, inferior: 0, periodo: 'abril' },
            { superior: 120, media: 0, inferior: 60, periodo: 'mayo' },
            { superior: 120, media: 90.5, inferior: 60, periodo: 'junio' }
        ]);
    } catch (error) {
        console.error('Error al obtener los datos de la tendencia:', error);
        res.status(500).send('Error al obtener los datos de la tendencia');
    }
});*/

app_dos.get('/tendencias-data', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT superior, media, inferior, periodo FROM tendencia');
        
        // Mapea los datos obtenidos para asegurarte de que la estructura sea la adecuada y los tipos sean correctos
        const datosTendencia = rows.map(row => ({
            superior: Number(row.superior), // Convertir a número
            media: Number(row.media),       // Convertir a número
            inferior: Number(row.inferior), // Convertir a número
            periodo: row.periodo
        }));

        console.log('Datos obtenidos de la base de datos:', datosTendencia); // Muestra los datos obtenidos

        if (datosTendencia.length === 0) {
            return res.status(404).send('No se encontraron datos.');
        }

        // Devolver los datos en formato JSON
        res.json(datosTendencia);
    } catch (error) {
        console.error('Error al obtener los datos de la tendencia:', error.message);
        res.status(500).send('Error al obtener los datos de la tendencia: ' + error.message);
    }
});



// Iniciar el servidor
app_dos.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
