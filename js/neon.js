/**
 * Figuras de neón del programa (programa.html).
 * ---------------------------------------------------------------
 * San Rafael Arcángel y la iglesia (los dibujos de js/figuras.js)
 * convertidos en contornos de neón que flotan a los lados de las
 * actividades, alternando lado y figura.
 *  - El contorno sale de los bordes del dibujo; el brillo se pinta una
 *    sola vez en el lienzo (sin filtros CSS que recalcular).
 *  - Flotan con una animación de transform (styles.css), en pausa cuando
 *    la sección no se ve. Se encienden al llegar a la pantalla.
 */
(function () {
  "use strict";

  var FIG = window.FERIA_FIGURAS;
  var seccion = document.querySelector(".programa-actividades");
  if (!FIG || !seccion || !document.createElement("canvas").getContext) return;

  // Figura, ancho en pantalla y color de cada neón (se repiten en orden)
  var MODELOS = [
    { figura: "iglesia", ancho: 180, color: "#2EE6FF" },
    { figura: "rafael", ancho: 110, color: "#FFD23F" },
    { figura: "iglesia", ancho: 170, color: "#FF4FB8" },
    { figura: "rafael", ancho: 110, color: "#2EE6FF" }
  ];
  var DISTANCIA = 650; // px de sección por figura
  var ESCALA = 2;      // resolución del lienzo (nitidez en pantallas densas)

  /** Dibujo de la figura convertido en contorno de neón. */
  function crearNeon(nombre, ancho, color) {
    var figura = FIG[nombre];
    var w = Math.round(ancho * ESCALA);
    var h = Math.round(figura.alto * (ancho / figura.ancho) * ESCALA);
    var margen = 16 * ESCALA; // espacio para el brillo

    // 1. El dibujo, con sus colores
    var base = document.createElement("canvas");
    base.width = w;
    base.height = h;
    var bc = base.getContext("2d");
    bc.scale(w / figura.ancho, w / figura.ancho);
    figura.dibujar(bc, 1);
    var datos = bc.getImageData(0, 0, w, h).data;

    // 2. Bordes: donde cambia el relleno o el color entre píxeles vecinos
    var borde = document.createElement("canvas");
    borde.width = w;
    borde.height = h;
    var ec = borde.getContext("2d");
    var salida = ec.createImageData(w, h);
    var px = salida.data;

    function lleno(i) { return datos[i + 3] > 110; }
    function distinto(i, j) {
      if (lleno(i) !== lleno(j)) return true;
      if (!lleno(i)) return false;
      return Math.abs(datos[i] - datos[j]) + Math.abs(datos[i + 1] - datos[j + 1]) + Math.abs(datos[i + 2] - datos[j + 2]) > 120;
    }
    function marcar(x, y) {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      var k = (y * w + x) * 4;
      px[k] = px[k + 1] = px[k + 2] = 255;
      px[k + 3] = 255;
    }
    for (var y = 0; y < h - 1; y++) {
      for (var x = 0; x < w - 1; x++) {
        var i = (y * w + x) * 4;
        if (distinto(i, i + 4) || distinto(i, i + w * 4)) {
          marcar(x, y);
          marcar(x + 1, y); // trazo de 2 px
          marcar(x, y + 1);
        }
      }
    }
    ec.putImageData(salida, 0, 0);

    // 3. Tubo de neón: el trazo en color con brillo y un núcleo claro encima
    var color2 = document.createElement("canvas");
    color2.width = w;
    color2.height = h;
    var cc = color2.getContext("2d");
    cc.drawImage(borde, 0, 0);
    cc.globalCompositeOperation = "source-in";
    cc.fillStyle = color;
    cc.fillRect(0, 0, w, h);

    var lienzo = document.createElement("canvas");
    lienzo.width = w + margen * 2;
    lienzo.height = h + margen * 2;
    var c = lienzo.getContext("2d");
    c.shadowColor = color;
    c.shadowBlur = 14 * ESCALA;
    c.drawImage(color2, margen, margen);
    c.drawImage(color2, margen, margen); // dos pasadas: brillo más intenso
    c.shadowBlur = 5 * ESCALA;
    c.drawImage(color2, margen, margen);
    c.shadowBlur = 0;
    c.globalAlpha = 0.75;
    c.drawImage(borde, margen, margen); // núcleo blanco

    lienzo.className = "neon";
    lienzo.setAttribute("aria-hidden", "true");
    lienzo.style.setProperty("--w", (lienzo.width / ESCALA) + "px");
    return lienzo;
  }

  var capa = document.createElement("div");
  capa.className = "neon-capa";
  capa.setAttribute("aria-hidden", "true");
  seccion.insertBefore(capa, seccion.firstChild);

  var neones = [];

  // Se encienden al llegar a la pantalla (una vez)
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add("is-encendido");
      io.unobserve(entrada.target);
    });
  }, { rootMargin: "0px 0px -10% 0px" }) : null;

  /**
   * Tantas figuras como quepan según el alto de la sección (cambia con
   * el filtro de días), repartidas de arriba abajo y alternando lados.
   */
  function acomodar() {
    var alto = seccion.offsetHeight;
    var cantidad = Math.max(2, Math.min(12, Math.round(alto / DISTANCIA)));
    while (neones.length < cantidad) {
      var n = neones.length;
      var modelo = MODELOS[n % MODELOS.length];
      var neon = crearNeon(modelo.figura, modelo.ancho, modelo.color);
      neon.classList.add(n % 2 ? "neon--der" : "neon--izq");
      neon.style.setProperty("--i", n);
      capa.appendChild(neon);
      if (io) io.observe(neon);
      else neon.classList.add("is-encendido");
      neones.push(neon);
    }
    neones.forEach(function (neon, i) {
      neon.hidden = i >= cantidad;
      // Debajo del filtro de días; luego, repartidas
      neon.style.top = "calc(" + ((i + 0.5) / cantidad * 100) + "% - " + (neon.height / ESCALA / 2) + "px)";
    });
  }

  acomodar();
  if ("ResizeObserver" in window) {
    var ultimoAlto = 0;
    new ResizeObserver(function () {
      var alto = seccion.offsetHeight;
      if (Math.abs(alto - ultimoAlto) < 200) return;
      ultimoAlto = alto;
      acomodar();
    }).observe(seccion);
  }
})();
