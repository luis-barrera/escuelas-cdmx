import './style.css'

import alcaldias from './data/alcaldias.json';
import privadas from './data/privadas.json';
import publicas from './data/publicas.json';

//Coordenadas del mapa y el zoom
// var mapaAlcaldias = L.map('alcaldiasMap').setView([19.432490, -99.133146], 16);
var mapaAlcaldias = L.map('alcaldiasMap', {
  center: [19.320452, -99.133146],
  zoom: 10,
});

// Canvas donde va el chart
var ctx = document.getElementById('miChart').getContext('2d');

// OpenStreetMap
var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';//URL de las imagenes del mapa
var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';//Atribución

// Variables para crear marcadores
var coordenadas = [];

// Colores usados para delimitar las alcaldías
var colors = ["#edae49",
  "#e6954e",
  "#7A871E",
  "#d86357",
  "#d1495b",
  "#696174",
  "#00798c",
  "#B1D8B7",
  "#F1C0B9",
  "#FF8300",
  "#df7c52",
  "#815675",
  "#e38950",
  "#DED93E",
  "#30638e",
  "#003d5b"];

// Dictionarios donde guardo la alcaldía y el número de escuelas correspondientes
var contadorPrivadas = {};
var contadorPublicas = {};
// Arreglo para juntar los datos de alcaldía, escuelas privacadas y escuelas públicas
var contadorTotal = [];

// Cosas del OpenStreetMap
var osm = new L.TileLayer(osmUrl, {
  maxZoom: 18,//Maximo zoom
  attribution: osmAttrib
});
osm.addTo(mapaAlcaldias);

// Estilo de los marker de escuelas son iguales para ambas, solo cambia el color
// Privadas
const markerHtmlPrivada = `
	background-color: #93c47d;
	width: 3rem;
	height: 3rem;
	display: block;
	left: -1.5rem;
	top: -1.5rem;
	position: relative;
	border-radius: 3rem 3rem 0;
	transform: rotate(45deg);
	border: 1px solid #FFFFFF`
// Publicas
const markerHtmlPublica = `
	background-color: #f6b26b;
	width: 3rem;
	height: 3rem;
	display: block;
	left: -1.5rem;
	top: -1.5rem;
	position: relative;
	border-radius: 3rem 3rem 0;
	transform: rotate(45deg);
	border: 1px solid #FFFFFF`

// Creación del icono para el marker con el estilo definido anteriormente
// Estos serán los iconos que se mostraran en el mapa
const iconPrivada = L.divIcon({
  className: "my-custom-pin",
  iconAnchor: [0, 24],
  labelAnchor: [-6, 0],
  popupAnchor: [0, -36],
  html: `<span style="${markerHtmlPrivada}"/>`
})
const iconPublica = L.divIcon({
  className: "my-custom-pin",
  iconAnchor: [0, 24],
  labelAnchor: [-6, 0],
  popupAnchor: [0, -36],
  html: `<span style="${markerHtmlPublica}"/>`
})

// Cluster de todos los marker para la vista en la que mostramos los dos tipos de escuelas
var marcadoresTotal = L.markerClusterGroup();
// Alcaldías
for (let i = 0; i < alcaldias.records.length; i++) {
  // Esta madre ni pinches funciona alv, las coordenadas están al revés
  /* L.polygon(JSON.parse(alcaldias.records[i][8]).coordinates[0]).addTo(mapaAlcaldias); */
  /* L.polygon([JSON.parse(alcaldias.records[i][8]).coordinates[0]]).addTo(mapaAlcaldias); */

  var coordenadas = [];
  // Obtenemos las coordenadas de todos los puntos limitantes de las alcaldías
  alcaldias.records[i][8].coordinates[0].forEach(function(elemento) {
    // Tenemos que cambiar el orden porque pinches datos están mal ordenados
    coordenadas.push([elemento[1], elemento[0]]);
  });

  // Creamos el polígono de la alcaldía y le damos un color
  L.polygon(coordenadas, { color: colors[i] }).addTo(mapaAlcaldias);
}


