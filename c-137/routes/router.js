const https = require('https');
const express = require('express')
const router = express.Router()
// invoca a la base de datos mysql
const conexion = require('../database/db')
const cxNetezza = require('../database/netezza_db')
const conexion_jira = require('../database/db_jira')

//invoca el metodo CRUD de usuarios
const userControllers = require('../controllers/userControllers')
const authControllers = require('../controllers/authControllers')

const { Router } = require('express')
const { json } = require('express')

const { exec } = require('child_process');

const path = require('path');
const fs = require('fs');

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
                res.render('users', {results : results, userName: req.user.email, userRol: req.user.rol})
            } else {
                res.render('index', { userName: req.user.email, userRol: req.user.rol });
            }              
        }
    })    
});



// para direccionar a create.ejs
router.get('/createUser', authControllers.isAuthenticate,(req, res) => {
    if(req.user.rol=="Admin") {
        res.render('createUser')
    } else {
        res.render('index', { userName: req.user.email, userRol: req.user.rol });
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
                res.render('editUser', {user : results [0], userName: req.user.email, userRol: req.user.rol})
            } else {
                res.render('index', { userName: req.user.email, userRol: req.user.rol });
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
        res.render('index', { userName: req.user.email, userRol: req.user.rol });
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
                // res.render('inventarioReportes', { results: results });
                res.render('inventarioReportes', { results: results, userName: req.user.email, userRol: req.user.rol });
            }
        });
    } else {
        res.render('index', { userName: req.user.email, titleweb: "Inicio" });
    }
});


// para direccionar a inventarioReportesCreate.ejs
router.get('/inventarioReportesCreate', authControllers.isAuthenticate,(req, res) => {
    if(req.user.rol=="Admin" || req.user.rol === "Suscriptor") {
        res.render('inventarioReportesCreate', { userName: req.user.email, userRol: req.user.rol, alert: false })        
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
                res.render('inventarioReportesEdit', {user : results [0], userName: req.user.email, userRol: req.user.rol})
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
                res.render('inventarioTablas', { results: results, userName: req.user.email, userRol: req.user.rol });
            }
        });
    } else {
        res.render('index', { userName: req.user.email, titleweb: "Inicio" });
    }
});

// para direccionar a inventarioTablasCreate.ejs
router.get('/inventarioTablasCreate', authControllers.isAuthenticate,(req, res) => {
    if(req.user.rol=="Admin" || req.user.rol === "Suscriptor") {
        res.render('inventarioTablasCreate', { userName: req.user.email, userRol: req.user.rol, alert: false })        
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
                res.render('inventarioTablasEdit', {user : results [0], userName: req.user.email, userRol: req.user.rol})
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
                res.render('inventarioProcesos', { results: results, userName: req.user.email, userRol: req.user.rol });
            }
        });
    } else {
        res.render('index', { userName: req.user.email, titleweb: "Inicio" });
    }
});

