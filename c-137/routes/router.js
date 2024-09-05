const express = require('express')
const router = express.Router()
// invoca a la base de datos mysql
const conexion = require('../database/db')
const cxNetezza = require('../database/netezza_db');

//invoca el metodo CRUD de usuarios
const userControllers = require('../controllers/userControllers')
const authControllers = require('../controllers/authControllers')

const { Router } = require('express')
const { json } = require('express')

//es la raiz
router.get('/users', authControllers.isAuthenticate,(req, res)=> {
    
    //res.send('io')

    // comando basico para validar la conexcion 

    // conexion.query('select * from user', (error, results) => {
    //     if(error){
    //         throw error;
    //     } else {
    //         res.send(results);
    //     }
    // })

    conexion.query('select * from user', (error, results) => {
        if(error){
        throw error;
        } else {
            if(req.user.rol=="Admin") {
                //res.send(results);
                res.render('users', {results : results})
            } else {
                res.render('index', { userName: req.user.email, titleweb: "Inicio" });
            }              
        }
    })    
});

// para direccionar a create.ejs
router.get('/createUser', authControllers.isAuthenticate,(req, res) => {
    if(req.user.rol=="Admin") {
        res.render('createUser')
    } else {
        res.render('index', { userName: req.user.email, titleweb: "Inicio" });
    }       
});

// para direccionar a edit.ejs
router.get('/editUser/:id', authControllers.isAuthenticate,(req, res) => {
    const id = req.params.id;
    conexion.query('SELECT * FROM user WHERE id = ?', [id], (error, results) => {
        if(error){
        throw error;
        } else {    
            if(req.user.rol=="Admin") {
                res.render('editUser', {user : results [0]})
            } else {
                res.render('index', { userName: req.user.email, titleweb: "Inicio" });
            }            
        }
    })
});    



router.post('/saveUser', userControllers.saveUser);  
router.post('/updateUser', userControllers.updateUser); 

//para el delete
router.get('/deleteUser/:id', (req, res) => {
    const id = req.params.id
    conexion.query('DELETE FROM user WHERE id= ?', [id], (error, results) => {
        if(error){
            throw error;
            } else {            
                res.redirect('/users')
            }
    })
});

// // router for views
// router.get('/', authControllers.isAuthenticate, (req, res) => {
//     res.render('index', {userName: row.name, titleweb: "Control"})
// }); 

// router for views
router.get('/', authControllers.isAuthenticate, (req, res) => {
    // Asegúrate de que `req.user` existe antes de intentar acceder a sus propiedades
    if (req.user) {
        res.render('index', { userName: req.user.email, titleweb: "Inicio" });
    } else {
        // Si por alguna razón no existe el usuario, redirigir a la página de login o manejar el error
        res.redirect('/login');
    }
});


router.get('/logout', authControllers.logout);

// direcciona a login
router.get('/login', (req, res) => {
    res.render('login', { alert:false })
});

// direcciona a register
router.get('/register', (req, res) => {
    res.render('register', { alert:false })
});

router.post('/register', authControllers.register);
router.post('/login', authControllers.login);


// direcciona inventarioReportes

router.get('/inventarioReportes', authControllers.isAuthenticate, (req, res) => {
    if(req.user.rol === "Suscriptor" || req.user.rol === "Admin") {
        // Supongamos que quieres obtener la lista de usuarios para el reporte de inventario
        const query = `
            SELECT 
                r.id_reporte,
                r.estado_reporte,
                r.nombre_reporte,
                r.tipo_reporte,
                r.frecuencia,
                r.repositorio,
                r.URL 
            FROM 
                reporte r
            WHERE
                r.estado_reporte='A'
            ORDER BY 
                r.id_reporte DESC    
        `;
        
        conexion.query(query, (error, results) => {
            if (error) {
                throw error;
            } else {
                // Aquí pasas 'results' a la vista
                res.render('inventarioReportes', { results: results });
            }
        });
    } else {
        res.render('index', { userName: req.user.email, titleweb: "Inicio" });
    }
});


