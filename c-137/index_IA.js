const express = require('express');
const path = require('path');
const odbc = require('odbc');

const app_dos = express();
const PORT = 3000;

// Servir archivos estáticos desde la raíz
app_dos.use(express.static(__dirname));

// Conexión a la base de datos Netezza
async function connectToNetezza() {
  try {
    const connectionString = 'Driver={NetezzaSQL};Server=10.49.5.173;UID=U_ETL_PR_DPI;PWD=$etl/pr(dpi$;Port=5480;Database=PR_DPI';
    const pool = await odbc.pool(connectionString);
    return pool;
  } catch (error) {
    console.error('Error al conectar a Netezza:', error);
    throw error;
  }
}

// Ruta para obtener los datos
app_dos.get('/tendencias-data', async (req, res) => {
  let pool;
  try {
    pool = await connectToNetezza();

    // Obtener fechas y número de teléfono de los parámetros de la URL
    const { fechaInicio, fechaFin, nroTelefono } = req.query;

    if (!fechaInicio || !fechaFin || !nroTelefono) {
      return res.status(400).send('Faltan parámetros. Debes proporcionar fechaInicio, fechaFin, y nroTelefono.');
    }

    // Query actualizado para utilizar fechas y número de teléfono de la consulta
    const query = `
      SELECT a.FECHA, a.HORA, a.NRO_TELEFONO, SUM(a.DOWN+a.UP)/1000/1000 AS MB, d.SERVICEID AS APP 
      FROM PR_DPI.MODELO.AGG_NRO_DIA_DPI A 
      JOIN PR_DPI.MODELO.DIM_APP_DPI D ON A.IDW_APP_DPI = D.IDW_APP_DPI
      WHERE A.FECHA >= TO_DATE('${fechaInicio}', 'YYYY-MM-DD')
      AND A.FECHA <= TO_DATE('${fechaFin}', 'YYYY-MM-DD')
      AND A.NRO_TELEFONO = '${nroTelefono}'
      GROUP BY a.FECHA, a.HORA, a.NRO_TELEFONO, d.SERVICEID
      ORDER BY a.NRO_TELEFONO, a.FECHA, a.HORA;
    `;
    const result = await pool.query(query);

    // Agrupar los resultados por APP
    const groupedByApp = {};
    result.forEach(row => {
      const app = row.APP;
      if (!groupedByApp[app]) {
        groupedByApp[app] = [];
      }
      groupedByApp[app].push({
        fecha: row.FECHA,
        hora: row.HORA,
        mb: parseFloat(row.MB)
      });
    });

    console.log('Datos de tráfico por aplicación:', groupedByApp);

    // Retornar los datos como JSON
    res.json(groupedByApp);
  } catch (error) {
    console.error('Error al obtener los datos de la tendencia:', error);
    res.status(500).send('Error al obtener los datos de la tendencia');
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// Ruta para servir el archivo HTML
app_dos.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index_IA2024.html'));
});

// Iniciar el servidor
app_dos.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