// para direccionar a inventarioProcesosCreate.ejs
router.get('/inventarioProcesosCreate', authControllers.isAuthenticate,(req, res) => {
    if(req.user.rol=="Admin" || req.user.rol === "Suscriptor") {
        res.render('inventarioProcesosCreate', {userName: req.user.email, userRol: req.user.rol, alert: false })        
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
                res.render('inventarioProcesosEdit', {user : results [0], userName: req.user.email, userRol: req.user.rol})
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
                padre_tipo_id TIPO_ID,
                -- CONCAT(padre_id, '_', padre_tipo_id) AS ID_TIPO,
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
                r.padre_tipo_id TIPO_ID,
                -- CONCAT(r.padre_id, '_', r.padre_tipo_id) AS ID_TIPO,
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
                hijo_tipo_id TIPO_ID,
                -- CONCAT(hijo_id, '_', hijo_tipo_id) AS ID_TIPO,
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
                r.hijo_tipo_id TIPO_ID,
                -- CONCAT(r.hijo_id, '_', r.hijo_tipo_id) AS ID_TIPO,
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
            base.TIPO_ID,
            -- CONCAT(base.ID, '_', base.TIPO) AS ID_TIPO,    
            CAST(CONCAT(base.ID, base.TIPO_ID) AS UNSIGNED) AS ID_TIPO,
            base.direccion,
            base.nivel,
            f.label,    
            case when base.nivel= 0 then 'orange' else f.color
            END color,
            case when base.nivel= 0 then 'hexagon' else f.shape
            END shape
        FROM
        ( 
        -- Unión de ambos CTEs
        SELECT DISTINCT 
            ID, 
            TIPO,
            TIPO_ID, 
            direccion,
            nivel
        FROM 
            padres
        
        UNION
        SELECT
            ? ID,
            'reporte' TIPO, -- ID y tipo de la entidad inicial
            111 TIPO_ID,
            'INICIO' direccion,
            0 AS nivel -- El nivel 0 indica el inicio (la entidad inicial)
        UNION
        SELECT DISTINCT 
            ID, 
            TIPO, 
            TIPO_ID,
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
                padre_id, 
                padre_tipo,
                padre_tipo_id, 
                hijo_id, 
                hijo_tipo,
                hijo_tipo_id,
                'DEPENDENCIA PADRE' AS direccion, -- Marca la dirección como ascendente
                0 AS nivel -- Nivel inicial para padres
            FROM 
                relacion 
            WHERE 
                hijo_id = ? AND hijo_tipo = 'reporte'  -- ID y tipo de la entidad inicial
            UNION ALL
            SELECT 
                r.padre_id, 
                r.padre_tipo,
                r.padre_tipo_id, 
                r.hijo_id, 
                r.hijo_tipo,
                r.hijo_tipo_id,
                'DEPENDENCIA PADRE' AS direccion,
                ph.nivel + 1 AS nivel -- Incrementa el nivel en 1 para cada iteración ascendente
            FROM 
                relacion r
            INNER JOIN 
                padres ph ON r.hijo_id = ph.padre_id AND r.hijo_tipo = ph.padre_tipo
        ),
        hijos AS (
            -- Dependencias descendentes (hijos)
            SELECT 
                padre_id, 
                padre_tipo, 
                padre_tipo_id,
                hijo_id, 
                hijo_tipo,
                hijo_tipo_id,
                'DEPENDENCIA HIJO' AS direccion, -- Marca la dirección como descendente
                0 AS nivel -- Nivel inicial para hijos
            FROM 
                relacion 
            WHERE 
                padre_id = ? AND padre_tipo = 'reporte'  -- ID y tipo de la entidad inicial
            UNION ALL
            SELECT 
                r.padre_id, 
                r.padre_tipo,
                r.padre_tipo_id,
                r.hijo_id, 
                r.hijo_tipo,
                r.hijo_tipo_id,
                'DEPENDENCIA HIJO' AS direccion,
                ch.nivel + 1 AS nivel -- Incrementa el nivel en 1 para cada iteración descendente
            FROM 
                relacion r
            INNER JOIN 
                hijos ch ON r.padre_id = ch.hijo_id AND r.padre_tipo = ch.hijo_tipo
        )
        SELECT
            ba.id_tipo_padre AS de,
            -- ba.padre_id,
            -- ba.padre_tipo,
            ba.id_tipo_hijo AS a,
            -- ba.hijo_id,
            -- ba.hijo_tipo,
            -- ba.direccion,
            -- ba.nivel
            'to' flecha

        FROM 
        (
        -- Unión de ambos CTEs y obtención de los resultados
        SELECT 
            -- CONCAT(padre_id, '_', padre_tipo) AS id_tipo_padre,
            CAST(CONCAT(padre_id,padre_tipo_id) AS UNSIGNED) AS id_tipo_padre,
            padre_id,
            padre_tipo,
            -- CONCAT(hijo_id, '_', hijo_tipo) AS id_tipo_hijo,
            CAST(CONCAT(hijo_id,hijo_tipo_id) AS UNSIGNED) AS id_tipo_hijo,
            hijo_id,
            hijo_tipo,
            direccion,
            nivel
        FROM 
            padres
        
        UNION ALL
        
        SELECT 
            CAST(CONCAT(padre_id,padre_tipo_id) AS UNSIGNED) AS id_tipo_padre,
            padre_id,
            padre_tipo,
            CAST(CONCAT(hijo_id,hijo_tipo_id) AS UNSIGNED) AS id_tipo_hijo,
            hijo_id,
            hijo_tipo,
            direccion,
            nivel
        FROM 
            hijos
        
        ORDER BY 
            direccion ASC,
            nivel ASC) ba
        `, [id,id]); 
        

        // Verificación de roles y renderizado de la vista
        if (req.user.rol === "Admin" || req.user.rol === "Suscriptor") {
            res.render('dependenciasReporte', {
                user: reporte[0],    // Datos del reporte
                objetos: objetos,    // Lista de objetos relacionados
                lista: lista,        // Lista de todos los objetos
                flujo: flujo, 
                relacion: relacion,             
                userName: req.user.email, // Nombre de usuario
                userRol: req.user.rol
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
                resultsCount: resultsCount,
                userName: req.user.email, 
                userRol: req.user.rol
            });
        } catch (error) {
            console.error('Error al ejecutar la consulta en Netezza:', error);
            res.status(500).send('Ocurrió un error al ejecutar la consulta en Netezza.');
        }
    } else {
        res.render('index', { userName: req.user.email, titleweb: "Inicio" });
    }
});




router.get('/download', authControllers.isAuthenticate, (req, res) => {
    let query;
    let queryParams = [];

    if (req.user.rol === "Admin") {
        query = `
            SELECT DISTINCT
                r.id,
                r.reporte,
                r.direccion_ftp,
                tipo_acceso 
            FROM 
                acceso_reportes r 
            ORDER BY 
                r.id ASC
        `;
    } else if (req.user.rol === "Suscriptor") {
        query = `
            SELECT DISTINCT
                r.id,
                r.reporte,
                r.direccion_ftp,
                tipo_acceso 
            FROM 
                acceso_reportes r 
            WHERE 
                r.usuario = ?
            ORDER BY 
                r.id ASC
        `;
        queryParams = [req.user.email];
    }

    conexion.query(query, queryParams, (error, results) => {
        if (error) {
            throw error;
        } else {
            const currentDateTime = new Date();
            const currentDate = currentDateTime.toISOString().split('T')[0];
            const currentHour = String(currentDateTime.getHours()).padStart(2, '0');

            results.forEach((result) => {
                if (result.direccion_ftp && result.reporte) {
                    const filePath = path.join(result.direccion_ftp, result.reporte);

                    try {
                        const stats = fs.statSync(filePath);

                        const formatDate = (date) => {
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = date.getFullYear();
                            const hours = String(date.getHours()).padStart(2, '0');
                            const minutes = String(date.getMinutes()).padStart(2, '0');
                            const seconds = String(date.getSeconds()).padStart(2, '0');
                            return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
                        };

                        result.mtime = formatDate(stats.mtime);

                        // Verificar si la fecha y hora de la modificación coinciden con la fecha y hora actual
                        const mtimeDate = new Date(stats.mtime);
                        const mtimeDateOnly = mtimeDate.toISOString().split('T')[0];
                        const mtimeHour = String(mtimeDate.getHours()).padStart(2, '0');

                        result.isToday = currentDate === mtimeDateOnly;
                        result.isCurrentHour = currentHour === mtimeHour;

                    } catch (err) {
                       // console.error(`Error al obtener la fecha de última modificación para el archivo ${filePath}:`, err);
                        result.mtime = 'No disponible';
                        result.isToday = false;
                        result.isCurrentHour = false;
                    }
                } else {
                    console.warn(`Advertencia: 'direccion_ftp' o 'reporte' están vacíos para el id ${result.id}`);
                    result.mtime = 'No disponible';
                    result.isToday = false;
                    result.isCurrentHour = false;
                }
            });

            res.render('download', { results: results, userName: req.user.email, userRol: req.user.rol });
        }
    });
});





router.get('/download_file', authControllers.isAuthenticate, (req, res) => {
    if (req.user.rol === "Admin" || req.user.rol === "Suscriptor") {
        const id = req.query.id; // Obtiene el ID desde los parámetros de la URL
        const ftp = decodeURIComponent(req.query.ftp); // Obtiene la dirección FTP desde los parámetros de la URL
        console.log('Dirección FTP recibida:', ftp);
        console.log('ID recibido:', id); // Log del ID recibido

        // Asume que el ID corresponde directamente al nombre del archivo
        const filename = `${id}`; // Usa el ID para construir el nombre del archivo
        console.log('Nombre del archivo:', filename);

        // Construye la ruta del archivo
        const filePath = path.join(ftp.endsWith('\\') ? ftp : ftp + '\\', filename);
        console.log('Ruta del archivo:', filePath); // Log de la ruta del archivo

        // Verifica si el archivo existe antes de intentar descargarlo
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error('Archivo no encontrado:', filePath);
                return res.redirect('/download?error=ARCHIVO_NO_ENCONTRADO');
            }

            // Obtiene las estadísticas del archivo
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error('Error al obtener detalles del archivo:', err);
                    return res.redirect('/download?error=ERROR_OBTENER_DETALLES');
                }

                // Imprime la fecha de creación y la fecha de última modificación
                console.log('Fecha de creación:', stats.birthtime);
                console.log('Fecha de última modificación:', stats.mtime);

                // Maneja la descarga del archivo
                res.download(filePath, filename, (err) => {
                    if (err) {
                        console.error('Error al descargar el archivo:', err);
                        return;
                    }

                    // Registra la descarga en la base de datos solo si la descarga fue exitosa
                    const fecha_accion = new Date();

                    // Extrae solo la dirección IP IPv4 si es necesario
                    let ip_usuario = req.ip || req.connection.remoteAddress;
                    if (ip_usuario.startsWith('::ffff:')) {
                        ip_usuario = ip_usuario.substring(7); // Elimina la parte '::ffff:'
                    }

                    // Realiza la inserción en la base de datos
                    conexion.query('INSERT INTO log_descargas SET ?', {
                        id_reporte: id, // Asegúrate de que este valor sea compatible con el tipo de datos de la columna
                        nombre_reporte: filename,
                        accion: 'DESCARGAR',
                        usuario: req.user.email,
                        fecha_accion: fecha_accion,
                        ip_usuario: ip_usuario                       
                    }, (error) => {
                        if (error) {
                            console.error('Error al registrar la descarga:', error);
                            // No redirijas aquí, solo registra el error
                        }

                        // Solo redirige después de intentar registrar la descarga
                        // Si hay un error al registrar, aún redirige, solo si la respuesta no fue enviada antes
                        if (!res.headersSent) {
                            res.redirect('/download?status=success');
                        }
                    });
                });
            });
        });

    } else {
        res.render('index', { userName: req.user.email, titleweb: "Inicio" });
    }
});



router.get('/abrir_file', authControllers.isAuthenticate, (req, res) => {
    if (req.user.rol === "Admin" || req.user.rol === "Suscriptor") {
        const id = req.query.id; // Obtiene el ID desde los parámetros de la URL
        const ftp = decodeURIComponent(req.query.ftp); // Obtiene la dirección FTP desde los parámetros de la URL
        console.log('Dirección FTP recibida:', ftp);
        console.log('ID recibido:', id); // Log del ID recibido

        // Asume que el ID corresponde directamente al nombre del archivo
        const filename = `${id}`; // Usa el ID para construir el nombre del archivo
        console.log('Nombre del archivo:', filename);

        // Construye la ruta del archivo
        const filePath = path.join(ftp.endsWith('\\') ? ftp : ftp + '\\', filename);
        console.log('Ruta del archivo:', filePath); // Log de la ruta del archivo

        // Verifica si el archivo existe antes de intentar abrirlo
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error('Archivo no encontrado:', filePath);
                return res.redirect('/download?error=ARCHIVO_NO_ENCONTRADO');
            }

            // Obtiene las estadísticas del archivo
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error('Error al obtener detalles del archivo:', err);
                    return res.redirect('/download?error=ERROR_OBTENER_DETALLES');
                }

                // Imprime la fecha de creación y la fecha de última modificación
                console.log('Fecha de creación:', stats.birthtime);
                console.log('Fecha de última modificación:', stats.mtime);

                // Abre el archivo en el sistema operativo
                exec(`start "" "${filePath}"`, (err) => {
                    if (err) {
                        console.error('Error al intentar abrir el archivo:', err);
                        res.redirect('/download?error=ERROR_ABRIR_ARCHIVO');
                    } else {
                        console.log('Archivo abierto exitosamente:', filePath);
                        // Opcional: redirige a una página de éxito o muestra un mensaje
                        //res.redirect('/download'); // Cambia esta ruta según sea necesario
                    }
                });
            });
        });

    } else {
        res.render('index', { userName: req.user.email, titleweb: "Inicio" });
    }
});


router.get('/todo_reportes', authControllers.isAuthenticate, (req, res) => {
    let query;
    let queryParams = [];

    if (req.user.rol === "Admin") {
        query = `
            SELECT DISTINCT
                r.id,
                r.reporte,
                r.direccion_ftp 
            FROM 
                acceso_reportes r 
            ORDER BY 
                r.id ASC
        `;
    } else if (req.user.rol === "Suscriptor") {
        query = `
            SELECT DISTINCT
                r.id,
                r.reporte,
                r.direccion_ftp 
            FROM 
                acceso_reportes r 
            ORDER BY 
                r.id ASC
        `;
        queryParams = [req.user.email];
    }

    conexion.query(query, queryParams, (error, results) => {
        if (error) {
            throw error;
        } else {
            const today = new Date().toISOString().split('T')[0];
            
            results.forEach((result) => {
                if (result.direccion_ftp && result.reporte) {
                    const filePath = path.join(result.direccion_ftp, result.reporte);

                    try {
                        const stats = fs.statSync(filePath);
                        const formatDate = (date) => {
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = date.getFullYear();
                            const hours = String(date.getHours()).padStart(2, '0');
                            const minutes = String(date.getMinutes()).padStart(2, '0');
                            const seconds = String(date.getSeconds()).padStart(2, '0');
                            return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
                        };

                        result.mtime = formatDate(stats.mtime);
                        const mtimeDate = new Date(stats.mtime).toISOString().split('T')[0];
                        result.isToday = today === mtimeDate;

                    } catch (err) {
                        //console.error(`Error al obtener la fecha de última modificación para el archivo ${filePath}:`, err);
                        result.mtime = 'No disponible';
                        result.isToday = false;
                    }
                } else {
                    console.warn(`Advertencia: 'direccion_ftp' o 'reporte' están vacíos para el id ${result.id}`);
                    result.mtime = 'No disponible';
                    result.isToday = false;
                }
            });

            res.render('todo_reportes', { results: results, userName: req.user.email, userRol: req.user.rol });
        }
    });
});





router.get('/Acceso_reportes', authControllers.isAuthenticate, (req, res) => {
    let query;
    let queryParams = [];

    if (req.user.rol === "Admin") {
        query = `
            SELECT 
                id, direccion_ftp, reporte, usuario ,fecha_modificacion,tipo_acceso
            FROM acceso_reportes
            ORDER BY id ASC
        `;
    } else if (req.user.rol === "Suscriptor") {
        res.render('index', { userName: req.user.email, titleweb: 'Inicio' });
    }

    conexion.query(query, queryParams, (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            return res.status(500).send('Error en el servidor');
        }

        // Proceso adicional si es necesario (como calcular mtime o estados)

        res.render('Acceso_reportes', { results, userName: req.user.email, userRol: req.user.rol });
    });
});




 
router.get('/Acceso_reportes_Edit/:id', authControllers.isAuthenticate, (req, res) => {
    const id = req.params.id;

    // Asegúrate de que 'id' es el nombre correcto de la columna en la tabla 'acceso_reportes'
    conexion.query('SELECT id, reporte, direccion_ftp, usuario,tipo_acceso,DATE_FORMAT(fecha_modificacion, \'%Y-%m-%d %H:%i:%s\')as fecha_modificacion FROM acceso_reportes WHERE id = ?', [id], (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        } else {
            // Mostrar los resultados en la consola
            console.log('Resultados de la consulta:', results);

            if (req.user && (req.user.rol === 'Admin' || req.user.rol === 'Suscriptor')) {
                // Asegúrate de que la vista 'Accesso_reportes_Edit' existe
                res.render('Acceso_reportes_Edit', { user: results[0], userName: req.user.email, userRol: req.user.rol });
                
            } else {
                res.render('index', { userName: req.user.email, titleweb: 'Inicio' });
            }
        }
    });
});


  
router.post('/saveTablas', userControllers.saveTablas); 
router.post('/updateTablas', userControllers.updateTablas);  
router.post('/Acceso_reportes_Edit', userControllers.Acceso_reportes_Edit); 
router.post('/updateAcesso_reporte',  userControllers.updateAcesso_reporte);

 

// para direccionar a AccesoreportesCreate.ejs
router.get('/AccesoreportesCreate', authControllers.isAuthenticate,(req, res) => {
    if(req.user.rol=="Admin" || req.user.rol === "Suscriptor") {
        res.render('AccesoreportesCreate', { userName: req.user.email, userRol: req.user.rol, alert: false })        
    } else {
        res.render('index', { userName: req.user.email, titleweb: "Inicio" });
    }       
});

router.post('/saveAcceso', userControllers.saveAcceso); 





// Para el delete reporte
router.get('/deleteAcceso/:id', authControllers.isAuthenticate, (req, res) => {
    const id = req.params.id;

    // Verificar si el usuario tiene el rol de Admin
    if (req.user.rol === "Admin") {
        conexion.query('DELETE FROM acceso_reportes WHERE id = ?', [id], (error, results) => {
            if (error) {
                throw error;
            } else {
                // Redirigir a la vista de inventarioReportes después de la eliminación
                res.redirect('/Acceso_reportes');
            }
        });
    } else {
        // Redirigir a la vista de inventarioReportes con un mensaje de error o de no autorizado si no es admin
        res.redirect('/Acceso_reportes?error=NO_TIENE_PERMISO');
    }
});



router.get('/link', authControllers.isAuthenticate, (req, res) => {
    if (req.user.rol === "Admin" || req.user.rol === "Suscriptor") {
        const id = req.query.id; // Obtiene el ID del reporte desde los parámetros de la URL
        const reporteLink = id; // Usa el ID del reporte directamente como el link
        const filename = 'nombre_del_reporte'; // Asigna el nombre real del archivo, si es posible obtenerlo dinámicamente
        const fecha_accion = new Date(); // Fecha actual
        let ip_usuario = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress; // Obtén la IP del usuario

        // Elimina la parte '::ffff:' si está presente
        if (ip_usuario && ip_usuario.startsWith('::ffff:')) {
            ip_usuario = ip_usuario.substring(7);
        }

        console.log('Enlace del reporte:', reporteLink); // Log del link generado para el reporte

        // Realiza la inserción en la base de datos antes de redirigir
        conexion.query('INSERT INTO log_descargas SET ?', {
            id_reporte: id, // Asegúrate de que este valor sea compatible con el tipo de datos de la columna
            nombre_reporte: filename, // Nombre del reporte
            accion: 'LINK', // Acción realizada
            usuario: req.user.email, // Email del usuario
            fecha_accion: fecha_accion, // Fecha de la acción
            ip_usuario: ip_usuario // IP del usuario
        }, (error) => {
            if (error) {
                console.error('Error al registrar la descarga:', error);
                // Maneja el error si ocurre, pero continúa con la redirección
            }

            // Verifica si el reporteLink comienza con "https://"
            if (!reporteLink.startsWith('https://')) {
                console.error('Enlace no seguro:', reporteLink);
                return res.redirect('/download?error=ARCHIVO_NO_ENCONTRADO');
            }

            // Solo redirige si el reporteLink es válido
            if (reporteLink) {
                // Redirige al enlace del reporte directamente después de registrar la descarga
                return res.redirect(reporteLink);
            } else {
                // Si no hay reporte, redirige a la página de descargas
                return res.redirect('/download');
            }
        });
    } else {
        // Si el rol no es Admin o Suscriptor, redirige a la página de descargas
        return res.redirect('/download');
    }
});

router.get('/popup-content', authControllers.isAuthenticate, (req, res) => {
    const id = req.query.id; // Obtiene el ID del reporte desde los parámetros de la URL
    const reporteLink = id; // Usa el ID del reporte directamente como el link
    const filename = `${id}`; // Asigna el nombre real del archivo, si es posible obtenerlo dinámicamente
    const fecha_accion = new Date(); // Fecha actual
    let ip_usuario = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress; // Obtén la IP del usuario
    
    console.log("ID del reporte:", id);
    console.log("Reporte Link:", reporteLink);
    console.log("Nombre del archivo:", filename);
    console.log("Fecha de la acción:", fecha_accion);
    console.log("IP del usuario:", ip_usuario);

    // Elimina la parte '::ffff:' si está presente en la IP
    if (ip_usuario && ip_usuario.startsWith('::ffff:')) {
        ip_usuario = ip_usuario.substring(7);
    }

    // Realiza la inserción en la base de datos antes de enviar la respuesta
    conexion.query('INSERT INTO log_descargas SET ?', {
        id_reporte: id, // Asegúrate de que este valor sea compatible con el tipo de datos de la columna
        nombre_reporte: filename, // Nombre del reporte
        accion: 'LINK', // Acción realizada
        usuario: req.user.email, // Email del usuario, o 'anonimo' si no está disponible
        fecha_accion: fecha_accion, // Fecha de la acción
        ip_usuario: ip_usuario // IP del usuario
    }, (error) => {
        if (error) {
            console.error('Error al registrar la descarga:', error);
            return res.status(500).send('Error al registrar la descarga');
        }

        // Enviar la respuesta HTML solo si la inserción fue exitosa
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Popup Content</title>
                <style>
                    body, html {
                        margin: 0;
                        padding: 0;
                        height: 100%;
                        width: 100%;
                        overflow: hidden; /* Evita que aparezcan barras de desplazamiento */
                    }
                    iframe {
                        border: none;
                        width: 100%;
                        height: 100%; /* Asegura que el iframe ocupe todo el espacio disponible 
                        overflow: auto; /* Permite barras de desplazamiento dentro del iframe si es necesario */
                        pointer-events: auto; /* Permite la interacción con el contenido del iframe */
                    }
                </style>
            </head>
            <body>
                <iframe src="${reporteLink}" frameborder="0"></iframe>
            </body>
            </html>
        `);
    });
});