// para direccionar a inventarioReportesCreate.ejs
router.get('/inventarioReportesCreate', authControllers.isAuthenticate,(req, res) => {
    if(req.user.rol=="Admin" || req.user.rol === "Suscriptor") {
        res.render('inventarioReportesCreate', { userName: req.user.email, alert: false })        
    } else {
        res.render('index', { userName: req.user.email, titleweb: "Inicio" });
    }       
});


// para direccionar a edit.ejs
router.get('/inventarioReportesEdit/:id', authControllers.isAuthenticate,(req, res) => {
    const id = req.params.id;
    conexion.query('SELECT * FROM reporte WHERE id_reporte = ?', [id], (error, results) => {
        if(error){
        throw error;
        } else {    
            if(req.user.rol=="Admin" || req.user.rol === "Suscriptor") {
                res.render('inventarioReportesEdit', {user : results [0], userName: req.user.email})
            } else {
                res.render('index', { userName: req.user.email, titleweb: "Inicio" });
            }            
        }
    })
});  



router.post('/saveRepor', userControllers.saveRepor); 
router.post('/updateRepor', userControllers.updateRepor); 

// Para el delete reporte
router.get('/deleteRepo/:id', authControllers.isAuthenticate, (req, res) => {
    const id = req.params.id;

    // Verificar si el usuario tiene el rol de Admin
    if (req.user.rol === "Admin") {
        conexion.query('DELETE FROM reporte WHERE id_reporte = ?', [id], (error, results) => {
            if (error) {
                throw error;
            } else {
                // Redirigir a la vista de inventarioReportes después de la eliminación
                res.redirect('/inventarioReportes');
            }
        });
    } else {
        // Redirigir a la vista de inventarioReportes con un mensaje de error o de no autorizado si no es admin
        res.redirect('/inventarioReportes?error=NO_TIENE_PERMISO');
    }
});

// direcciona inventarioTablas

router.get('/inventarioTablas', authControllers.isAuthenticate, (req, res) => {
    if(req.user.rol === "Suscriptor" || req.user.rol === "Admin") {
        // Supongamos que quieres obtener la lista de usuarios para el reporte de inventario
        const query = `
            SELECT 
            o.id_objeto, 
            o.nombre_objeto,
            o.tipo,
            o.ruta,
            b.base_datos,
            s.nombre_servidor,
            s.ip_url,
            s.tecnologia 
            FROM objeto o 
            LEFT JOIN base_datos b ON o.id_base_datos=b.id_base_datos 
            LEFT JOIN servidor s ON s.id_servidor=b.id_servidor 
            ORDER BY o.id_objeto DESC
        `;
        
        conexion.query(query, (error, results) => {
            if (error) {
                throw error;
            } else {
                // Aquí pasas 'results' a la vista
                res.render('inventarioTablas', { results: results });
            }
        });
    } else {
        res.render('index', { userName: req.user.email, titleweb: "Inicio" });
    }
});

// para direccionar a inventarioTablasCreate.ejs
router.get('/inventarioTablasCreate', authControllers.isAuthenticate,(req, res) => {
    if(req.user.rol=="Admin" || req.user.rol === "Suscriptor") {
        res.render('inventarioTablasCreate', { userName: req.user.email, alert: false })        
    } else {
        res.render('index', { userName: req.user.email, titleweb: "Inicio" });
    }       
});

// para direccionar a edit.ejs
router.get('/inventarioTablasEdit/:id', authControllers.isAuthenticate,(req, res) => {
    const id = req.params.id;
    conexion.query('SELECT * FROM objeto WHERE id_objeto = ?', [id], (error, results) => {
        if(error){
        throw error;
        } else {    
            if(req.user.rol=="Admin" || req.user.rol === "Suscriptor") {
                res.render('inventarioTablasEdit', {user : results [0], userName: req.user.email})
            } else {
                res.render('index', { userName: req.user.email, titleweb: "Inicio" });
            }            
        }
    })
});  

