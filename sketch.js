// ECOS DEL TIEMPO - PAUSA
// Adaptación del reloj creativo a una extensión de Firefox.
// Autor: Sergio Núñez
//
// He conservado las tres ideas del reloj anterior:
// HORAS    -> El color depende de la hora actual.
// MINUTOS  -> El núcleo crece con el progreso de la pausa.
// SEGUNDOS -> Cada segundo aparece una onda nueva.
//
// El popup puede cerrarse en cualquier momento. Por eso guardamos
// cuándo terminará el temporizador y recuperamos el tiempo restante.

// Las ondas que estamos dibujando se guardan en este array.
let ondas = [];

// Con esta variable evitamos crear muchas ondas en el mismo segundo.
let ultimoSegundo = -1;

// Paleta original: un color para cada hora del día.
let coloresHoras = [];

// Datos principales del temporizador.
let duracionMinutos = 5;
let tiempoTotal = 5 * 60 * 1000;
let tiempoRestante = tiempoTotal;
let horaFinal = 0;

// El estado puede ser: listo, activo, pausado o finalizado.
let estado = 'listo';

// Nombre utilizado para guardar y recuperar nuestros datos.
const CLAVE_GUARDADO = 'ecosDelTiempoPausa';

// Guardamos referencias a los elementos HTML para no buscarlos
// constantemente mientras p5.js dibuja las animaciones.
let contadorHTML;
let estadoHTML;
let mensajeHTML;
let selectorHTML;
let duracionHTML;
let botonPrincipal;
let avanceHTML;
let barraHTML;

// setup() se ejecuta al abrir el popup de Firefox.
function setup() {
  const lienzo = createCanvas(300, 150);
  lienzo.parent('zona-canvas');

  frameRate(30);
  ellipseMode(CENTER);

  // Conservo los mismos 24 colores del proyecto Ecos del tiempo.
  coloresHoras = [
    color(40, 45, 100),    // 00:00
    color(45, 50, 115),    // 01:00
    color(50, 55, 130),    // 02:00
    color(55, 65, 145),   // 03:00
    color(65, 75, 160),   // 04:00
    color(80, 90, 175),   // 05:00
    color(110, 120, 190), // 06:00
    color(150, 145, 190), // 07:00
    color(200, 170, 160), // 08:00
    color(255, 190, 120), // 09:00
    color(255, 205, 100), // 10:00
    color(255, 220, 110), // 11:00
    color(255, 200, 90),  // 12:00
    color(255, 175, 80),  // 13:00
    color(255, 150, 75),  // 14:00
    color(255, 125, 80),  // 15:00
    color(250, 105, 100), // 16:00
    color(235, 90, 125),  // 17:00
    color(210, 85, 155),  // 18:00
    color(185, 80, 180),  // 19:00
    color(155, 75, 200),  // 20:00
    color(125, 70, 210),  // 21:00
    color(90, 65, 190),   // 22:00
    color(60, 55, 150)    // 23:00
  ];

  // Recuperamos los datos antes de actualizar los botones.
  recuperarDatos();

  contadorHTML = document.getElementById('contador');
  estadoHTML = document.getElementById('estado');
  mensajeHTML = document.getElementById('mensaje');
  selectorHTML = document.getElementById('duracion');
  duracionHTML = document.getElementById('duracion-texto');
  botonPrincipal = document.getElementById('boton-principal');
  avanceHTML = document.getElementById('avance');
  barraHTML = document.getElementById('barra-progreso');

  selectorHTML.value = duracionMinutos;

  // Los eventos se asignan desde JavaScript, no desde el HTML.
  botonPrincipal.addEventListener('click', pulsarBotonPrincipal);
  document.getElementById('boton-reiniciar').addEventListener('click', reiniciarPausa);
  selectorHTML.addEventListener('input', cambiarDuracion);

  actualizarControles();
  actualizarTiempoVisible();
}

// draw() sigue ejecutándose mientras el popup está abierto.
function draw() {
  background(10, 15, 28);

  // Comprobamos el tiempo real, no el número de fotogramas.
  // Así el reloj no se desajusta si el navegador va más lento.
  if (estado === 'activo') {
    tiempoRestante = Math.max(0, horaFinal - Date.now());

    if (tiempoRestante === 0) {
      terminarPausa();
    }
  }

  const colores = obtenerColoresHora(hour());

  // Cada segundo añadimos una onda si el temporizador está activo.
  const segundoActual = Math.floor(Date.now() / 1000);
  if (estado === 'activo' && segundoActual !== ultimoSegundo) {
    crearOnda(colores);
    ultimoSegundo = segundoActual;
  }

  // Dibujamos los mismos elementos que en el reloj original,
  // cambiando sus tamaños para el canvas de 300 x 150 píxeles.
  dibujarParticulas(colores);
  dibujarOndas();
  dibujarCentro(colores);
  dibujarEscalaHoras(hour());

  actualizarTiempoVisible();
}