// para direccionar a dpi.ejs
router.get('/dpi', authControllers.isAuthenticate,(req, res) => {
    //const id = req.params.id;    
    const { executeSSHCommand } = require('../src/ssh/ssh-connect');
    const { executeSSHCommand2 } = require('../src/ssh/ssh-connect-dpi-2');
    
    const app = express();
    //const bb = 'Hola'        
      executeSSHCommand((err, result) => {
        if (err) {
          return res.status(500).send(`Error al ejecutar el comando SSH: ${err}`);
        }        
        //res.render('dpi', {result})
        //res.render('dpi', {bb})
        executeSSHCommand2((err, result2) => {
            if (err) {
              return res.status(500).send(`Error al ejecutar el comando SSH: ${err}`);
            }        
            res.render('dpi', {result, result2, userName: req.user.email, userRol: req.user.rol})            
        });    
      });
    
    //res.render('dpi', {bb})   
}); 

// para direccionar a dpi.ejs   KILL
router.post('/dpiKill', authControllers.isAuthenticate,(req, res) => {
    const id_process = req.body.numero; //req.params.numero;
    //res.send('¡Hola, este es un texto simple desde Node.js!');
    //res.send(id_process);
    
    const { executeSSHCommand } = require('../src/ssh/ssh-connect');
    const { executeSSHCommand2 } = require('../src/ssh/ssh-connect-dpi-2');
    const { executeSSHCommand3 } = require('../src/ssh/ssh-connect-dpi-3-kill');
    
    const app = express();    

    executeSSHCommand3((err, result2) => {
        if (err) {
        return res.status(500).send(`Error al ejecutar el comando SSH: ${err}`);
        }        
        //res.render('dpi', {result, result2, userName: req.user.email, userRol: req.user.rol, id_process: id_process})            
    }, id_process);    

      executeSSHCommand((err, result) => {
        if (err) {
          return res.status(500).send(`Error al ejecutar el comando SSH: ${err}`);
        }                        
        executeSSHCommand2((err, result2) => {
            if (err) {
              return res.status(500).send(`Error al ejecutar el comando SSH: ${err}`);
            }        
            res.render('dpi', {result, result2, userName: req.user.email, userRol: req.user.rol, id_process: id_process})            
        });    
      });
          
}); 

