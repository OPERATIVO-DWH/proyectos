const odbc = require('odbc');

async function con() {
    try {
        const connection = await odbc.connect('Driver={NetezzaSQL};server=10.49.5.173;UserName=MON_INF;Password=%/mon=inf%$;Database=SYSTEM;LoginTimeout=120');
        console.log('Base de datos conectada Netezza SYSTEM');
        return connection;
    } catch (error) {
        console.error('Error de conexión Netezza: ' + error);
        throw error;
    }
}

module.exports = con;
