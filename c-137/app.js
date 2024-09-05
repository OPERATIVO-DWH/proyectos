const express = require('express')
const app = express()
const path = require('path')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

dotenv.config({path: './env/.env'})

app.set('view engine','ejs')

app.use(express.urlencoded({extended:false}))
app.use(cookieParser())

//importa de router
app.use('/', require('./routes/router'))

//lee archivos de public
app.use(express.static(path.join(__dirname, '/public')))

const PORT = process.env.PORT || 5137

app.listen(PORT, ()=>{
    console.log('server runnig in port:', PORT)
});

// app.listen(5000, ()=>{
//     console.log('server runnig in port: 5000')
// });