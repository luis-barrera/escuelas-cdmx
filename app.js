const express = require('express')
const app = express()
const port = 3000

app.use(express.static("public"));

const alcaldias = require(__dirname + "/data/alcaldias.json")
const privadas = require(__dirname + "/data/privadas.json")
const publicas = require(__dirname + "/data/publicas.json")

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html")
})

app.get('/alcaldias', (req, res) => {
  res.json(alcaldias)
})

app.get('/privadas', (req, res) => {
  res.json(privadas)
})

app.get('/publicas', (req, res) => {
  res.json(publicas)
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
