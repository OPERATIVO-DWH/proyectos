// invoca a la base de datos mysql
const conexion = require('../database/db')
// procesure para guardar
exports.saveUser = (req,res) => {
    const email = req.body.email
    const name = req.body.name
    const rol= req.body.rol

    //tambien se puede usar asi
    //const {email, name, rol} = req.body 

    // sirve para mostrar por consola los datos ingresados en el formulario
    //console.log(email + " - " + name + " - " + rol)

    // cremos el insert
    conexion.query('INSERT INTO user SET ?', {email:email, name:name, rol:rol}, (error,results) => {
        if(error) {
            console.error(error)
        } else {
            res.redirect('/users');
        }
    });
};  

//procedimiento para update  
exports.updateUser = (req, res) => {
    const id = req.body.id
    const name = req.body.name
    const email = req.body.email
    const rol = req.body.rol

    conexion.query('UPDATE user SET ? WHERE id = ?', [{ name:name, email:email, rol:rol}, id], (error,results) => {
        if(error) {
            console.error(error)
        } else {
            res.redirect('/users');
        }
    });
};

const os = require('os');

//procedimiento para Insertar reporte
exports.saveRepor = async (req, res) => {
    try {
        const cd_reporte = req.body.cd_reporte;
        const nombre_reporte = req.body.nombre_reporte;
        const tipo_reporte = req.body.tipo_reporte;
        const frecuencia = req.body.frecuencia;
        const repositorio = req.body.repositorio;
        const responsable = req.body.responsable;
        const area = req.body.area;
        const producto = req.body.producto;
        const URL = req.body.URL;
        const usuario = req.body.usuario;

        const fecha_insert = new Date();
        const ip_insert = req.connection.remoteAddress;

        const hora_ejecucion_hora = req.body.hora_ejecucion_hora;
        const hora_ejecucion_minuto = req.body.hora_ejecucion_minuto;
        const hora_ejecucion_segundo = req.body.hora_ejecucion_segundo;

        const hora_ejecucion = `${hora_ejecucion_hora}:${hora_ejecucion_minuto}:${hora_ejecucion_segundo}`;

        conexion.query('INSERT INTO reporte SET ?', {
            cd_reporte: cd_reporte,
            nombre_reporte: nombre_reporte,
            tipo_reporte: tipo_reporte,
            frecuencia: frecuencia,
            repositorio: repositorio,
            responsable: responsable,
            area: area,
            producto: producto,
            URL: URL,
            hora_ejecucion: hora_ejecucion,
            usuario: usuario,
            fecha_insert: fecha_insert,
            ip_insert: ip_insert
        }, (error, results) => {
            if (error) {
                // Renderiza la vista del formulario con el mensaje de error y los datos del formulario
                return res.render('inventarioReportesCreate', {
                    alert: true,
                    alertMessage: '| ERROR DE REGISTRO - El Reporte ya Existe', 
                    userName: usuario                  
                });
            } else {
                res.redirect('/inventarioReportes');
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
};



//procedimiento para update  reporte
exports.updateRepor = (req, res) => {
    const id_reporte = req.body.id_reporte
    const cd_reporte = req.body.cd_reporte;
    const nombre_reporte = req.body.nombre_reporte;
    const tipo_reporte = req.body.tipo_reporte;
    const frecuencia = req.body.frecuencia;
    const repositorio = req.body.repositorio;
    const responsable = req.body.responsable;
    const area = req.body.area;
    const producto = req.body.producto;
    const URL = req.body.URL;
    const hora_ejecucion = req.body.hora_ejecucion;
    const usuario = req.body.usuario;

    // Obtener la hora del sistema, nombre del equipo e IP del cliente
    const fecha_insert = new Date();  
    // const ip_insert = req.headers['x-forwarded-for'] || req.connection.remoteAddress;  
    const ip_insert = req.connection.remoteAddress;

    conexion.query('UPDATE reporte SET ? WHERE id_reporte = ?', [{ cd_reporte:cd_reporte, nombre_reporte:nombre_reporte, tipo_reporte:tipo_reporte, frecuencia:frecuencia, repositorio:repositorio, responsable:responsable, area:area, producto:producto, URL:URL, hora_ejecucion:hora_ejecucion, usuario:usuario, fecha_insert:fecha_insert, ip_insert:ip_insert}, id_reporte], (error,results) => {
        if(error) {
            console.error(error)
        } else {
            res.redirect('/inventarioReportes');
        }
    });
};

//procedimiento para Insertar Tablas
exports.saveTablas = async (req, res) => {
    try {
        // const id_objeto = req.body.id_objeto;
        const tipo = req.body.tipo;
        const ruta = req.body.ruta;
        const id_base_datos = req.body.id_base_datos;

        const usuario = req.body.usuario;
        const fecha_insert = new Date();
        const ip_insert = req.connection.remoteAddress;


        conexion.query('INSERT INTO objeto SET ?', {
            // id_objeto: id_objeto,
            tipo: tipo,
            ruta: ruta,
            id_base_datos: id_base_datos,
            usuario: usuario,
            fecha_insert: fecha_insert,
            ip_insert: ip_insert
        }, (error, results) => {
            if (error) {
                // Renderiza la vista del formulario con el mensaje de error y los datos del formulario
                return res.render('inventarioTablasCreate', {
                    alert: true,
                    alertMessage: '| ERROR DE REGISTRO - Consulte al Administrador', 
                    userName: usuario                  
                });
            } else {
                res.redirect('/inventarioTablas');
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
};

//procedimiento para update  TABLAS
exports.updateTablas = (req, res) => {
    const id_objeto = req.body.id_objeto
    const ruta = req.body.ruta;
    const id_base_datos = req.body.id_base_datos;
    
    const usuario = req.body.usuario;

    // Obtener la hora del sistema, nombre del equipo e IP del cliente
    const fecha_insert = new Date();  
    // const ip_insert = req.headers['x-forwarded-for'] || req.connection.remoteAddress;  
    const ip_insert = req.connection.remoteAddress;

    conexion.query('UPDATE objeto SET ? WHERE id_objeto = ?', [{ id_objeto:id_objeto, ruta:ruta, id_base_datos:id_base_datos, usuario:usuario, fecha_insert:fecha_insert, ip_insert:ip_insert}, id_objeto], (error,results) => {
        if(error) {
            console.error(error)
        } else {
            res.redirect('/inventarioTablas');
        }
    });
};

//procedimiento para Insertar PROCESO
exports.saveProce = async (req, res) => {
    try {
        // const id_objeto = req.body.id_objeto;
        const tipo = req.body.tipo;
        const nombre = req.body.nombre;
        const nombre_proceso_log = req.body.nombre_proceso_log;
        const archivo_log_pentaho = req.body.archivo_log_pentaho;
        const ruta_proceso = req.body.ruta_proceso;
        const proyecto = req.body.proyecto;
        const estado = req.body.estado;
        const propietario = req.body.propietario;
        const descripcion = req.body.descripcion;
        const id_base_datos = req.body.id_base_datos;
        const hora_programada_hora = req.body.hora_programada_hora;
        const hora_programada_minuto = req.body.hora_programada_minuto;
        const hora_programada_segundo = req.body.hora_programada_segundo;

        const hora_programada = `${hora_programada_hora}:${hora_programada_minuto}:${hora_programada_segundo}`;

        const usuario = req.body.usuario;
        const fecha_insert = new Date();
        const ip_insert = req.connection.remoteAddress;


        conexion.query('INSERT INTO proceso SET ?', {            
            tipo: tipo,
            nombre: nombre,
            nombre_proceso_log: nombre_proceso_log,
            archivo_log_pentaho: archivo_log_pentaho,
            ruta_proceso: ruta_proceso,
            proyecto: proyecto,
            estado: estado,
            propietario: propietario,
            descripcion: descripcion,

            hora_programada: hora_programada,
            id_base_datos: id_base_datos,
            
            usuario: usuario,
            fecha_insert: fecha_insert,
            ip_insert: ip_insert
        }, (error, results) => {
            if (error) {
                // Renderiza la vista del formulario con el mensaje de error y los datos del formulario
                return res.render('inventarioProcesosCreate', {
                    alert: true,
                    alertMessage: '| ERROR DE REGISTRO - Consulte al Administrador', 
                    userName: usuario                  
                });
            } else {
                res.redirect('/inventarioProcesos');
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
};

//procedimiento para update  TABLAS
exports.updateProce = (req, res) => {
    const id_proceso = req.body.id_proceso
    const tipo = req.body.tipo;
    const nombre = req.body.nombre;
    const nombre_proceso_log = req.body.nombre_proceso_log;
    const archivo_log_pentaho = req.body.archivo_log_pentaho;
    const ruta_proceso = req.body.ruta_proceso;
    const proyecto = req.body.proyecto;
    const estado = req.body.estado;
    const propietario = req.body.propietario;
    const descripcion = req.body.descripcion;
    const id_base_datos = req.body.id_base_datos;
    const hora_programada = req.body.hora_programada;
    
    const usuario = req.body.usuario;

    // Obtener la hora del sistema, nombre del equipo e IP del cliente
    const fecha_insert = new Date();  
    // const ip_insert = req.headers['x-forwarded-for'] || req.connection.remoteAddress;  
    const ip_insert = req.connection.remoteAddress;

    conexion.query('UPDATE proceso SET ? WHERE id_proceso = ?', [{ id_proceso:id_proceso, tipo:tipo, nombre:nombre, nombre_proceso_log:nombre_proceso_log, archivo_log_pentaho:archivo_log_pentaho, ruta_proceso:ruta_proceso, proyecto:proyecto, estado:estado, propietario:propietario, descripcion:descripcion, hora_programada:hora_programada, id_base_datos:id_base_datos, usuario:usuario, fecha_insert:fecha_insert, ip_insert:ip_insert}, id_proceso], (error,results) => {
        if(error) {
            console.error(error)
        } else {
            res.redirect('/inventarioProcesos');
        }
    });
};

//procedimiento para Insertar dependencia tabla padre
exports.saveTablaDepenPadre = async (req, res) => {
    try {
        const id_objeto = req.body.id_objeto;
        const id_reporte = req.body.id_reporte;        

        const usuario = req.body.usuario;
        const fecha_insert = new Date();
        const ip_insert = req.connection.remoteAddress;

        conexion.query('INSERT INTO reporte_objeto SET ?', {
            id_objeto: id_objeto,
            id_reporte: id_reporte,           
            usuario: usuario,
            fecha_insert: fecha_insert,
            ip_insert: ip_insert
        }, (error, results) => {
            if (error) {
                // Renderiza la vista del formulario con el mensaje de error y los datos del formulario
                return res.render('inventarioReportesCreate', {
                    alert: true,
                    alertMessage: '| ERROR DE REGISTRO - Consulte al Administrador', 
                    userName: usuario                  
                });
            } else {
                console.log(id_reporte);
                res.redirect(`/dependenciasReporte/${id_reporte}`);
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
};