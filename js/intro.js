/**
 * Presentación de la portada con fuegos artificiales.
 *  1. Un cohete estalla y sus chispas dibujan a San Rafael Arcángel.
 *  2. San Rafael explota; otro cohete forma, en grande, la iglesia de
 *     Barranco Colorado (la misma del logo).
 *  3. La iglesia explota y en el destello aparece el logo; después, el contador.
 *  4. Unos segundos más de fuegos detrás del logo y el lienzo se apaga
 *     (no sigue en bucle, para cuidar el rendimiento y la batería).
 * Tocar la pantalla o presionar una tecla salta la introducción.
 * Con "reducir movimiento" activado se muestra todo sin animación.
 */
(function () {
  "use strict";

  var root = document.documentElement;
  var hero = document.querySelector(".hero");
  var canvas = document.querySelector("[data-fireworks]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealed = false;

  // El seguro de index.html ya no hace falta: este archivo controla la revelación
  clearTimeout(window.__introFailsafe);

  /** Muestra el logo y el contador (una sola vez). */
  function reveal() {
    if (revealed) return;
    revealed = true;
    root.classList.remove("intro");
    if (hero) hero.classList.add("is-revealed");
  }

  var FIGURAS_FERIA = window.FERIA_FIGURAS;

  if (!hero || !canvas || !canvas.getContext || reduceMotion || !FIGURAS_FERIA) {
    reveal();
    return;
  }

  /* =========================================================
   * Configuración
   * ======================================================= */

  var TIEMPO = {
    subida: 900,     // cohete inicial
    formacion: 1600, // chispas viajando hasta formar cada figura
    pausa: 1400,     // figura completa, titilando
    logo: 450,       // espera tras la explosión final antes de mostrar el logo
    cola: 4000       // fuegos detrás del logo antes de apagar el lienzo
  };
  var COLORES = ["#FFD600", "#00BCEB", "#E6007E", "#FF7900", "#3CC32F", "#FFFFFF", "#4D8DFF", "#E8322B"];
  var GRAVEDAD = 70;       // px/s²
  var MAX_CHISPAS = 4500;  // límite para cuidar el rendimiento

  var IGLESIA_PROPORCION = 140 / 200; // alto / ancho del dibujo

  var ctx = canvas.getContext("2d");
  var dpr = 1;
  var W = 0;
  var H = 0;

  var estado = {
    fase: "subida",  // subida → formacion → (siguiente figura…) → bucle → fin
    t: 0,            // ms transcurridos (se pausa si la pestaña está oculta)
    figura: 0,       // índice en FIGURAS
    finFormacion: 0,
    revelarEn: -1,
    proximoCohete: 0,
    finBucle: 0,
    cohetes: [],
    forma: [],       // chispas que dibujan la figura actual
    chispas: []      // chispas libres con física
  };

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

  function ajustarTamano() {
    var rect = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width;
    H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Dibujos de San Rafael y de la iglesia (js/figuras.js)
  var dibujarIglesia = FIGURAS_FERIA.iglesia.dibujar;
  var dibujarRafael = FIGURAS_FERIA.rafael.dibujar;

  /** Centro de la portada donde estará el logo. */
  function centroLogo() {
    var logo = document.querySelector(".hero__logo");
    var heroRect = hero.getBoundingClientRect();
    if (logo && logo.getBoundingClientRect().width) {
      var r = logo.getBoundingClientRect();
      return { x: r.left - heroRect.left + r.width / 2, y: r.top - heroRect.top + r.height / 2 };
    }
    return { x: W / 2, y: H * 0.42 };
  }

  /**
   * Caja centrada donde estará el logo, pero sin salirse de la pantalla:
   * deja un margen arriba y abajo.
   */
  function cajaCentrada(ancho, alto) {
    var centro = centroLogo();
    var margen = H * 0.05;
    var y = Math.min(Math.max(centro.y - alto / 2, margen), H - margen - alto);
    return { x: centro.x - ancho / 2, y: y, w: ancho, h: alto };
  }

  /** San Rafael, centrado donde estará el logo. */
  function cajaRafael() {
    var alto = Math.min(H * 0.66, 560);
    return cajaCentrada(alto * 0.6, alto);
  }

  /**
   * Iglesia en grande, centrada donde aparecerá el logo:
   * hasta 90 % del ancho de la pantalla y 60 % de su alto.
   */
  function cajaIglesia() {
    var ancho = Math.min(W * 0.9, (H * 0.6) / IGLESIA_PROPORCION, 820);
    return cajaCentrada(ancho, ancho * IGLESIA_PROPORCION);
  }

  /**
   * Figuras que forman los fuegos artificiales, en orden.
   * ancho: tamaño del dibujo; relleno: fracción aproximada que ocupa.
   */
  var FIGURAS = [
    { dibujar: dibujarRafael, ancho: 120, relleno: 0.45, chispas: 1300, caja: cajaRafael },
    { dibujar: dibujarIglesia, ancho: 200, relleno: 0.55, chispas: 2200, caja: cajaIglesia }
  ];

  /** Convierte el dibujo de una figura en puntos con su color. */
  function puntosFigura(figura, caja) {
    var paso = Math.max(3, Math.sqrt((figura.relleno * caja.w * caja.h) / figura.chispas));
    var escala = caja.w / figura.ancho;
    var lienzo = document.createElement("canvas");
    lienzo.width = Math.ceil(caja.w);
    lienzo.height = Math.ceil(caja.h);
    var c = lienzo.getContext("2d");
    c.scale(escala, escala);
    figura.dibujar(c, Math.max(1.6, (paso * 1.1) / escala));

    var datos = c.getImageData(0, 0, lienzo.width, lienzo.height).data;
    var puntos = [];
    for (var y = 0; y < lienzo.height; y += paso) {
      for (var x = 0; x < lienzo.width; x += paso) {
        var i = (Math.floor(y) * lienzo.width + Math.floor(x)) * 4;
        if (datos[i + 3] < 128) continue;
        puntos.push({
          x: caja.x + x + azar(-0.25, 0.25) * paso,
          y: caja.y + y + azar(-0.25, 0.25) * paso,
          color: "rgb(" + datos[i] + "," + datos[i + 1] + "," + datos[i + 2] + ")"
        });
      }
    }
    return { puntos: puntos, tamano: Math.max(1.3, paso * 0.42) };
  }

  /* =========================================================
   * Cohetes y chispas
   * ======================================================= */

  function lanzarCohete(desdeX, hastaX, hastaY, duracion, alEstallar) {
    estado.cohetes.push({
      sx: desdeX, sy: H + 10, tx: hastaX, ty: hastaY,
      edad: 0, dur: duracion, alEstallar: alEstallar
    });
  }

  function agregarChispa(x, y, vx, vy, color, vida, tamano) {
    if (estado.chispas.length >= MAX_CHISPAS) return;
    estado.chispas.push({ x: x, y: y, vx: vx, vy: vy, color: color, vida: vida, edad: 0, tamano: tamano });
  }

  /**
   * Estallido esférico, con algo de brillo blanco/dorado.
   * opciones: color2 (mitad de las chispas en otro color), grande (chispas
   * más gruesas y duraderas).
   */
  function estallido(x, y, cantidad, velocidad, color, opciones) {
    var op = opciones || {};
    var vida = op.grande ? [1.5, 2.3] : [1.1, 1.7];
    var tamano = op.grande ? [1.9, 2.9] : [1.4, 2.2];
    for (var i = 0; i < cantidad; i++) {
      var ang = (i / cantidad) * Math.PI * 2 + azar(-0.05, 0.05);
      var v = velocidad * azar(0.55, 1);
      var tono = Math.random() < 0.18
        ? elegir(["#FFFFFF", "#FFE680"])
        : (op.color2 && i % 2 ? op.color2 : color);
      agregarChispa(x, y, Math.cos(ang) * v, Math.sin(ang) * v, tono,
        azar(vida[0], vida[1]), azar(tamano[0], tamano[1]));
    }
  }

  /** Fuego artificial aleatorio del bucle, sobre todo a los lados del logo. */
  function fuegoAleatorio() {
    var lado = Math.random() < 0.8;
    var x = lado
      ? (Math.random() < 0.5 ? azar(0.05, 0.3) : azar(0.7, 0.95)) * W
      : azar(0.3, 0.7) * W;
    var y = azar(0.1, 0.5) * H;
    var pequeno = W < 600;
    lanzarCohete(x + azar(-40, 40), x, y, azar(700, 1100), function (ex, ey) {
      estallido(ex, ey,
        pequeno ? Math.round(azar(70, 95)) : Math.round(azar(120, 170)),
        Math.min(W, H) * azar(0.34, 0.5),
        elegir(COLORES),
        { grande: true, color2: Math.random() < 0.4 ? elegir(COLORES) : null });
    });
  }

  /* =========================================================
   * Fases de la presentación
   * ======================================================= */

  function centroDe(caja) {
    return { x: caja.x + caja.w / 2, y: caja.y + caja.h / 2 };
  }

  /** Lanza el cohete que dibujará la figura indicada. */
  function lanzarFigura(indice) {
    var centro = centroDe(FIGURAS[indice].caja());
    estado.figura = indice;
    estado.fase = "subida";
    lanzarCohete(centro.x, centro.x, centro.y, TIEMPO.subida, formarFigura);
  }

  function formarFigura(bx, by) {
    var figura = FIGURAS[estado.figura];
    var caja = figura.caja();
    var resultado = puntosFigura(figura, caja);
    var radio = Math.max(caja.w, caja.h) * 0.55;

    estado.forma = resultado.puntos.map(function (p) {
      var ang = azar(0, Math.PI * 2);
      return {
        sx: bx, sy: by,
        // Punto de control: primero se abren como explosión y luego se acomodan
        cx: bx + Math.cos(ang) * radio * azar(0.5, 1.1),
        cy: by + Math.sin(ang) * radio * azar(0.5, 1.1),
        tx: p.x, ty: p.y,
        x: bx, y: by,
        color: p.color,
        tamano: resultado.tamano,
        retraso: azar(0, 220),
        dur: azar(TIEMPO.formacion - 500, TIEMPO.formacion - 100),
        edad: 0,
        fase: azar(0, Math.PI * 2)
      };
    });

    estallido(bx, by, 50, caja.w * 0.9, "#FFE680");
    estado.fase = "formacion";
    estado.finFormacion = estado.t + TIEMPO.formacion + TIEMPO.pausa;
  }

  /** Las chispas de la figura salen disparadas desde su centro. */
  function dispersarForma(centro, velMin, velMax) {
    estado.forma.forEach(function (p) {
      var dx = p.x - centro.x;
      var dy = p.y - centro.y;
      var d = Math.sqrt(dx * dx + dy * dy) || 1;
      var v = azar(velMin, velMax);
      agregarChispa(p.x, p.y, (dx / d) * v + azar(-30, 30), (dy / d) * v + azar(-30, 30),
        p.color, azar(0.9, 1.7), p.tamano);
    });
    estado.forma = [];
  }

  /** La figura actual explota y sube el cohete de la siguiente. */
  function siguienteFigura() {
    var centro = centroDe(FIGURAS[estado.figura].caja());
    dispersarForma(centro, 180, 460);
    estallido(centro.x, centro.y, W < 600 ? 50 : 90, Math.min(W, H) * 0.45, "#FFD600");
    lanzarFigura(estado.figura + 1);
  }

  /** La última figura (la iglesia) explota y aparece el logo. */
  function explosionFinal() {
    if (estado.fase === "bucle" || estado.fase === "fin") return;
    var centro = centroDe(cajaIglesia());

    dispersarForma(centro, 260, 650);
    estado.cohetes = [];

    // Anillos de colores del logo
    ["#FFD600", "#E6007E", "#00BCEB"].forEach(function (color, i) {
      estallido(centro.x, centro.y, W < 600 ? 60 : 110, Math.min(W, H) * (0.6 + i * 0.18), color);
    });

    // Primero el destello y las chispas; el logo aparece un instante después
    hero.classList.add("is-boom");
    estado.revelarEn = estado.t + TIEMPO.logo;
    estado.fase = "bucle";
    estado.proximoCohete = estado.t + 700;
    estado.finBucle = estado.t + TIEMPO.cola;
  }

  /** Termina la presentación: limpia y oculta el lienzo para siempre. */
  function terminar() {
    estado.fase = "fin";
    detener();
    estado.cohetes = [];
    estado.forma = [];
    estado.chispas = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.hidden = true;
  }

  /** Salta la introducción (clic, toque o tecla): va directo a la explosión final. */
  function saltar() {
    explosionFinal();
  }

  /* =========================================================
   * Bucle de animación
   * ======================================================= */

  function actualizarCohetes(dt) {
    for (var i = estado.cohetes.length - 1; i >= 0; i--) {
      var c = estado.cohetes[i];
      c.edad += dt * 1000;
      var k = easeOutCubic(Math.min(1, c.edad / c.dur));
      var x = c.sx + (c.tx - c.sx) * k;
      var y = c.sy + (c.ty - c.sy) * k;

      // Cabeza brillante y estela
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#FFF3C4";
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
      agregarChispa(x, y, azar(-12, 12), azar(10, 40), "#FFB347", azar(0.3, 0.6), 1.3);

      if (c.edad >= c.dur) {
        estado.cohetes.splice(i, 1);
        c.alEstallar(c.tx, c.ty);
      }
    }
  }

  function actualizarForma(dt) {
    // Modo normal (no aditivo): si no, al redibujar cada cuadro el color se
    // acumula y toda la figura termina blanca.
    ctx.globalCompositeOperation = "source-over";
    estado.forma.forEach(function (p) {
      p.edad += dt * 1000;
      var k = Math.max(0, Math.min(1, (p.edad - p.retraso) / p.dur));
      var e = easeInOutCubic(k);
      var u = 1 - e;
      // Curva cuadrática: origen → control → destino
      p.x = u * u * p.sx + 2 * u * e * p.cx + e * e * p.tx;
      p.y = u * u * p.sy + 2 * u * e * p.cy + e * e * p.ty;

      var titileo = k >= 1 ? 0.7 + 0.3 * Math.sin(estado.t * 0.012 + p.fase) : 1;
      ctx.globalAlpha = titileo;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.tamano * (k < 1 ? 1.25 : 1), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalCompositeOperation = "lighter";
  }

  function actualizarChispas(dt) {
    var freno = Math.pow(0.25, dt); // resistencia del aire
    for (var i = estado.chispas.length - 1; i >= 0; i--) {
      var s = estado.chispas[i];
      s.edad += dt;
      if (s.edad >= s.vida) {
        estado.chispas.splice(i, 1);
        continue;
      }
      s.vx *= freno;
      s.vy = s.vy * freno + GRAVEDAD * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      var vida = 1 - s.edad / s.vida;
      ctx.globalAlpha = vida * vida;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.tamano, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function avanzarFases() {
    if (estado.fase === "formacion" && estado.t >= estado.finFormacion) {
      if (estado.figura < FIGURAS.length - 1) siguienteFigura();
      else explosionFinal();
    }
    if (estado.revelarEn >= 0 && estado.t >= estado.revelarEn) {
      estado.revelarEn = -1;
      reveal();
    }
    if (estado.fase === "bucle") {
      if (estado.t < estado.finBucle) {
        if (estado.t >= estado.proximoCohete) {
          fuegoAleatorio();
          if (Math.random() < 0.4) fuegoAleatorio();
          estado.proximoCohete = estado.t + azar(380, 780);
        }
      } else if (estado.revelarEn < 0 &&
                 ((!estado.cohetes.length && !estado.chispas.length) || estado.t >= estado.finBucle + 3000)) {
        // Se apaga cuando caen las últimas chispas
        terminar();
      }
    }
  }

  var ultimo = 0;
  var activo = false;

  function cuadro(ahora) {
    if (!activo) return;
    var dt = Math.min(0.05, (ahora - (ultimo || ahora)) / 1000);
    ultimo = ahora;
    estado.t += dt * 1000;

    // Desvanece el cuadro anterior para dejar estelas (conserva la transparencia)
    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(0, 0, 0, 0.26)";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    actualizarCohetes(dt);
    actualizarForma(dt);
    actualizarChispas(dt);
    avanzarFases();

    if (activo) requestAnimationFrame(cuadro);
  }

  function iniciar() {
    if (activo || estado.fase === "fin") return;
    activo = true;
    ultimo = 0;
    requestAnimationFrame(cuadro);
  }

  function detener() {
    activo = false;
  }

  /* =========================================================
   * Arranque
   * ======================================================= */

  ajustarTamano();

  lanzarFigura(0);
  iniciar();

  // Saltar la introducción
  ["pointerdown", "keydown"].forEach(function (evento) {
    window.addEventListener(evento, saltar, { once: true });
  });

  // Al cambiar el ancho (no solo la barra del navegador móvil), se ajusta el lienzo
  var anchoPrevio = W;
  window.addEventListener("resize", function () {
    ajustarTamano();
    if (Math.abs(W - anchoPrevio) > 1) {
      anchoPrevio = W;
      saltar();
    }
  });

  // Pausa cuando la portada no está en pantalla, para ahorrar batería
  var enPantalla = true;
  var tapada = false;
  function revisarPausa() {
    if (enPantalla && !tapada) iniciar();
    else if (estado.fase === "bucle") detener();
  }

  if ("IntersectionObserver" in window) {
    // La portada puede quedar fija debajo de otras secciones (js/escenas.js),
    // así que se observa un marcador que sí se desplaza con la página.
    new IntersectionObserver(function (entradas) {
      enPantalla = entradas[0].isIntersecting;
      revisarPausa();
    }).observe(document.querySelector("[data-portada-sentinela]") || hero);
  }

  // Y en cuanto la sección siguiente empieza a cubrirla (js/escenas.js)
  hero.addEventListener("escena:pausa", function (evento) {
    tapada = evento.detail.pausada;
    revisarPausa();
  });
})();