// Devuelve el color actual y el siguiente dentro de las 24 horas.
function obtenerColoresHora(hora) {
  const principal = coloresHoras[hora];
  const siguiente = coloresHoras[(hora + 1) % 24];
  return [principal, siguiente];
}

// Crea una circunferencia que irá creciendo y desapareciendo.
function crearOnda(colores) {
  let colorOnda = colores[0];

  // Alternamos los dos colores para que las ondas no sean iguales.
  if (ondas.length % 2 !== 0) {
    colorOnda = colores[1];
  }

  ondas.push({
    tamano: 30,
    transparencia: 220,
    color: colorOnda
  });
}

// Dibuja y actualiza las ondas que hay en el array.
function dibujarOndas() {
  noFill();
  strokeWeight(2);

  // Vamos hacia atrás porque eliminamos las ondas antiguas.
  for (let i = ondas.length - 1; i >= 0; i--) {
    const onda = ondas[i];

    stroke(
      red(onda.color),
      green(onda.color),
      blue(onda.color),
      onda.transparencia
    );
    circle(width / 2, 67, onda.tamano);

    // Las ondas se amplían mientras van perdiendo visibilidad.
    onda.tamano = onda.tamano + 2;
    onda.transparencia = onda.transparencia - 3;

    if (onda.transparencia <= 0) {
      ondas.splice(i, 1);
    }
  }
}

// El núcleo se hace más grande a medida que transcurre la pausa.
function dibujarCentro(colores) {
  let progreso = 0;

  if (tiempoTotal > 0) {
    progreso = 1 - tiempoRestante / tiempoTotal;
  }
  progreso = constrain(progreso, 0, 1);

  // Al comenzar es pequeño; al terminar es más grande.
  const tamanoBase = map(progreso, 0, 1, 37, 68);
  const pulsacion = sin(frameCount * 0.07) * 2;
  const tamano = tamanoBase + pulsacion;

  noStroke();
  fill(red(colores[1]), green(colores[1]), blue(colores[1]), 55);
  circle(width / 2, 67, tamano + 19);

  fill(colores[0]);
  circle(width / 2, 67, tamano);

  fill(255, 230);
  circle(width / 2, 67, 7);
}

// Ocho pequeñas partículas giran alrededor del núcleo,
// como ocurría en la versión de pantalla completa.
function dibujarParticulas(colores) {
  noStroke();

  for (let i = 0; i < 8; i++) {
    const angulo = frameCount * 0.009 + i * (TWO_PI / 8);
    const distancia = 48 + sin(frameCount * 0.025 + i) * 8;

    const x = width / 2 + cos(angulo) * distancia;
    const y = 67 + sin(angulo) * distancia;

    if (i % 2 === 0) {
      fill(red(colores[0]), green(colores[0]), blue(colores[0]), 150);
    } else {
      fill(red(colores[1]), green(colores[1]), blue(colores[1]), 150);
    }
    circle(x, y, 4);
  }
}

// Reutilizamos la escala de las 24 horas, ahora más pequeña.
// Una fila de puntos permite reconocer el color de cada hora.
function dibujarEscalaHoras(horaActual) {
  const inicioX = 24;
  const espacio = 11;
  const y = 138;

  for (let i = 0; i < 24; i++) {
    const x = inicioX + i * espacio;
    noStroke();
    fill(coloresHoras[i]);
    circle(x, y, 6);

    if (i === horaActual) {
      noFill();
      stroke(255, 200);
      strokeWeight(1.5);
      circle(x, y, 10);
    }
  }
}

// Guardamos solamente la información necesaria para recuperar
// el temporizador; no hace falta guardar cada onda animada.
function guardarDatos() {
  const datos = {
    duracionMinutos: duracionMinutos,
    tiempoTotal: tiempoTotal,
    tiempoRestante: tiempoRestante,
    horaFinal: horaFinal,
    estado: estado
  };

  // storeItem() es una función de p5.js basada en localStorage.
  storeItem(CLAVE_GUARDADO, datos);
}

