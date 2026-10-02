/**
 * Transición entre secciones ("escenas").
 * ---------------------------------------------------------------
 * Al bajar, cada sección se queda fija cuando se llega a su final y
 * la siguiente sube encima como una hoja con bordes curvos. Mientras
 * tanto, la sección de atrás se oscurece (y la portada, además, se aleja).
 *
 * Rendimiento:
 *  - Donde el navegador lo permite (animation-timeline), el oscurecido y
 *    el alejamiento son animaciones CSS ligadas al desplazamiento: corren
 *    fuera del hilo principal y no esperan a JavaScript. En los demás
 *    navegadores, un requestAnimationFrame escribe opacity y transform.
 *  - Durante el desplazamiento no se cambian clases que afecten a toda
 *    una sección: las pausas se deciden con IntersectionObserver.
 *  - Solo se vuelve a medir si cambia el ancho o la altura cambia mucho
 *    (no cuando la barra del navegador móvil aparece o se esconde).
 *
 * Además, los elementos con [data-revelar] aparecen con una animación
 * la primera vez que entran en pantalla (--i define el retraso).
 *
 * Con "reducir movimiento" no se activa nada: el sitio se desplaza
 * de forma normal y todo se ve desde el inicio.
 */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var root = document.documentElement;
  var main = document.getElementById("contenido");
  if (!main) return;

  root.classList.add("escenas");

  /* ---------- Elementos que aparecen al entrar en pantalla ---------- */

  function observarRevelados() {
    var items = document.querySelectorAll("[data-revelar]");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (item) { item.classList.add("is-revelado"); });
      return;
    }
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("is-revelado");
        io.unobserve(entrada.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (item) { io.observe(item); });
  }

  /* ---------- Escenas fijas que se van cubriendo ---------- */

  // Animaciones ligadas al desplazamiento (Chrome/Edge 115+, Safari 26+)
  var conCSS = !!(window.CSS && CSS.supports && CSS.supports("animation-timeline: view()"));
  if (conCSS) root.classList.add("escenas--css");

  var escenas = [];

  function prepararEscenas() {
    escenas = [];
    var secciones = Array.prototype.filter.call(main.children, function (node) {
      return node.tagName === "SECTION" && !node.hidden;
    });
    var nombres = [];

    secciones.forEach(function (seccion, i) {
      var siguiente = secciones[i + 1] || null;
      seccion.classList.add("escena");
      seccion.classList.toggle("escena--fija", !!siguiente);
      if (i > 0) seccion.classList.add("escena--entra");

      // Velo que oscurece la escena cuando la siguiente la cubre
      if (siguiente && !seccion.querySelector(":scope > .escena__velo")) {
        var velo = document.createElement("span");
        velo.className = "escena__velo";
        velo.setAttribute("aria-hidden", "true");
        seccion.appendChild(velo);
      }

      var esPortada = seccion.classList.contains("hero");
      var escena = {
        seccion: seccion,
        siguiente: siguiente,
        velo: seccion.querySelector(":scope > .escena__velo"),
        // Solo la portada (del alto de la pantalla) se encoge al alejarse:
        // transformar secciones muy altas cuesta demasiado al desplazarse
        contenido: esPortada ? seccion.querySelector(".hero__inner") : null,
        inicioSiguiente: 0,
        avance: -1,
        fuera: false,    // fuera de pantalla
        tapada: false,   // la siguiente ya la cubre en buena parte
        pausada: false
      };
      escenas.push(escena);

      // Con CSS: la entrada de la sección siguiente mueve el velo y la portada
      if (conCSS && siguiente) {
        var nombre = "--escena-" + (i + 1);
        nombres.push(nombre);
        siguiente.style.viewTimelineName = nombre;
        if (escena.velo) escena.velo.style.animationTimeline = nombre;
        if (escena.contenido) escena.contenido.style.animationTimeline = nombre;
      }
    });

    // Los nombres deben ser visibles para las secciones hermanas
    if (conCSS) main.style.timelineScope = nombres.join(", ") || "none";
    medir();
  }

  var anchoMedido = 0;
  var altoMedido = 0;

  /**
   * Mide una sola vez (al cargar o cambiar de tamaño), para no leer
   * posiciones del documento en cada cuadro del desplazamiento.
   * - Una sección más alta que la pantalla se fija cuando se ve su final:
   *   top = alto de pantalla - alto de la sección (negativo).
   * - inicioSiguiente: posición natural (sin fijar) de la sección siguiente.
   * Solo escribe estilos que cambiaron, para no forzar trabajo extra.
   */
  function medir() {
    var alto = window.innerHeight;
    anchoMedido = window.innerWidth;
    altoMedido = alto;

    // La última sección + el pie deben llenar la pantalla para cubrir
    // por completo a la anterior al llegar al final de la página
    var ultima = escenas.length > 1 ? escenas[escenas.length - 1].seccion : null;
    var pie = document.querySelector(".site-footer");
    if (ultima) {
      fijarEstilo(ultima, "minHeight", Math.max(0, alto - (pie ? pie.offsetHeight : 0)) + "px");
    }

    var inicio = main.getBoundingClientRect().top + window.scrollY;
    escenas.forEach(function (escena) {
      var altoSeccion = escena.seccion.offsetHeight;
      if (escena.siguiente) {
        fijarEstilo(escena.seccion, "top", Math.min(0, alto - altoSeccion) + "px");
      }
      inicio += altoSeccion;
      escena.inicioSiguiente = inicio;
      escena.avance = -1; // obliga a repintar con las medidas nuevas
    });
    if (!conCSS) actualizar();
  }

  function fijarEstilo(el, prop, valor) {
    if (el.style[prop] !== valor) el.style[prop] = valor;
  }

  /**
   * La barra de direcciones del móvil cambia el alto de la ventana al
   * desplazarse. Volver a medir en ese momento trababa el desplazamiento,
   * así que solo se mide si cambia el ancho o el alto cambia mucho.
   */
  function alCambiarTamano() {
    if (window.innerWidth !== anchoMedido || Math.abs(window.innerHeight - altoMedido) > 160) {
      medir();
    }
  }

  // Varias fotos pueden cargar en el mismo cuadro: se mide una sola vez
  var medicionPendiente = false;
  function medirEnElSiguienteCuadro() {
    if (medicionPendiente) return;
    medicionPendiente = true;
    window.requestAnimationFrame(function () {
      medicionPendiente = false;
      medir();
    });
  }

  function limitar(n) {
    return n < 0 ? 0 : n > 1 ? 1 : n;
  }

  /**
   * Solo sin animation-timeline: en cada cuadro del desplazamiento
   * escribe opacity y transform (nada más).
   */
  function actualizar() {
    pendiente = false;
    var alto = window.innerHeight;
    var y = window.scrollY;
    escenas.forEach(function (escena) {
      if (!escena.siguiente) return;
      var topSiguiente = escena.inicioSiguiente - y;
      // 0: la siguiente aún no aparece · 1: ya cubre toda la pantalla
      var avance = Math.round(limitar(1 - topSiguiente / alto) * 200) / 200;
      if (avance === escena.avance) return;
      escena.avance = avance;
      if (escena.velo) escena.velo.style.opacity = String(avance * 0.85);
      if (escena.contenido) {
        escena.contenido.style.transform = avance > 0
          ? "translate3d(0, " + (-6 * avance) + "vh, 0) scale(" + (1 - 0.1 * avance) + ")"
          : "";
      }
    });
  }

  var pendiente = false;
  function alDesplazar() {
    if (pendiente) return;
    pendiente = true;
    window.requestAnimationFrame(actualizar);
  }

  /**
   * Pausa o reanuda una escena (carrusel y fuegos escuchan "escena:pausa";
   * en CSS solo afecta a la flecha de la portada, no a toda la sección).
   */
  function aplicarPausa(escena) {
    var pausada = escena.fuera || escena.tapada;
    if (pausada === escena.pausada) return;
    escena.pausada = pausada;
    escena.seccion.classList.toggle("is-pausada", pausada);
    escena.seccion.dispatchEvent(new CustomEvent("escena:pausa", { detail: { pausada: pausada } }));
  }

  /**
   * Decide las pausas sin escuchar el desplazamiento:
   * - fuera: la sección no está en pantalla (p. ej. la siguiente, antes de subir).
   * - tapada: el borde superior de la siguiente ya pasó el 75 % de la pantalla.
   */
  function observarPausas() {
    if (!("IntersectionObserver" in window)) return;

    var enPantalla = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        escenas.forEach(function (escena) {
          if (escena.seccion !== entrada.target) return;
          escena.fuera = !entrada.isIntersecting;
          aplicarPausa(escena);
        });
      });
    });

    var cubriendo = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        escenas.forEach(function (escena) {
          if (escena.siguiente !== entrada.target) return;
          escena.tapada = entrada.isIntersecting;
          aplicarPausa(escena);
        });
      });
    }, { rootMargin: "0px 0px -25% 0px" });

    escenas.forEach(function (escena) {
      enPantalla.observe(escena.seccion);
      if (escena.siguiente) cubriendo.observe(escena.siguiente);
    });
  }

  function iniciar() {
    prepararEscenas();
    observarRevelados();
    observarPausas();
    if (!conCSS) window.addEventListener("scroll", alDesplazar, { passive: true });
    window.addEventListener("resize", alCambiarTamano);
    // Las fotos cambian la altura de las secciones al cargar
    window.addEventListener("load", medir);
    if ("ResizeObserver" in window) {
      new ResizeObserver(medirEnElSiguienteCuadro).observe(main);
    }
  }

  iniciar();
})();