// Hacemos un cluster de solo escuelas privadas
var marcadoresPrivadas = L.markerClusterGroup();
// Guardamos los marcadores creados para hacer un layer
var marcadores = [];
var marcadoresTodos = [];
// Escuelas privadas
for (let i = 0; i < privadas.records.length; i++) {
  // Creamos el marcador y le ponemos una leyenda con el nombre de la escuela y la ubicación
  let marcador = L.marker([privadas.records[i][10], privadas.records[i][11]], { icon: iconPrivada })
    .bindPopup('<p>Escuela: ' + privadas.records[i][3] + '</p><p>Ubicación: ' + privadas.records[i][9] + '</p>');
  // Vamos guardando los marcadores
  marcadores.push(marcador);
  marcadoresTodos.push(marcador);

  // Vemos a qué alcaldía pertenece y en el diccionario vamos sumando
  if (privadas.records[i][7] in contadorPrivadas) {
    contadorPrivadas[privadas.records[i][7]] = contadorPrivadas[privadas.records[i][7]] + 1;
  } else {
    contadorPrivadas[privadas.records[i][7]] = 1;
  }
}

// Agregamos los marcadores al cluster de escuelas privadas
marcadoresPrivadas.addLayers(marcadores);
// Creamos una layer de solo privadas
var privadasMarkers = L.layerGroup(marcadores);


// Escuelas públicas
// var re = /.*(ALVARO\ OBREGON|AZCAPOTZALCO|BENITO\ JUAREZ|COYOACAN|CUAJIMALPA\ DE\ MORELOS|CUAUHTEMOC|GUSTAVO\ A.\ MADERO|IZTACALCO|IZTAPALAPA|LA\ MAGDALENA\ CONTRERAS|MIGUEL\ HIDALGO|MILPA\ ALTA|TLAHUAC|TLALPAN|VENUSTIANO\ CARRANZA|XOCHIMILCO).*/
// regexp para obtener la delegación
var re = /.*DELEGACION\ (.*?),.*/
// Cluster de escuelas públicas
var marcadoresPublicas = L.markerClusterGroup();
// Arreglo de marcadores vacio
var marcadores = [];
for (let i = 0; i < publicas.records.length; i++) {
  // Creamos el marcador de escuela pública y le agregamos una leyenda
  let marcador = L.marker([publicas.records[i][5], publicas.records[i][6]], { icon: iconPublica })
    .bindPopup('<p>Escuela: ' + publicas.records[i][2] + '</p><p>Ubicación: ' + publicas.records[i][3] + '</p>');
  // Agregamos el marcador al arreglo
  marcadores.push(marcador);
  marcadoresTodos.push(marcador);

  // Usamos la regex para encontrar la alcaldía
  let del = publicas.records[i][3].match(re);
  // Si la regexp encontró la alcaldía proseguimos a sumar uno al contador
  if (del) {
    // Vemos si el diccionario contiene la delegación
    if (del[1] in contadorPublicas) {
      // Sumamos 1 al valor existente
      contadorPublicas[del[1]] = contadorPublicas[del[1]] + 1;
    } else {
      // Si no está agregamos una entrada con esa delegación y el valor 1
      contadorPublicas[del[1]] = 1;
    }
  }
}
// Agregamos al cluster de publicas los marcadores
marcadoresPublicas.addLayers(marcadores);
// Agregamos al cluster de todos las escuelas los marcadores para tener ambos tipos de escuela en un cluster
marcadoresTotal.addLayers(marcadoresTodos);
// Creamos la layer de escuelas públicas
var publicasMarkers = L.layerGroup(marcadoresPublicas);

// Agregar marcadores al mapa
marcadoresTotal.addTo(mapaAlcaldias);
// Agregas las layers al mapa
mapaAlcaldias.layers = [privadasMarkers, publicasMarkers];
// Crea un conjunto de layers
var overlayMaps = {
  "Privadas": marcadoresPrivadas,
  "Publicas": marcadoresPublicas
};
// Crea el menú de layers
L.control.layers(null, overlayMaps).addTo(mapaAlcaldias);


// Arreglo para guardar los datos
// TODO: esta variable ya está en uso
var alcaldias_arr = [];
var privadas_arr = [];
var publicas_arr = [];
// BUG: no hay escuelas publicas en la magdalena y en la miguel hidalgo
Object.entries(contadorPrivadas).forEach(([key, value]) => {
  // Agregamos datos a los arreglos
  alcaldias_arr.push(key);
  privadas_arr.push(value || 0);
  publicas_arr.push(contadorPublicas[key] || 0);
});
// Creamos un arreglo más grande
contadorTotal.push(alcaldias_arr, privadas_arr, publicas_arr);