// para direccionar a dataStage-11-7.ejs
router.get('/dataStage-11-7', authControllers.isAuthenticate,(req, res) => {

    const { executeSSHCommand } = require('../src/ssh/ssh-connect-ds-11-7');
    const { executeSSHCommand2 } = require('../src/ssh/ssh-connect-ds-11-7-2');
    
    const app = express();
          
    executeSSHCommand((err, result) => {
    if (err) {
        return res.status(500).send(`Error al ejecutar el comando SSH: ${err}`);
    }        
    executeSSHCommand2((err, result2) => {
        if (err) {
            return res.status(500).send(`Error al ejecutar el comando SSH: ${err}`);
        }        
        res.render('dataStage-11-7', {result, result2, userName: req.user.email, userRol: req.user.rol})            
    });    
    });    
}); 

// para direccionar a dataStage-11-7.ejs
router.post('/dataStage-11-7', authControllers.isAuthenticate,(req, res) => {
    const id_process = req.body.numero;     

    const { executeSSHCommand } = require('../src/ssh/ssh-connect-ds-11-7');
    const { executeSSHCommand2 } = require('../src/ssh/ssh-connect-ds-11-7-2');
    const { executeSSHCommand3 } = require('../src/ssh/ssh-connect-ds-11-7-3-kill');
    
    const app = express();

    if (!id_process || id_process === '') { // cuando la variable es vacia o nula
        //res.send('¡Hola, este es un texto simple desde Node.js!');
        //res.send(id_process);        
    }
    else {
        executeSSHCommand3((err, result2) => {
            if (err) {
            return res.status(500).send(`Error al ejecutar el comando SSH: ${err}`);
            }        
            //res.render('dpi', {result, result2, userName: req.user.email, userRol: req.user.rol, id_process: id_process})            
        }, id_process);    
    }
            
      executeSSHCommand((err, result) => {
        if (err) {
          return res.status(500).send(`Error al ejecutar el comando SSH: ${err}`);
        }        
        executeSSHCommand2((err, result2) => {
            if (err) {
              return res.status(500).send(`Error al ejecutar el comando SSH: ${err}`);
            }        
            res.render('dataStage-11-7', {result, result2, userName: req.user.email, userRol: req.user.rol, id_process: id_process})            
        });    
      });    
}); 


