/**
 * Fuegos artificiales pequeños del programa (programa.html).
 * ---------------------------------------------------------------
 * Cohetes que al estallar forman, en chiquito, a San Rafael Arcángel
 * y la iglesia (los mismos dibujos de la portada, js/figuras.js);
 * después se deshacen en chispas que caen.
 *  - Cabecera: una vez al abrir. Tocar el arco de San Rafael lanza otro.
 *  - Agradecimientos: una vez, cuando el título llega a la pantalla.
 *
 * Rendimiento: el lienzo está detrás del texto, se detiene y se oculta
 * al terminar (no hay bucle), se pausa fuera de pantalla y tiene un
 * límite de chispas. Con "reducir movimiento" no se activa.
 */
(function () {
  "use strict";

  var FIG = window.FERIA_FIGURAS;
  if (!FIG || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* =========================================================
   * Configuración
   * ======================================================= */

  var TIEMPO = {
    subida: 750,     // cohete hasta el punto de la figura
    formacion: 1100, // chispas viajando hasta formar la figura
    pausa: 1300      // figura completa, titilando
  };
  var COLORES = ["#FFD600", "#00BCEB", "#E6007E", "#FF7900", "#FFFFFF", "#4D8DFF"];
  var GRAVEDAD = 60;      // px/s²
  var MAX_CHISPAS = 900;  // por lienzo
  var CHISPAS_FIGURA = 650; // chispas aproximadas por figura

  /* =========================================================
   * Utilidades
   * ======================================================= */

  function azar(min, max) {
    return min + Math.random() * (max - min);
  }

  function elegir(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  function easeOutCubic(k) {
    return 1 - Math.pow(1 - k, 3);
  }

  function easeInOutCubic(k) {
    return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  }

  /**
   * Puntos de una figura de cierto ancho, relativos a su esquina.
   * Se guardan: volver a lanzar la misma figura no la redibuja.
   */
  var memoria = {};

  function puntosFigura(nombre, ancho) {
    var clave = nombre + ":" + Math.round(ancho);
    if (memoria[clave]) return memoria[clave];

    var figura = FIG[nombre];
    var escala = ancho / figura.ancho;
    var alto = figura.alto * escala;
    var paso = Math.max(2, Math.sqrt((ancho * alto * 0.5) / CHISPAS_FIGURA));
    var lienzo = document.createElement("canvas");
    lienzo.width = Math.ceil(ancho);
    lienzo.height = Math.ceil(alto);
    var c = lienzo.getContext("2d");
    c.scale(escala, escala);
    figura.dibujar(c, Math.max(1.2, (paso * 1.1) / escala));

    var datos = c.getImageData(0, 0, lienzo.width, lienzo.height).data;
    var puntos = [];
    for (var y = 0; y < lienzo.height; y += paso) {
      for (var x = 0; x < lienzo.width; x += paso) {
        var i = (Math.floor(y) * lienzo.width + Math.floor(x)) * 4;
        if (datos[i + 3] < 128) continue;
        puntos.push({ x: x, y: y, color: "rgb(" + datos[i] + "," + datos[i + 1] + "," + datos[i + 2] + ")" });
      }
    }
    memoria[clave] = { puntos: puntos, w: ancho, h: alto, tamano: Math.max(1.3, paso * 0.8) };
    return memoria[clave];
  }

  /* =========================================================
   * Un lienzo de fuegos sobre un contenedor
   * ======================================================= */

  function crearFuegos(contenedor) {
    var canvas = document.createElement("canvas");
    canvas.className = "fuegos-mini";
    canvas.setAttribute("aria-hidden", "true");
    canvas.hidden = true;
    contenedor.insertBefore(canvas, contenedor.firstChild);
    var ctx = canvas.getContext("2d");

    var W = 0;
    var H = 0;
    var t = 0;              // ms del lienzo (no avanza en pausa)
    var cuadro = 0;
    var ultimo = 0;
    var visible = true;
    var cohetes = [];
    var formas = [];
    var chispas = [];
    var pendientes = [];    // { en, fn }

    function medir() {
      var rect = contenedor.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function agregarChispa(x, y, vx, vy, color, vida, tamano) {
      if (chispas.length >= MAX_CHISPAS) return;
      chispas.push({ x: x, y: y, vx: vx, vy: vy, color: color, vida: vida, edad: 0, tamano: tamano });
    }

    function estallido(x, y, cantidad, velocidad, color) {
      for (var i = 0; i < cantidad; i++) {
        var ang = (i / cantidad) * Math.PI * 2 + azar(-0.06, 0.06);
        var v = velocidad * azar(0.5, 1);
        var tono = Math.random() < 0.2 ? elegir(["#FFFFFF", "#FFE680"]) : color;
        agregarChispa(x, y, Math.cos(ang) * v, Math.sin(ang) * v, tono, azar(0.9, 1.5), azar(1.2, 2));
      }
    }

    function cohete(x, y, alEstallar) {
      // Sube desde abajo, pero no más de 360 px (en secciones altas no cruza todo el texto)
      cohetes.push({ sx: x + azar(-30, 30), sy: Math.min(H + 8, y + 360), tx: x, ty: y, edad: 0, dur: TIEMPO.subida, alEstallar: alEstallar });
    }

    /** Cohete que estalla en una figura centrada en (x, y). */
    function figura(nombre, x, y, ancho) {
      cohete(x, y, function () {
        var datos = puntosFigura(nombre, ancho);
        var x0 = x - datos.w / 2;
        var y0 = y - datos.h / 2;
        var radio = Math.max(datos.w, datos.h) * 0.6;
        formas.push({
          centro: { x: x, y: y },
          fin: t + TIEMPO.formacion + TIEMPO.pausa,
          tamano: datos.tamano,
          puntos: datos.puntos.map(function (p) {
            var ang = azar(0, Math.PI * 2);
            return {
              sx: x, sy: y,
              // Primero se abren como explosión y luego se acomodan
              cx: x + Math.cos(ang) * radio * azar(0.5, 1.1),
              cy: y + Math.sin(ang) * radio * azar(0.5, 1.1),
              tx: x0 + p.x + azar(-0.4, 0.4), ty: y0 + p.y + azar(-0.4, 0.4),
              x: x, y: y,
              color: p.color,
              retraso: azar(0, 160),
              dur: azar(TIEMPO.formacion - 400, TIEMPO.formacion - 80),
              edad: 0,
              fase: azar(0, Math.PI * 2)
            };
          })
        });
        estallido(x, y, 26, datos.w * 1.1, "#FFE680");
      });
    }

    /** Fuego normal, pequeño. */
    function simple(x, y, color) {
      cohete(x, y, function () { estallido(x, y, Math.round(azar(40, 60)), azar(90, 130), color || elegir(COLORES)); });
    }

    function programar(ms, fn) {
      pendientes.push({ en: t + ms, fn: fn });
      iniciar();
    }

    /* ---------- Animación ---------- */

    function actualizar(dt) {
      var s = dt / 1000;

      pendientes = pendientes.filter(function (p) {
        if (p.en > t) return true;
        p.fn();
        return false;
      });

      for (var i = cohetes.length - 1; i >= 0; i--) {
        var c = cohetes[i];
        c.edad += dt;
        var k = easeOutCubic(Math.min(1, c.edad / c.dur));
        c.px = c.x === undefined ? c.sx : c.x;
        c.py = c.y === undefined ? c.sy : c.y;
        c.x = c.sx + (c.tx - c.sx) * k;
        c.y = c.sy + (c.ty - c.sy) * k;
        if (c.edad >= c.dur) {
          cohetes.splice(i, 1);
          c.alEstallar();
        }
      }

      for (var f = formas.length - 1; f >= 0; f--) {
        var forma = formas[f];
        if (t >= forma.fin) {
          // Se deshace: las chispas salen desde el centro y caen
          forma.puntos.forEach(function (p) {
            var dx = p.x - forma.centro.x;
            var dy = p.y - forma.centro.y;
            var d = Math.sqrt(dx * dx + dy * dy) || 1;
            var v = azar(40, 120);
            agregarChispa(p.x, p.y, (dx / d) * v, (dy / d) * v - 20, p.color, azar(0.8, 1.4), forma.tamano);
          });
          formas.splice(f, 1);
          continue;
        }
        forma.puntos.forEach(function (p) {
          p.edad += dt;
          var q = easeInOutCubic(Math.max(0, Math.min(1, (p.edad - p.retraso) / p.dur)));
          var u = 1 - q;
          p.x = u * u * p.sx + 2 * u * q * p.cx + q * q * p.tx;
          p.y = u * u * p.sy + 2 * u * q * p.cy + q * q * p.ty;
        });
      }

      for (var j = chispas.length - 1; j >= 0; j--) {
        var ch = chispas[j];
        ch.edad += s;
        if (ch.edad >= ch.vida) {
          chispas.splice(j, 1);
          continue;
        }
        ch.vx *= 0.985;
        ch.vy = ch.vy * 0.985 + GRAVEDAD * s;
        ch.x += ch.vx * s;
        ch.y += ch.vy * s;
      }
    }

    function dibujar() {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      cohetes.forEach(function (c) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#FFE680";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(c.px, c.py + 10);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
      });

      // Las figuras, con sus colores reales (sin sumar luz sobre el azul)
      ctx.globalCompositeOperation = "source-over";
      formas.forEach(function (forma) {
        var tam = forma.tamano;
        forma.puntos.forEach(function (p) {
          ctx.globalAlpha = 0.85 + 0.15 * Math.sin(t * 0.012 + p.fase);
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x - tam / 2, p.y - tam / 2, tam, tam);
        });
      });

      ctx.globalCompositeOperation = "lighter";
      chispas.forEach(function (ch) {
        ctx.globalAlpha = Math.max(0, 1 - ch.edad / ch.vida);
        ctx.fillStyle = ch.color;
        ctx.fillRect(ch.x - ch.tamano / 2, ch.y - ch.tamano / 2, ch.tamano, ch.tamano);
      });

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    function paso(ahora) {
      cuadro = 0;
      var dt = Math.min(50, ahora - (ultimo || ahora));
      ultimo = ahora;
      t += dt;
      actualizar(dt);
      dibujar();
      if (cohetes.length || formas.length || chispas.length || pendientes.length) {
        if (visible) cuadro = requestAnimationFrame(paso);
      } else {
        // Terminó: se limpia y se oculta (no queda nada corriendo)
        ctx.clearRect(0, 0, W, H);
        canvas.hidden = true;
      }
    }

    function iniciar() {
      if (cuadro || !visible) return;
      if (canvas.hidden) {
        canvas.hidden = false;
        medir();
      }
      ultimo = 0;
      cuadro = requestAnimationFrame(paso);
    }

    // En pausa cuando el contenedor sale de la pantalla
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entradas) {
        visible = entradas[0].isIntersecting;
        if (visible) iniciar();
        else if (cuadro) {
          cancelAnimationFrame(cuadro);
          cuadro = 0;
        }
      }).observe(contenedor);
    }

    var anchoMedido = window.innerWidth;
    window.addEventListener("resize", function () {
      if (window.innerWidth === anchoMedido || canvas.hidden) return;
      anchoMedido = window.innerWidth;
      medir();
    });

    medir();
    return {
      figura: figura,
      simple: simple,
      programar: programar,
      tamano: function () { return { w: W, h: H }; }
    };
  }

  /** Posición de un elemento dentro del contenedor. */
  function caja(elemento, contenedor) {
    var r = elemento.getBoundingClientRect();
    var c = contenedor.getBoundingClientRect();
    return { x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height };
  }

  /* =========================================================
   * Cabecera: San Rafael y la iglesia a los lados del arco
   * ======================================================= */

  function initCabecera() {
    var portada = document.querySelector(".programa-portada");
    var arco = document.querySelector(".programa-santo__arco");
    if (!portada || !arco) return;
    var fuegos = crearFuegos(portada);

    /** Lugares libres para las figuras según el ancho. */
    function lugares() {
      var W = fuegos.tamano().w;
      var a = caja(arco, portada);
      if (W < 900) {
        // Teléfonos: el arco va al centro; una figura a cada lado
        var izq = a.x - 6;
        var der = W - (a.x + a.w) - 6;
        return {
          rafael: { x: izq / 2, y: a.y + a.h * 0.45, ancho: Math.min(izq * 0.78, 80) },
          iglesia: { x: W - der / 2, y: a.y + a.h * 0.58, ancho: Math.min(der * 0.95, 130) }
        };
      }
      // Escritorio: el arco va a la derecha; las figuras, entre el título y el arco
      return {
        rafael: { x: a.x - 105, y: a.y + a.h * 0.36, ancho: 96 },
        iglesia: { x: a.x - 360, y: a.y + a.h * 0.1, ancho: 180 }
      };
    }

    function lanzar(nombre) {
      var l = lugares()[nombre];
      if (l.ancho > 30) fuegos.figura(nombre, l.x, l.y, l.ancho);
    }

    function secuencia() {
      var tam = fuegos.tamano();
      fuegos.programar(400, function () { lanzar("rafael"); });
      fuegos.programar(1300, function () { lanzar("iglesia"); });
      fuegos.programar(3000, function () { fuegos.simple(tam.w * azar(0.1, 0.3), tam.h * azar(0.12, 0.3)); });
      fuegos.programar(3500, function () { fuegos.simple(tam.w * azar(0.7, 0.9), tam.h * azar(0.12, 0.3)); });
      fuegos.programar(4200, function () { fuegos.simple(tam.w * azar(0.35, 0.65), tam.h * azar(0.08, 0.2), "#FFD600"); });
    }

    // Espera a que carguen la foto y las tipografías para medir bien
    var listo = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    listo.then(secuencia);

    // Tocar a San Rafael lanza otro (si no hay uno formándose ya)
    var ultimoToque = 0;
    arco.addEventListener("click", function () {
      if (Date.now() - ultimoToque < 2500) return;
      ultimoToque = Date.now();
      lanzar(Math.random() < 0.5 ? "rafael" : "iglesia");
    });
  }

  /* =========================================================
   * Agradecimientos: una vez, cuando el título llega a la pantalla
   * ======================================================= */

  function initGracias() {
    var seccion = document.querySelector(".programa-gracias");
    var titulo = document.querySelector(".programa-gracias__titulo");
    if (!seccion || !titulo || !("IntersectionObserver" in window)) return;
    var fuegos = null;

    var io = new IntersectionObserver(function (entradas) {
      if (!entradas[0].isIntersecting || seccion.hidden) return;
      io.disconnect();
      fuegos = crearFuegos(seccion);
      var W = fuegos.tamano().w;
      var c = caja(titulo, seccion);
      var texto = document.createRange();
      texto.selectNodeContents(titulo);
      var r = texto.getBoundingClientRect();
      var s = seccion.getBoundingClientRect();
      var izq = r.left - s.left;
      var der = r.right - s.left;
      var medio = c.y + c.h / 2;

      if (W >= 760) {
        // A los lados del título: la iglesia a la izquierda, San Rafael a la derecha
        fuegos.programar(250, function () { fuegos.figura("iglesia", izq - 120, medio, 160); });
        fuegos.programar(900, function () { fuegos.figura("rafael", der + 80, medio, 80); });
      } else {
        // Teléfonos: la iglesia sobre el título
        fuegos.programar(250, function () { fuegos.figura("iglesia", W / 2, c.y - 52, Math.min(W * 0.32, 120)); });
        fuegos.programar(1100, function () { fuegos.simple(W * 0.14, medio, "#FFD600"); });
      }
      fuegos.programar(2400, function () { fuegos.simple(W * azar(0.1, 0.3), medio + azar(-30, 30), "#FFD600"); });
      fuegos.programar(2900, function () { fuegos.simple(W * azar(0.7, 0.9), medio + azar(-30, 30), "#E6007E"); });
    }, { threshold: 0.6 });
    io.observe(titulo);
  }

  initCabecera();
  initGracias();
})();
