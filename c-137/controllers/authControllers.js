const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const conexion = require('../database/db');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { promisify } = require('util');
const {authenticate} = require('./auth')
const getUserByEmail = async (email) => {
    const query = 'SELECT * FROM user WHERE email = ?';
    const [user1] = await db.execute(query, [email]);
    return user1;
  };

//procedimiento para registrar
exports.register = async (req, res) => {     
    try {
        const name = req.body.name;
        const email = req.body.email;
        const AD = req.body.Active_Director; // Corregido a AD
        
        // Inserción en la base de datos
        conexion.query('INSERT INTO user SET ?', { name, email, AD }, (error, results) => {
            if (error) {
                console.error(error); // Agrega este console para facilitar el debug
                return res.render('register', {
                    alert: true,
                    alertMessage: 'El email o AD ya existe' // Mensaje de error mejorado
                });
            } 

            // Contenido del correo
            const contentHTML = `
                <h1>Información de Usuario</h1>
                <ul>
                    <li>Nombre: ${name}</li>
                    <li>Email: ${email}</li>
                    <li>Active Director: ${AD}</li>
                </ul>
            `;

            // Configuración del correo con Nodemailer (usa variables de entorno)
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER, // Usa variables de entorno
                    pass: process.env.EMAIL_PASS  // Usa variables de entorno para contraseñas
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'C-137 | Registro Exitoso',
                html: contentHTML
            };

            // Enviar el correo
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error enviando el email: ', error);
                } else {
                    console.log('Email enviado: ' + info.response);
                }
            });

            // Redirigir al usuario tras el registro exitoso
            res.redirect('/');
        });
    } catch (error) {
        console.error('Error en el registro: ', error);
        res.status(500).send('Ocurrió un error en el registro');
    }
};


// Procedimiento para login
// Procedimiento para login
exports.login = async (req, res) => {
    try {
        const email = req.body.email;
        const pass = req.body.pass;
        const user = req.body.user;

        // Verificar si el usuario o la contraseña están vacíos
        if (!user || !pass) {
            return res.render('login', {
                alert: true,
                alertTitle: "Advertencia",
                alertMessage: "Ingrese el usuario y la contraseña",
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            });
        } else {
            // Obtener los datos del usuario desde la base de datos
            conexion.query('SELECT * FROM user WHERE AD = ?', [user], async (error, results) => {
                if (error) {
                    console.error('Error en la consulta:', error);
                    return res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: 'Error en la base de datos',
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'
                    });
                }

                // Verificar si el usuario no existe en la base de datos
                if (results.length === 0) {
                    return res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "El usuario no existe",
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'
                    });
                }

                // Autenticación externa con la función authenticate
                let resp = await authenticate(user, pass);

                // Verificar el resultado de la autenticación externa
                if (resp.response === true) {
                    console.log('Autenticación externa exitosa:', resp.message);

                    const id = results[0].id;
                    const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, {
                        expiresIn: process.env.JWT_EXPIRATION_TIME
                    });

                    // Opciones para la cookie del JWT
                    const cookiesOptions = {
                        expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES, 10) * 24 * 60 * 60 * 1000),
                        httpOnly: true
                    };

                    // Guardar el token en una cookie
                    res.cookie('jwt', token, cookiesOptions);

                    // Renderizar login exitoso
                    return res.render('index', {
                        alert: true,
                        alertTitle: "Satisfactorio",
                        alertMessage: 'Logueo Correcto',
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 800,
                        ruta: 'index',
                        userName: results[0].email,
                        userRol: results[0].rol,
                        // user:  results[0],
                        results: results,
                        user1: results[0]
                    });
                } else {
                    // Autenticación externa fallida (contraseña incorrecta)
                    return res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: `Contraseña incorrecta: ${resp.message}`,
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'
                    });
                }
            });
        }
    } catch (error) {
        console.error('Error durante el login:', error);
        return res.render('login', {
            alert: true,
            alertTitle: "Error",
            alertMessage: 'Error durante el inicio de sesión',
            alertIcon: 'error',
            showConfirmButton: true,
            timer: false,
            ruta: 'login'
        });
    }
};


// procedimiento para autenticar
exports.isAuthenticate = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // Verificar el JWT y obtener los datos decodificados
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);

            // Buscar al usuario en la base de datos por su ID
            conexion.query('SELECT * FROM user WHERE id= ?', [decodificada.id], (error, results) => {
                if (error) {
                    console.log(error);
                    return next();
                }

                if (results.length === 0) {
                    return res.redirect('/login');
                }

                // Asignar el usuario autenticado a `req.user`
                req.user = results[0];
                return next();
            });
        } catch (error) {
            console.log(error);
            return next();
        }
    } else {
        // Si no hay JWT, redirigir a la página de login
        res.redirect('/login');
    }
};

// Procedimiento de logout
exports.logout = (req, res) => {
    res.clearCookie('jwt')
    res.redirect('/login')
};


