const mysql = require('mysql2/promise');

const conexion_jira = mysql.createPool({
    host: '10.47.18.110',
    user: 'operdat',
    password: 'operacionesJ4',
    database: 'jira'
});

module.exports = conexion_jira;