// Creamos el dataset para el chart de ambos tipos de escuelas
const datos = {
  // Las labels son las alcaldías
  labels: contadorTotal[0],
  // Los datos son el número de escuelas
  datasets: [
    {
      // Agregamos los datos del número de escuelas privadas en un color verde
      label: 'Escuelas Privadas',
      data: contadorTotal[1],
      borderColor: 'white',
      backgroundColor: '#93c47d'
    },
    {
      // Agregamos los datos del número de escuelas publicas en un color naranja
      label: 'Escuelas publicas',
      data: contadorTotal[2],
      borderColor: 'white',
      backgroundColor: '#f6b26b'
    }
  ]
};

// Configuración del chart
const config = {
  type: 'bar',
  data: datos,
  options: {
    indexAxis: 'y',
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Escuelas en la CDMX por alcaldías'
      },
    }
  }
}

// Creamos el chart
var myChart = new Chart(ctx, config);

// Funciones para mostrar u ocultar info
function showPrivadas() {
  // Cambiamos los datos del datasets para que sean solo los de las privadas
  datos.datasets = [{
    label: 'Escuelas Privadas',
    data: contadorTotal[1],
    borderColor: 'white',
    backgroundColor: '#93c47d'
  }];
  // Cambiamos el título del chart
  config.options.plugins.title.text = 'Escuelas privadas en la CDMX por alcaldías';

  // Quitamos todos los marcadores y volvemos a insertar los marcadores de privadas
  mapaAlcaldias.removeLayer(marcadoresTotal);
  mapaAlcaldias.removeLayer(marcadoresPublicas);
  mapaAlcaldias.removeLayer(marcadoresPrivadas);
  marcadoresPrivadas.addTo(mapaAlcaldias);

  // Redibujamos el chart
  myChart.destroy();
  myChart = new Chart(ctx, config);
}


function showPublicas() {
  // Cambiamos los datos del datasets para que sean solo los de las publicas
  datos.datasets = [{
    label: 'Escuelas publicas',
    data: contadorTotal[2],
    borderColor: 'white',
    backgroundColor: '#f6b26b'
  }];
  // Cambiamos el título del chart
  config.options.plugins.title.text = 'Escuelas públicas en la CDMX por alcaldías';

  // Quitamos todos los marcadores y volvemos a insertar los marcadores de privadas
  mapaAlcaldias.removeLayer(marcadoresTotal);
  mapaAlcaldias.removeLayer(marcadoresPublicas);
  mapaAlcaldias.removeLayer(marcadoresPrivadas);
  marcadoresPublicas.addTo(mapaAlcaldias);

  // Redibujamos el chart
  myChart.destroy();
  myChart = new Chart(ctx, config);
}


function showTodas() {
  datos.datasets = [{
    // Agregamos los datos del número de escuelas privadas en un color verde
    label: 'Escuelas Privadas',
    data: contadorTotal[1],
    borderColor: 'white',
    backgroundColor: '#93c47d'
  }, {
    // Agregamos los datos del número de escuelas publicas en un color naranja
    label: 'Escuelas publicas',
    data: contadorTotal[2],
    borderColor: 'white',
    backgroundColor: '#f6b26b'
  }];

  // Cambiamos el título del chart
  config.options.plugins.title.text = 'Escuelas en la CDMX por alcaldías';

  // Agregamos todos los marcadores
  mapaAlcaldias.removeLayer(marcadoresTotal);
  mapaAlcaldias.removeLayer(marcadoresPublicas);
  mapaAlcaldias.removeLayer(marcadoresPrivadas);
  marcadoresTotal.addTo(mapaAlcaldias);

  // Redibujamos el chart
  myChart.destroy();
  myChart = new Chart(ctx, config);
}

// Agrega los listeners para los botones
document.getElementById("showPublicasButton").addEventListener("click", showPublicas)
document.getElementById("showPrivadasButton").addEventListener("click", showPrivadas)
document.getElementById("showTodasButton").addEventListener("click", showTodas)

//
// Promise.all([
//   fetch('/alcaldias'),
//   fetch('/privadas'),
//   fetch('/publicas')
// ]).then(function(responses) {
//   return Promise.all(responses.map(function(response) {
//     return response.json();
//   }));
// }).then(function(data) {
// }).catch(function(error) {
//   // Mostrar errores de obtener los datos del servidor
//   console.log(error)
// });