// para direccionar a pentaho.ejs
router.get('/pentaho', authControllers.isAuthenticate,(req, res) => {

    const { executeSSHCommand } = require('../src/ssh/ssh-connect-pentaho-13');
    const { executeSSHCommand2 } = require('../src/ssh/ssh-connect-pentaho-13-2');
    
    const app = express();
        
      executeSSHCommand((err, result) => {
        if (err) {
          return res.status(500).send(`Error al ejecutar el comando SSH: ${err}`);
        }        
        executeSSHCommand2((err, result2) => {
            if (err) {
              return res.status(500).send(`Error al ejecutar el comando SSH: ${err}`);
            }        
            res.render('pentaho', {result, result2, userName: req.user.email, userRol: req.user.rol})            
        });    
      });    
}); 

// para direccionar a voneRpl.ejs
router.get('/voneRpl', authControllers.isAuthenticate,(req, res) => {

    const conexion2 = require('../database/db-vone-rpl')

    conexion2.query('select min(timestamp) as min_fecha, max(timestamp) as max_fecha from record.charge_record', (error, results1) => {
        if(error){
        throw error;
        } else {    
            conexion2.query('select min(end_timestamp) as min_fecha, max(end_timestamp) as max_fecha from record.session_record', (error, results2) => {
                if(error){
                throw error;
                } else {    
                    if(req.user.rol=="Admin" || req.user.rol === "Suscriptor") {
                        res.render('voneRpl', {datos2 : results2 [0], datos1 : results1 [0], userName: req.user.email, userRol: req.user.rol})                        
                    } else {
                        res.render('index', { userName: req.user.email, titleweb: "Inicio" });
                    }            
                }
            })
        }    
    })
}); 