router.post('/saveTablas', userControllers.saveTablas); 
router.post('/updateTablas', userControllers.updateTablas); 

// Para el delete TABLAS
router.get('/deleteTablas/:id', authControllers.isAuthenticate, (req, res) => {
    const id = req.params.id;

    // Verificar si el usuario tiene el rol de Admin
    if (req.user.rol === "Admin") {
        conexion.query('DELETE FROM objeto WHERE id_objeto = ?', [id], (error, results) => {
            if (error) {
                throw error;
            } else {
                // Redirigir a la vista de inventarioReportes después de la eliminación
                res.redirect('/inventarioTablas');
            }
        });
    } else {
        // Redirigir a la vista de inventarioReportes con un mensaje de error o de no autorizado si no es admin
        res.redirect('/inventarioTablas?error=NO_TIENE_PERMISO');
    }
});

// direcciona inventario PROCESOS

router.get('/inventarioProcesos', authControllers.isAuthenticate, (req, res) => {
    if(req.user.rol === "Suscriptor" || req.user.rol === "Admin") {
        // Supongamos que quieres obtener la lista de usuarios para el reporte de inventario
        const query = `
            SELECT 
            p.id_proceso,
            p.id_base_datos,
            p.nombre,
            p.ruta_proceso,
            p.tipo,
            p.estado,
            p.propietario,
            s.nombre_servidor,
            s.tecnologia
            FROM proceso p 
            LEFT JOIN base_datos b ON p.id_base_datos=b.id_base_datos 
            LEFT JOIN servidor s ON s.id_servidor=b.id_servidor
            ORDER BY p.id_proceso DESC
        `;
        
        conexion.query(query, (error, results) => {
            if (error) {
                throw error;
            } else {
                // Aquí pasas 'results' a la vista
                res.render('inventarioProcesos', { results: results });
            }
        });
    } else {
        res.render('index', { userName: req.user.email, titleweb: "Inicio" });
    }
});

// para direccionar a inventarioProcesosCreate.ejs
router.get('/inventarioProcesosCreate', authControllers.isAuthenticate,(req, res) => {
    if(req.user.rol=="Admin" || req.user.rol === "Suscriptor") {
        res.render('inventarioProcesosCreate', { userName: req.user.email, alert: false })        
    } else {
        res.render('index', { userName: req.user.email, titleweb: "Inicio" });
    }       
});

// para direccionar a inventarioProcesosEdit.ejs
router.get('/inventarioProcesosEdit/:id', authControllers.isAuthenticate,(req, res) => {
    const id = req.params.id;
    conexion.query('SELECT * FROM proceso WHERE id_proceso = ?', [id], (error, results) => {
        if(error){
        throw error;
        } else {    
            if(req.user.rol=="Admin" || req.user.rol === "Suscriptor") {
                res.render('inventarioProcesosEdit', {user : results [0], userName: req.user.email})
            } else {
                res.render('index', { userName: req.user.email, titleweb: "Inicio" });
            }            
        }
    })
}); 

router.post('/saveProce', userControllers.saveProce); 
router.post('/updateProce', userControllers.updateProce);  


// Para el delete PROCESO
router.get('/deleteProceso/:id', authControllers.isAuthenticate, (req, res) => {
    const id = req.params.id;

    // Verificar si el usuario tiene el rol de Admin
    if (req.user.rol === "Admin") {
        conexion.query('DELETE FROM proceso WHERE id_proceso = ?', [id], (error, results) => {
            if (error) {
                throw error;
            } else {
                // Redirigir a la vista de inventarioReportes después de la eliminación
                res.redirect('/inventarioProcesos');
            }
        });
    } else {
        // Redirigir a la vista de inventarioReportes con un mensaje de error o de no autorizado si no es admin
        res.redirect('/inventarioProcesos?error=NO_TIENE_PERMISO');
    }
});


