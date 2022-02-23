const express = require('express')
const app = express()
const port = 3000

// Hacemos público el dir "public" que contiene js y css para la página
app.use(express.static("public"));

// Obtenemos los archivos que contienen la información
const alcaldias = require(__dirname + "/data/alcaldias.json")
const privadas = require(__dirname + "/data/privadas.json")
const publicas = require(__dirname + "/data/publicas.json")

// Home
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html")
})

// Rutas para obtener los datos a través de get requests.
app.get('/alcaldias', (req, res) => {
  res.json(alcaldias)
})

app.get('/privadas', (req, res) => {
  res.json(privadas)
})

app.get('/publicas', (req, res) => {
  res.json(publicas)
})

// Puerto de la app
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