// para direccionar a storageVivaTePresta.ejs
router.get('/storageVivaTePresta', authControllers.isAuthenticate,(req, res) => {

    const conexion2 = require('../database/db-storage-viva-te-presta')

    conexion2.query('SELECT recharge_date, COUNT(1) AS total_recharges FROM storage.recharge_day WHERE TIMESTAMP >= NOW() - INTERVAL 7 DAY GROUP BY recharge_date ORDER BY recharge_date DESC', (error, results1) => {
        if(error){
        throw error;
        } else {                
            if(req.user.rol=="Admin" || req.user.rol === "Suscriptor") {
                const user1 = Array.isArray(results1) ? results1 : [];
                res.render('storageVivaTePresta', {datos1 : user1, userName: req.user.email, userRol: req.user.rol})                        
            } else {
                res.render('index', { userName: req.user.email, titleweb: "Inicio" });
            }                               
        }    
    })
}); 

// para direccionar a traficoVoz.ejs
router.get('/traficoVoz', authControllers.isAuthenticate,async(req, res) => {

    //const express = require('express');
    //const router = express.Router();
    const { getConnection } = require('./../database/db-fludb'); // Importar la conexión a la base de datos
    
    // Ruta que ejecuta la consulta SQL
    //router.get('/consulta', async (req, res) => {
      let connection;
      try {
        // Obtener conexión a la base de datos
        connection = await getConnection();
        
        // Ejecutar consulta SQL
        const result = await connection.execute(`SELECT fecha, count(1) as cantidad FROM trafico.stg_traf_bill_uno WHERE FECHA >= TO_DATE('20240921','YYYYMMDD') group by fecha order by fecha`);
        
        // Enviar el resultado como respuesta
        res.json(result.rows);
      } catch (err) {
        console.error('Error ejecutando la consulta', err);
        res.status(500).send('Error en la consulta Uhhhh');
      } finally {
        if (connection) {
          try {

            if(req.user.rol=="Admin" || req.user.rol === "Suscriptor") {
                const user1 = Array.isArray(result) ? result : [];
                res.render('storageVivaTePresta', {datos1 : user1, userName: req.user.email, userRol: req.user.rol})                        
            } else {
                res.render('index', { userName: req.user.email, titleweb: "Inicio" });
            }                               

            // Cerrar la conexión
            await connection.close();

          } catch (err) {
            console.error('Error al cerrar la conexión', err);
          }
        }
      }
    //});
    
    //module.exports = router;
    


    /*const conexion2 = require('../database/db-fludb')

    conexion2.query('SELECT recharge_date, COUNT(1) AS total_recharges FROM storage.recharge_day WHERE TIMESTAMP >= NOW() - INTERVAL 7 DAY GROUP BY recharge_date ORDER BY recharge_date DESC', (error, results1) => {
        if(error){
        throw error;
        } else {                
            if(req.user.rol=="Admin" || req.user.rol === "Suscriptor") {
                const user1 = Array.isArray(results1) ? results1 : [];
                res.render('storageVivaTePresta', {datos1 : user1, userName: req.user.email, userRol: req.user.rol})                        
            } else {
                res.render('index', { userName: req.user.email, titleweb: "Inicio" });
            }                               
        }    
    })*/
}); 