// Al abrir la extensión, recuperamos el estado del uso anterior.
function recuperarDatos() {
  // Si es la primera vez, getItem() devuelve null.
  const datos = getItem(CLAVE_GUARDADO);

  if (!datos || typeof datos !== 'object') {
    return;
  }

  // Comprobamos que los datos recuperados tengan valores válidos.
  if (!Number.isInteger(datos.duracionMinutos) ||
      datos.duracionMinutos < 1 || datos.duracionMinutos > 30 ||
      !['listo', 'activo', 'pausado', 'finalizado'].includes(datos.estado)) {
    return;
  }

  duracionMinutos = datos.duracionMinutos;
  tiempoTotal = duracionMinutos * 60 * 1000;
  estado = datos.estado;
  tiempoRestante = Number(datos.tiempoRestante);
  horaFinal = Number(datos.horaFinal);

  if (!Number.isFinite(tiempoRestante)) {
    tiempoRestante = tiempoTotal;
  }
  tiempoRestante = constrain(tiempoRestante, 0, tiempoTotal);

  // Lo importante: si estaba activo, calculamos cuánto falta
  // comparando la hora de finalización con Date.now().
  if (estado === 'activo') {
    if (!Number.isFinite(horaFinal) || horaFinal <= 0) {
      estado = 'listo';
      tiempoRestante = tiempoTotal;
      horaFinal = 0;
    } else {
      tiempoRestante = Math.max(0, horaFinal - Date.now());
      if (tiempoRestante === 0) {
        estado = 'finalizado';
        horaFinal = 0;
      }
    }
  }

  guardarDatos();
}

// Este botón cambia de función según el estado actual.
function pulsarBotonPrincipal() {
  if (estado === 'listo' || estado === 'finalizado') {
    iniciarPausa();
  } else if (estado === 'activo') {
    pausarPausa();
  } else if (estado === 'pausado') {
    continuarPausa();
  }
}

// Comienza un temporizador nuevo.
function iniciarPausa() {
  tiempoTotal = duracionMinutos * 60 * 1000;
  tiempoRestante = tiempoTotal;
  horaFinal = Date.now() + tiempoTotal;
  estado = 'activo';
  ultimoSegundo = -1;
  ondas = [];
  guardarDatos();
  actualizarControles();
}

// Guardamos el tiempo que queda antes de detenerlo.
function pausarPausa() {
  tiempoRestante = Math.max(0, horaFinal - Date.now());
  horaFinal = 0;
  estado = 'pausado';
  guardarDatos();
  actualizarControles();
}

// Continuamos desde el tiempo que había quedado guardado.
function continuarPausa() {
  horaFinal = Date.now() + tiempoRestante;
  estado = 'activo';
  ultimoSegundo = -1;
  guardarDatos();
  actualizarControles();
}

// Restablecemos la duración elegida por el usuario.
function reiniciarPausa() {
  estado = 'listo';
  tiempoTotal = duracionMinutos * 60 * 1000;
  tiempoRestante = tiempoTotal;
  horaFinal = 0;
  ondas = [];
  guardarDatos();
  actualizarControles();
  actualizarTiempoVisible();
}

// Si el usuario mueve el slider, guardamos su preferencia.
function cambiarDuracion() {
  if (estado === 'activo' || estado === 'pausado') {
    return;
  }

  duracionMinutos = Number(selectorHTML.value);
  reiniciarPausa();
}

// Se ejecuta al completar todos los segundos del descanso.
function terminarPausa() {
  tiempoRestante = 0;
  horaFinal = 0;
  estado = 'finalizado';
  guardarDatos();
  actualizarControles();
}

// Cambiamos textos y botones según el estado del temporizador.
function actualizarControles() {
  selectorHTML.disabled = estado === 'activo' || estado === 'pausado';
  selectorHTML.value = duracionMinutos;
  duracionHTML.textContent = duracionMinutos + ' min';

  if (estado === 'listo') {
    estadoHTML.textContent = 'Preparado';
    botonPrincipal.textContent = 'Iniciar pausa';
    mensajeHTML.textContent = 'Selecciona un tiempo y pulsa Iniciar.';
  } else if (estado === 'activo') {
    estadoHTML.textContent = 'En marcha';
    botonPrincipal.textContent = 'Pausar';
    mensajeHTML.textContent = 'Puedes cerrar la extensión y volver después.';
  } else if (estado === 'pausado') {
    estadoHTML.textContent = 'En pausa';
    botonPrincipal.textContent = 'Continuar';
    mensajeHTML.textContent = 'El temporizador está detenido.';
  } else {
    estadoHTML.textContent = 'Completado';
    botonPrincipal.textContent = 'Repetir pausa';
    mensajeHTML.textContent = '¡Descanso terminado! Puedes empezar otra pausa.';
  }
}

// Actualizamos el tiempo en el DOM y la barra de progreso.
function actualizarTiempoVisible() {
  if (!contadorHTML) {
    return;
  }

  const segundos = Math.ceil(tiempoRestante / 1000);
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;

  // padStart() añade un cero si el número tiene una sola cifra.
  const texto = String(minutos).padStart(2, '0') + ':' +
                String(resto).padStart(2, '0');
  if (contadorHTML.textContent !== texto) {
    contadorHTML.textContent = texto;
  }

  const progreso = tiempoTotal > 0
    ? Math.max(0, Math.min(100, (1 - tiempoRestante / tiempoTotal) * 100))
    : 0;
  avanceHTML.style.width = progreso + '%';
  barraHTML.setAttribute('aria-valuenow', String(Math.round(progreso)));
}
