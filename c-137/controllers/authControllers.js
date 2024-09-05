const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const conexion = require('../database/db');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { promisify } = require('util');

//procedimiento para registrar
exports.register = async (req, res) => {     
    try {
        const name = req.body.name
        const email = req.body.email
        const pass = req.body.pass 
        let passHash = await bcryptjs.hash(pass, 10)
        // console.log(name + " - " + email + " - " + pass)  
        // console.log(name + " - " + email + " - " + passHash) 
        conexion.query('INSERT INTO user SET ?', {name: name, email: email, pass: passHash}, (error, results) => {
            if(error){
                // console.error(error)
                res.render('register', {
                    alert: true,
                    alertMessage: 'El email ya exsiste'
                })
            } else {
                // Contenido del correo
                const contentHTML = `
                    <h1>Informacion de Usuario</h1>
                    <ul>
                        <li>Nombre: ${name}</li>
                        <li>Email: ${email}</li>
                    </ul>
                `;

                // Configuración del correo
                // Paso 1: Generar una contraseña de aplicación
                //     Accede a tu cuenta de Google: Ve a myaccount.google.com y asegúrate de haber iniciado sesión.

                //     Ve a Seguridad: En el panel de navegación de la izquierda, selecciona "Seguridad".

                //     Verificación en dos pasos: Bajo la sección "Iniciar sesión en Google", asegúrate de que la verificación en dos pasos esté activada.

                //     Contraseñas de aplicaciones: Debajo de la opción de verificación en dos pasos, deberías ver una opción para "Contraseñas de aplicaciones". Selecciona esta opción.

                //     Crear una nueva contraseña de aplicación:

                //     Selecciona la aplicación que quieres usar (puedes elegir "Correo" o "Otro").
                //     Elige el dispositivo para el que quieres generar la contraseña.
                //     Haz clic en "Generar".
                //     Usar la contraseña generada: Google te proporcionará una contraseña de 16 caracteres. Utiliza esta contraseña en lugar de tu contraseña normal de Gmail en Nodemailer.
                
                /////////////////////////////////////////////////////////////////////////////////
                // const transporter = nodemailer.createTransport({
                //     service: 'gmail',
                //     auth: {
                //         user: 'j.fernando.martinez.rivera@gmail.com', // Tu correo de Gmail
                //         pass: 'igmc nozu joms nuse' // Tu contraseña de Gmail o app password si tienes 2FA activado
                //     }
                // });

                // const mailOptions = {
                //     from: 'j.fernando.martinez.rivera@gmail.com',
                //     to: email,
                //     subject: 'C-137 | Registro Exitoso',
                //     html: contentHTML
                // };
                ///////////////////////////////////////////////////////////////////////////

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'operacion.de.datos@gmail.com', // Tu correo de Gmail
                        pass: 'lgfd uskk wuhi zlfx' // Tu contraseña de Gmail o app password si tienes 2FA activado
                    }
                });

                const mailOptions = {
                    from: 'operacion.de.datos@gmail.com',
                    to: email,
                    subject: 'C-137 | Registro Exitoso',
                    html: contentHTML
                };

                // Enviar el correo
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error(error);
                    } else {
                        console.log('Email enviado: ' + info.response);
                    }
                });
                // Contenido del correo
                res.redirect('/')
            }            
        })
    } catch (error) {
        console.error(error)
    }
};

// Procedimiento para login
exports.login = (req, res) => {
    try {
        const email = req.body.email;
        const pass = req.body.pass;

        if (!email || !pass) {
            res.render('login', {
                alert: true,
                alertTitle: "warning",
                alertMessage: "Ingrese el email y la contraseña",
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            });
        } else {
            conexion.query('SELECT * FROM user WHERE email = ?', [email], async (error, results) => {
                if (results.length === 0 || !(await bcryptjs.compare(pass, results[0].pass))) {
                    res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: 'Email o contraseña inválidos',
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'
                    });
                } else {
                    // Login OK
                    const id = results[0].id;
                    const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, {
                        expiresIn: process.env.JWT_EXPIRATION_TIME
                    });

                    const cookiesOptions = {
                        expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES, 10) * 24 * 60 * 60 * 1000), // Asegúrate de que sea un número entero en días
                        httpOnly: true
                    };

                    res.cookie('jwt', token, cookiesOptions);
                    res.render('login', {
                        alert: true,
                        alertTitle: "Satisfactorio",
                        alertMessage: 'Logueo Correcto',
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 800,
                        ruta: ''
                    });
                }
            });
        }
    } catch (error) {
        console.error(error);
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