// Ruta para direccionar a JIRA.ejs
router.get('/monitorJira', authControllers.isAuthenticate, async (req, res) => {
    try {
        // Consulta para obtener fechas
        const queryFecha = `
            SELECT f.id,f.date_ini,f.date_fin,case when f.en_ejecucion=1 then 'EN EJECUCION' ELSE 'DISPONIBLE' END en_ejecucion FROM jira_date_created f
        `;

        const queryIssue = `
            SELECT
            CASE WHEN j.created IS NULL then 'no' ELSE j.created END CREADO,
            j.status_name ESTADO,
            j.issue_key ISSUE,
            j.assignee_email ASIGNADO,
            j.summary TITULO,
            -- j.customfield_10121,
            -- j.timetracking_timeSpent,
            j.issuelinks_inwardIssue ESCALADO,
            j.inwardIssue_key ISSUE_ESCALADO,
            h.assignee_email ASIGNADO_ESCALADO,
            h.status_name ESTADO_ESCALADO,
            h.customfield_10121 TIEMPO_SOLUCION,
            h.timetracking_timeSpent TIEMPO_SOLUCION_2,
            CONCAT('https://salamancasolutions.atlassian.net/issues/', j.issue_key) AS LINK,
            "https://salamancasolutions.atlassian.net/jira/software/c/projects/NTSUP24/issues" AS link_incidencias,
            case 
            when j.issuelinks_inwardIssue=0 then 'bg-danger'
            when j.issuelinks_inwardIssue=1 AND h.status_name IN ('Finalizada')  then 'bg-success'
            when j.issuelinks_inwardIssue=1 AND h.status_name NOT IN ('Finalizada') then 'bg-warning'  
            else 'bg-light text-muted'
            end cod
            FROM
            jira_issues_op j
            LEFT JOIN jira_issues_op h ON j.inwardIssue_key = h.issue_key
            WHERE 
            j.assignee_email IN ('Justo Fernando Martinez Rivera','Justo Fernando Martinez Rivera','jhonny Balderrama Guzman','Juan Carlos Balderrama','Jose Villanueva')
            AND j.status_name NOT IN ('Finalizada','Resolved-Validation Pending')
            ORDER BY 
            j.issuelinks_inwardIssue ASC,
            h.status_name DESC;

        `;

        // Usar las consultas con promesas
        const [fecha] = await conexion_jira.query(queryFecha); 
        const [issue] = await conexion_jira.query(queryIssue);

        // Verificación de roles y renderizado de la vista
        if (req.user.rol === "Admin") {
            res.render('monitorJira', {                
                fecha: fecha,    // Lista de fechas
                issue: issue,    // Lista de issues                          
                userName: req.user.email, // Nombre de usuario
                userRol: req.user.rol
            });
        } else {
            res.render('index', { 
                userName: req.user.email, 
                titleweb: "Inicio" 
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
});

router.post('/updateFecha', userControllers.updateFecha); 



module.exports = router;