// para direccionar a dependencias.ejs
// router.get('/dependenciasReporte/:id', authControllers.isAuthenticate,(req, res) => {
//     const id = req.params.id;
//     conexion.query('SELECT * FROM reporte WHERE id_reporte = ?', [id], (error, results) => {
//         if(error){
//         throw error;
//         } else {    
//             if(req.user.rol=="Admin" || req.user.rol === "Suscriptor") {
//                 res.render('dependenciasReporte', {user : results [0], userName: req.user.email})
//             } else {
//                 res.render('index', { userName: req.user.email, titleweb: "Inicio" });
//             }            
//         }
//     })
// }); 

// Función de utilidad para realizar consultas a la base de datos
function queryDatabase(query, params) {
    return new Promise((resolve, reject) => {
        conexion.query(query, params, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}

// Ruta para direccionar a dependenciasReporte.ejs
router.get('/dependenciasReporte/:id', authControllers.isAuthenticate, async (req, res) => {
    try {
        const id = req.params.id;

        // Validar el ID antes de usarlo
        if (!id || isNaN(id)) {
            return res.status(400).send('ID inválido');
        }

        //  Consulta para obtener los detalles del reporte
        const reporte = await queryDatabase('SELECT * FROM reporte WHERE id_reporte = ?', [id]);

        if (reporte.length === 0) {
            return res.status(404).send('Reporte no encontrado');
        }

        //  Consulta para obtener dependencias padre con el reporte
        const objetos = await queryDatabase(`
            WITH RECURSIVE padres AS (
                -- Dependencias ascendentes (padres)
                SELECT 
                    id,
                    padre_id, 
                    padre_tipo AS padre_tipo,
                    CONCAT(padre_id, '_', padre_tipo) AS id_tipo,
                    'DEPENDENCIA PADRE' AS direccion -- Marca la dirección como ascendente
                FROM 
                    relacion 
                WHERE 
                    hijo_id = ? AND hijo_tipo = 'reporte'  -- ID y tipo de la entidad inicial

                UNION ALL

                SELECT 
                    r.id,
                    r.padre_id, 
                    r.padre_tipo AS padre_tipo,
                    CONCAT(r.padre_id, '_', r.padre_tipo) AS id_tipo,
                    'DEPENDENCIA PADRE' AS direccion
                FROM 
                    relacion r
                INNER JOIN 
                    padres ph ON r.hijo_id = ph.padre_id AND r.hijo_tipo = ph.padre_tipo
            )
            -- Unión de ambos CTEs y obtención de los resultados únicos
            SELECT DISTINCT 
                p.id, 
                p.padre_tipo,
                p.padre_id, 
                o.label,
                p.id_tipo,
                p.direccion
            FROM 
                padres p
            LEFT JOIN monitor_g_flujo o ON o.id_tipo = CONCAT(p.padre_id, '_', p.padre_tipo);
        `, [id]);

        //  Consulta para obtener más información
        const lista = await queryDatabase(`
            SELECT 
                o.id_objeto, 
                o.ruta 
            FROM 
                objeto o 
            WHERE 
                o.id_objeto NOT IN (
                    WITH RECURSIVE padres AS (
                        SELECT 
                            id,
                            padre_id, 
                            padre_tipo AS padre_tipo,
                            CONCAT(padre_id, '_', padre_tipo) AS id_tipo,
                            'DEPENDENCIA PADRE' AS direccion
                        FROM 
                            relacion 
                        WHERE 
                            hijo_id = ? AND hijo_tipo = 'reporte'

                        UNION ALL

                        SELECT 
                            r.id,
                            r.padre_id, 
                            r.padre_tipo AS padre_tipo,
                            CONCAT(r.padre_id, '_', r.padre_tipo) AS id_tipo,
                            'DEPENDENCIA PADRE' AS direccion
                        FROM 
                            relacion r
                        INNER JOIN 
                            padres ph ON r.hijo_id = ph.padre_id AND r.hijo_tipo = ph.padre_tipo
                    )
                    SELECT DISTINCT 
                        p.padre_id
                    FROM 
                        padres p
                ) 
            ORDER BY 
                o.id_objeto DESC
        `, [id]);     
        
         //  Consulta para id
         const flujo = await queryDatabase(`
            WITH RECURSIVE padres AS (
            -- Dependencias ascendentes (padres)
            SELECT 
                padre_id AS ID, 
                padre_tipo AS TIPO,
                CONCAT(padre_id, '_', padre_tipo) AS ID_TIPO,
                'DEPENDENCIA PADRE' AS direccion, -- Marca la dirección como ascendente
                1 AS nivel -- Nivel inicial para padres
            FROM 
                relacion 
            WHERE 
                hijo_id = ? AND hijo_tipo = 'reporte'  -- ID y tipo de la entidad inicial
        
            UNION ALL
        
            SELECT 
                r.padre_id AS ID, 
                r.padre_tipo AS TIPO,
                CONCAT(r.padre_id, '_', r.padre_tipo) AS ID_TIPO,
                'DEPENDENCIA PADRE' AS direccion,
                ph.nivel + 1 AS nivel -- Incrementa el nivel en 1 para cada iteración ascendente
            FROM 
                relacion r
            INNER JOIN 
                padres ph ON r.hijo_id = ph.ID AND r.hijo_tipo = ph.TIPO
        ),
        hijos AS (
            -- Dependencias descendentes (hijos)
            SELECT 
                hijo_id AS ID, 
                hijo_tipo AS TIPO,
                CONCAT(hijo_id, '_', hijo_tipo) AS ID_TIPO,
                'DEPENDENCIA HIJO' AS direccion, -- Marca la dirección como descendente
                1 AS nivel -- Nivel inicial para hijos
            FROM 
                relacion 
            WHERE 
                padre_id = ? AND padre_tipo = 'reporte'  -- ID y tipo de la entidad inicial
        
            UNION ALL
        
            SELECT 
                r.hijo_id AS ID, 
                r.hijo_tipo AS TIPO,
                CONCAT(r.hijo_id, '_', r.hijo_tipo) AS ID_TIPO,
                'DEPENDENCIA HIJO' AS direccion,
                ch.nivel + 1 AS nivel -- Incrementa el nivel en 1 para cada iteración descendente
            FROM 
                relacion r
            INNER JOIN 
                hijos ch ON r.padre_id = ch.ID AND r.padre_tipo = ch.TIPO
        )
        
        SELECT 
            base.ID, 
            base.TIPO, 
            CONCAT(base.ID, '_', base.TIPO) AS ID_TIPO,
            base.direccion,
            base.nivel,
            f.label,    
            case when base.nivel= 0 then 'gray' else f.color
            END color,
            case when base.nivel= 0 then 'hexagon' else f.shape
            END shape
        FROM
        ( 
        -- Unión de ambos CTEs
        SELECT DISTINCT 
            ID, 
            TIPO, 
            direccion,
            nivel
        FROM 
            padres
        
        UNION
        SELECT
            ? ID,
            'reporte' TIPO, -- ID y tipo de la entidad inicial
            'INICIO' direccion,
            0 AS nivel -- El nivel 0 indica el inicio (la entidad inicial)
        UNION
        SELECT DISTINCT 
            ID, 
            TIPO, 
            direccion,
            nivel
        FROM 
            hijos
        ) base
        LEFT JOIN monitor_g_flujo f ON f.id_tipo=CONCAT(base.ID, '_',base.TIPO)
        `, [id,id,id]);  

        //  Consulta para la relacion 
        const relacion = await queryDatabase(`
            WITH RECURSIVE padres AS (
            -- Dependencias ascendentes (padres)
            SELECT 
                padre_id AS ID, 
                padre_tipo AS TIPO,
                CONCAT(padre_id, '_', padre_tipo) AS ID_TIPO,
                'DEPENDENCIA PADRE' AS direccion, -- Marca la dirección como ascendente
                1 AS nivel -- Nivel inicial para padres
            FROM 
                relacion 
            WHERE 
                hijo_id = ? AND hijo_tipo = 'reporte'  -- ID y tipo de la entidad inicial
        
            UNION ALL
        
            SELECT 
                r.padre_id AS ID, 
                r.padre_tipo AS TIPO,
                CONCAT(r.padre_id, '_', r.padre_tipo) AS ID_TIPO,
                'DEPENDENCIA PADRE' AS direccion,
                ph.nivel + 1 AS nivel -- Incrementa el nivel en 1 para cada iteración ascendente
            FROM 
                relacion r
            INNER JOIN 
                padres ph ON r.hijo_id = ph.ID AND r.hijo_tipo = ph.TIPO
        ),
        hijos AS (
            -- Dependencias descendentes (hijos)
            SELECT 
                hijo_id AS ID, 
                hijo_tipo AS TIPO,
                CONCAT(hijo_id, '_', hijo_tipo) AS ID_TIPO,
                'DEPENDENCIA HIJO' AS direccion, -- Marca la dirección como descendente
                1 AS nivel -- Nivel inicial para hijos
            FROM 
                relacion 
            WHERE 
                padre_id = ? AND padre_tipo = 'reporte'  -- ID y tipo de la entidad inicial
        
            UNION ALL
        
            SELECT 
                r.hijo_id AS ID, 
                r.hijo_tipo AS TIPO,
                CONCAT(r.hijo_id, '_', r.hijo_tipo) AS ID_TIPO,
                'DEPENDENCIA HIJO' AS direccion,
                ch.nivel + 1 AS nivel -- Incrementa el nivel en 1 para cada iteración descendente
            FROM 
                relacion r
            INNER JOIN 
                hijos ch ON r.padre_id = ch.ID AND r.padre_tipo = ch.TIPO
        )
        
        SELECT 
            base.ID, 
            base.TIPO, 
            CONCAT(base.ID, '_', base.TIPO) AS ID_TIPO,
            base.direccion,
            base.nivel,
            f.label,    
            case when base.nivel= 0 then 'gray' else f.color
            END color,
            case when base.nivel= 0 then 'hexagon' else f.shape
            END shape
        FROM
        ( 
        -- Unión de ambos CTEs
        SELECT DISTINCT 
            ID, 
            TIPO, 
            direccion,
            nivel
        FROM 
            padres
        
        UNION
        SELECT
            ? ID,
            'reporte' TIPO, -- ID y tipo de la entidad inicial
            'INICIO' direccion,
            0 AS nivel -- El nivel 0 indica el inicio (la entidad inicial)
        UNION
        SELECT DISTINCT 
            ID, 
            TIPO, 
            direccion,
            nivel
        FROM 
            hijos
        ) base
        LEFT JOIN monitor_g_flujo f ON f.id_tipo=CONCAT(base.ID, '_',base.TIPO)
        `, [id,id,id]); 
        

        // Verificación de roles y renderizado de la vista
        if (req.user.rol === "Admin" || req.user.rol === "Suscriptor") {
            res.render('dependenciasReporte', {
                user: reporte[0],    // Datos del reporte
                objetos: objetos,    // Lista de objetos relacionados
                lista: lista,        // Lista de todos los objetos
                flujo: flujo, 
                relacion: relacion,             
                userName: req.user.email // Nombre de usuario
            });
        } else {
            res.render('index', { userName: req.user.email, titleweb: "Inicio" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
});



router.post('/saveTablaDepenPadre', userControllers.saveTablaDepenPadre); 

// Para el delete reporte
router.get('/deleteTablaDepenPadre/:id_reporte_objeto', authControllers.isAuthenticate, (req, res) => {
    const id_reporte_objeto = req.params.id_reporte_objeto;
    const id_reporte = req.query.id_reporte;

    // Verificar si el usuario tiene el rol de Admin
    if (req.user.rol === "Admin" || req.user.rol === "Suscriptor") {
        conexion.query('DELETE FROM reporte_objeto WHERE id_reporte_objeto = ?', [id_reporte_objeto], (error, results) => {
            if (error) {
                console.error('Error al eliminar la dependencia:', error);
                // Redirigir con un mensaje de error si hay un problema
                res.redirect(`/dependenciasReporte/${id_reporte}?error=ERROR_AL_ELIMINAR`);
            } else {
                // Redirigir a la vista de dependencias después de la eliminación
                res.redirect(`/dependenciasReporte/${id_reporte}`);
            }
        });
    } else {
        // Redirigir a la vista de dependencias con un mensaje de no autorizado si no es admin
        res.redirect(`/dependenciasReporte/${id_reporte}?error=NO_TIENE_PERMISO`);
    }
});


// Ruta para direccionar a monitorNetezzaConsultas_activas.ejs
router.get('/monitorNetezzaConsultas_activas', authControllers.isAuthenticate, async (req, res) => {
    if (req.user.rol === "Admin") {
        const queryActive = `
            SELECT
            s.STATUS,
            case
            when q.qs_state = 1 then 'pending'
            when q.qs_state = 2 then 'queued'
            when q.qs_state = 3 then 'running'
            when q.qs_state = 4 then 'aborted'
            when q.qs_state = 5 then 'done'
            else 'unknown'
            end as QSC_STATE,
            q.QS_STATE,
            q.QS_ESTCOST,
            q.QS_ESTDISK,
            q.QS_ESTMEM,
            q.QS_SNIPPETS,
            s.CONNTIME,
            s.IPADDR,
            s.CLIENT_OS_USERNAME,
            s.USERNAME,
            s.DBNAME,
            s.PRIORITY,
            s.COMMAND,
            q.QS_RESBYTES,
            q.QS_RESROWS
            FROM
                _V_SESSION s
            LEFT JOIN 
                _V_QRYSTAT q ON q.qs_sessionid = s.id
            WHERE
            s.STATUS in ('active')    
        `;

        const queryIdle = `
            SELECT
            s.STATUS,
            case
            when q.qs_state = 1 then 'pending'
            when q.qs_state = 2 then 'queued'
            when q.qs_state = 3 then 'running'
            when q.qs_state = 4 then 'aborted'
            when q.qs_state = 5 then 'done'
            else 'unknown'
            end as QSC_STATE,
            q.QS_STATE,
            q.QS_ESTCOST,
            q.QS_ESTDISK,
            q.QS_ESTMEM,
            q.QS_SNIPPETS,
            s.CONNTIME,
            s.IPADDR,
            s.CLIENT_OS_USERNAME,
            s.USERNAME,
            s.DBNAME,
            s.PRIORITY,
            s.COMMAND,
            q.QS_RESBYTES,
            q.QS_RESROWS
            FROM
                _V_SESSION s
            LEFT JOIN 
                _V_QRYSTAT q ON q.qs_sessionid = s.id
            WHERE
            s.STATUS in ('idle')    
        `;

        const queryCount = `
            SELECT
                COALESCE(s.STATUS, 'Total') AS ESTADO,
                COUNT(s.STATUS) AS CANTIDAD
            FROM
                _V_SESSION s
            LEFT JOIN 
                _V_QRYSTAT q ON q.qs_sessionid = s.id
            GROUP BY 
                s.STATUS
            UNION ALL
            SELECT
                'Total' AS STATUS,
                COUNT(*)
            FROM
                _V_SESSION s;
        `;

        try {
            const netezzaConexion = await cxNetezza(); // Espera la conexión a Netezza
            const resultsActive = await netezzaConexion.query(queryActive); // Ejecuta la consulta para 'active'
            const resultsIdle = await netezzaConexion.query(queryIdle); // Ejecuta la consulta para 'idle'
            const resultsCount = await netezzaConexion.query(queryCount); // Ejecuta la consulta para 'count'
            
            res.render('monitorNetezzaConsultas_activas', { 
                resultsActive: resultsActive, 
                resultsIdle: resultsIdle,
                resultsCount: resultsCount 
            });
        } catch (error) {
            console.error('Error al ejecutar la consulta en Netezza:', error);
            res.status(500).send('Ocurrió un error al ejecutar la consulta en Netezza.');
        }
    } else {
        res.render('index', { userName: req.user.email, titleweb: "Inicio" });
    }
});




module.exports = router;