/**
 * Lógica del sitio: portada, cuenta regresiva y secciones.
 * El contenido se lee de window.FERIA_DATA (js/data.js).
 * Los textos se insertan con textContent para evitar inyección de HTML.
 */
(function () {
  "use strict";

  var DATA = window.FERIA_DATA || {};
  // Hora actual; js/programa.js permite simularla con ?simular=
  var ahora = (window.FERIA_PROGRAMA || {}).ahora || Date.now;

  /* =========================================================
   * Utilidades
   * ======================================================= */

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  /** Crea un elemento con clase y texto opcionales. */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function hasText(value) {
    return typeof value === "string" && value.trim() !== "";
  }

  /** Solo acepta enlaces http(s), mailto y tel. */
  function safeUrl(url) {
    if (!hasText(url)) return "";
    var trimmed = url.trim();
    return /^(https?:\/\/|mailto:|tel:)/i.test(trimmed) ? trimmed : "";
  }

  /** "2026-09-20" -> "20 de septiembre de 2026" (sin desfase de zona). */
  function formatDate(iso) {
    var parts = String(iso || "").split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return "";
    var date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString("es-GT", { day: "numeric", month: "long", year: "numeric" });
  }

  /**
   * Crea una imagen que, si falla o no tiene ruta, llama a onFail
   * en lugar de mostrar el ícono de imagen rota.
   */
  function createImage(options, onFail) {
    var img = document.createElement("img");
    img.alt = options.alt || "";
    if (options.width) img.width = options.width;
    if (options.height) img.height = options.height;
    if (options.className) img.className = options.className;
    if (options.lazy) img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", function () { onFail(img); }, { once: true });
    img.src = options.src;
    return img;
  }

  /* =========================================================
   * Textos generales y logo
   * ======================================================= */

  function renderGeneralInfo() {
    var feria = DATA.feria || {};
    document.querySelectorAll("[data-feria]").forEach(function (node) {
      var value = feria[node.getAttribute("data-feria")];
      if (value !== undefined && value !== "") node.textContent = String(value);
    });
  }

  /** Logo de la portada. Si no carga, se muestra el nombre en texto. */
  function renderLogo() {
    var logo = DATA.logo || {};
    var img = $("[data-logo]");
    var fallback = $("[data-hero-fallback]");
    if (!img) return;

    function showFallback() {
      img.remove();
      fallback.hidden = false;
    }

    if (!hasText(logo.ruta)) {
      showFallback();
      return;
    }

    img.addEventListener("error", showFallback, { once: true });
    if (logo.alt) img.alt = logo.alt;
    if (logo.ancho) img.width = logo.ancho;
    if (logo.alto) img.height = logo.alto;
    if (img.getAttribute("src") !== logo.ruta) img.src = logo.ruta;
    // Si ya falló antes de registrar el evento
    if (img.complete && !img.naturalWidth) showFallback();
  }

  /* =========================================================
   * Carrusel de fotos de fondo en la portada
   * Transición suave entre fotos con un acercamiento lento.
   * Con "reducir movimiento" se muestra solo la primera foto, fija.
   * ======================================================= */

  function initSlides() {
    var config = DATA.portada || {};
    var container = $("[data-slides]");
    var fotos = (Array.isArray(config.fotos) ? config.fotos : []).filter(function (f) {
      return f && hasText(f.ruta);
    });
    if (!container || !fotos.length) return;

    var intervalo = Math.max(3000, Number(config.intervalo) || 7000);
    container.style.setProperty("--intervalo", intervalo + "ms");
    var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var slides = fotos.map(function (foto, i) {
      // Decorativas: alt vacío (la sección ya está oculta a lectores de pantalla)
      var img = createImage({ src: foto.ruta, alt: "", className: "hero__slide" }, function (failed) {
        failed.remove();
        slides = slides.filter(function (s) { return s !== failed; });
      });
      if (hasText(foto.encuadre)) img.style.objectPosition = foto.encuadre;
      if (i === 0) {
        img.fetchPriority = "high";
        img.classList.add("is-active");
      }
      container.appendChild(img);
      return img;
    });

    if (quieto || slides.length < 2) return;

    var hero = container.closest(".hero");
    var actual = 0;
    setInterval(function () {
      // En pausa si la portada está fuera de pantalla o cubierta (js/escenas.js)
      if (document.hidden || slides.length < 2) return;
      if (hero && hero.classList.contains("is-pausada")) return;
      slides[actual % slides.length].classList.remove("is-active");
      actual = (actual + 1) % slides.length;
      slides[actual].classList.add("is-active");
    }, intervalo);
  }

  /* =========================================================
   * Cuenta regresiva
   * La fecha incluye el desfase de Guatemala (-06:00), así que el
   * cálculo es correcto sin importar la zona horaria del visitante.
   * ======================================================= */

  function getRemaining(target) {
    var diff = Math.max(0, target - ahora());
    return {
      total: diff,
      dias: Math.floor(diff / 86400000),
      horas: Math.floor((diff / 3600000) % 24),
      minutos: Math.floor((diff / 60000) % 60),
      segundos: Math.floor((diff / 1000) % 60)
    };
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  /**
   * Actualiza los [data-unit] de grid cada segundo hasta llegar a target;
   * entonces llama a onFinish una sola vez.
   */
  function startCountdown(grid, target, onFinish) {
    var nodes = {};
    ["dias", "horas", "minutos", "segundos"].forEach(function (unit) {
      nodes[unit] = grid.querySelector('[data-unit="' + unit + '"]');
    });

    function tick() {
      var r = getRemaining(target);
      if (r.total <= 0) {
        onFinish();
        return; // se detiene: no se programa otra actualización
      }
      nodes.dias.textContent = String(r.dias);
      nodes.horas.textContent = pad(r.horas);
      nodes.minutos.textContent = pad(r.minutos);
      nodes.segundos.textContent = pad(r.segundos);
      // Sincroniza con el siguiente segundo exacto
      setTimeout(tick, 1000 - (ahora() % 1000) + 10);
    }

    tick();
  }

  function initCountdown() {
    var config = DATA.cuentaRegresiva || {};
    var grid = $("[data-countdown]");
    var done = $("[data-countdown-done]");
    var target = new Date(config.fechaObjetivo).getTime();
    if (!grid || isNaN(target)) {
      if (grid) grid.closest(".countdown").hidden = true;
      return;
    }

    startCountdown(grid, target, function () {
      grid.hidden = true;
      $("#titulo-contador").textContent = "¡Llegó el día!";
      done.textContent = config.mensajeFinal || "¡La feria ha comenzado!";
      done.classList.add("is-visible");
      initPortadaFeria();
    });

    // Cuenta compacta de la barra fija; al terminar, la bienvenida
    var barra = $("[data-barra-cuenta]");
    if (barra) {
      startCountdown(barra, target, function () {
        barra.hidden = true;
        $("[data-barra-bienvenida]").hidden = false;
      });
    }
  }

  /* =========================================================
   * Portada durante la feria
   * Al terminar la cuenta regresiva, en días con programa, la portada
   * pasa a dos columnas (una en teléfonos): logo, mensaje y botón a un
   * lado; al otro, las actividades de hoy (js/programa.js).
   * ======================================================= */

  function initPortadaFeria() {
    var P = window.FERIA_PROGRAMA;
    var hero = $(".hero");
    var box = $("[data-hero-hoy]");
    if (!P || !hero || !box) return;

    var titulo = $("[data-hero-hoy-fecha]", box);
    var lista = null;
    var fechaMostrada = null;

    P.cadaMinuto(function () {
      var dia = P.diaDeHoy();
      var fecha = dia ? dia.fecha : "";
      if (fecha !== fechaMostrada) {
        fechaMostrada = fecha;
        if (lista) lista.remove();
        lista = dia ? P.crearAgenda(dia, "h3") : null;
        if (lista) {
          titulo.textContent = P.fechaLarga(dia.fecha);
          box.appendChild(lista);
        }
        box.hidden = !dia;
        hero.classList.toggle("hero--feria", !!dia);
        var boton = $('[data-accion="actividades"]');
        if (boton) boton.href = dia ? "programa.html#hoy" : "programa.html";
      }
      if (lista) P.marcarEstados(lista);
    });
  }

  /* =========================================================
   * Evento destacado: gran concierto con cuenta regresiva propia,
   * grupos (con su país), entradas, video, botones para llegar
   * (Waze / Google Maps) y mapa interactivo de localidades.
   * Si falta el logo o la fecha, la sección no se muestra.
   * ======================================================= */

  // Banderas simplificadas (decorativas: el nombre del país va al lado)
  var PAISES = {
    mx: {
      nombre: "México",
      bandera: '<svg viewBox="0 0 30 20" width="27" height="18" aria-hidden="true" focusable="false">' +
        '<rect width="10" height="20" fill="#006847"/><rect x="10" width="10" height="20" fill="#fff"/>' +
        '<rect x="20" width="10" height="20" fill="#CE1126"/><circle cx="15" cy="10" r="2.8" fill="#8C5A2B"/></svg>'
    },
    gt: {
      nombre: "Guatemala",
      bandera: '<svg viewBox="0 0 30 20" width="27" height="18" aria-hidden="true" focusable="false">' +
        '<rect width="10" height="20" fill="#4997D0"/><rect x="10" width="10" height="20" fill="#fff"/>' +
        '<rect x="20" width="10" height="20" fill="#4997D0"/><circle cx="15" cy="10" r="2.8" fill="#4E8B3A"/></svg>'
    }
  };

  /** Rellena node con bandera + nombre del país; devuelve false si el código no existe. */
  function fillPais(node, codigo) {
    var pais = PAISES[String(codigo || "").toLowerCase()];
    if (!pais) return false;
    var bandera = el("span", "evento-pais__bandera");
    bandera.innerHTML = pais.bandera; // SVG fijo de este archivo, no viene de data.js
    node.appendChild(bandera);
    node.appendChild(el("span", "", pais.nombre));
    return true;
  }

  function createInvitado(item, index) {
    var li = el("li", "evento-invitado");
    li.setAttribute("data-revelar", "pop");
    li.style.setProperty("--i", index + 4);
    var logo = item.logo || {};

    function showName() {
      li.insertBefore(el("span", "evento-invitado__nombre", item.nombre), li.firstChild);
    }

    if (hasText(logo.ruta)) {
      li.appendChild(createImage({
        src: logo.ruta,
        alt: item.nombre,
        width: logo.ancho,
        height: logo.alto,
        className: "evento-invitado__logo",
        lazy: true
      }, function (failed) { failed.remove(); showName(); }));
    } else {
      showName();
    }

    var pais = el("p", "evento-pais evento-pais--chico");
    if (fillPais(pais, item.pais)) li.appendChild(pais);
    return li;
  }

  /**
   * Video promocional: en bucle y sin controles.
   * - Se reproduce solo mientras se ve (y se pausa si sale de pantalla
   *   o la cubre la sección siguiente), así no gasta datos ni batería.
   * - Intenta sonar con audio; los navegadores lo bloquean si la persona
   *   aún no ha tocado la página, y entonces suena silenciado con el
   *   botón "Activar sonido" a la vista.
   * - Tocar el video lo pausa o lo reanuda.
   * - Con "reducir movimiento" o ahorro de datos no arranca solo.
   */
  function initVideoPromo(box, player) {
    var toggle = $("[data-evento-video-toggle]", box);
    var sonido = $("[data-evento-video-sonido]", box);
    var sonidoTexto = $("[data-evento-video-sonido-texto]", sonido);
    var conexion = navigator.connection || {};
    var automatico = !window.matchMedia("(prefers-reduced-motion: reduce)").matches && !conexion.saveData;
    var pausadoPorPersona = false;
    var quiereSonido = true;
    var enPantalla = false;
    var escenaTapada = false;

    function actualizarUI() {
      var pausado = player.paused;
      box.classList.toggle("is-pausado", pausado);
      toggle.setAttribute("aria-label", pausado ? "Reproducir video" : "Pausar video");
      sonidoTexto.textContent = player.muted ? "Activar sonido" : "Silenciar";
      sonido.classList.toggle("is-silenciado", player.muted);
      sonido.hidden = pausado && !player.currentTime;
    }

    function reproducir() {
      player.preload = "auto";
      player.muted = !quiereSonido;
      var intento = player.play();
      if (!intento || !intento.catch) return;
      intento.catch(function (error) {
        if (!error || error.name !== "NotAllowedError" || player.muted) return;
        // Sin permiso para sonar todavía: arranca silenciado
        player.muted = true;
        player.play().catch(function () { actualizarUI(); });
      });
    }

    function revisar() {
      var visible = enPantalla && !escenaTapada;
      if (visible && automatico && !pausadoPorPersona && player.paused) reproducir();
      else if (!visible && !player.paused) player.pause();
    }

    toggle.addEventListener("click", function () {
      if (player.paused) {
        pausadoPorPersona = false;
        quiereSonido = quiereSonido || !player.currentTime;
        reproducir(); // tras un toque, el navegador ya deja sonar el audio
      } else {
        pausadoPorPersona = true;
        player.pause();
      }
    });

    sonido.addEventListener("click", function () {
      player.muted = !player.muted;
      quiereSonido = !player.muted;
      if (player.paused) {
        pausadoPorPersona = false;
        reproducir();
      }
    });

    ["play", "pause", "volumechange"].forEach(function (evento) {
      player.addEventListener(evento, actualizarUI);
    });
    actualizarUI();

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entradas) {
        enPantalla = entradas[0].isIntersecting;
        revisar();
      }, { threshold: 0.5 }).observe(player);
    }
    // La sección se queda fija y la siguiente la cubre (js/escenas.js)
    box.closest("section").addEventListener("escena:pausa", function (event) {
      escenaTapada = event.detail.pausada;
      revisar();
    });
  }

  /* ---------- Mapa interactivo de localidades ---------- */

  var SVG_NS = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs, text) {
    var node = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs || {}).forEach(function (key) { node.setAttribute(key, attrs[key]); });
    if (text) node.textContent = text;
    return node;
  }

  /**
   * Dibuja el plano del organizador: escenario y bocinas al frente,
   * dos bloques de mesas VIP con un pasillo al centro y, detrás,
   * General 1 y General 2. Medidas en unidades del viewBox (1000 × 700).
   */
  function renderLocalidades(section, data) {
    var config = data.localidades || {};
    var zonas = (Array.isArray(config.zonas) ? config.zonas : []).filter(function (z) {
      return z && hasText(z.id) && hasText(z.nombre);
    });
    var box = $("[data-localidades]", section);
    if (!box || !zonas.length) return;

    var porId = {};
    zonas.forEach(function (z) { porId[z.id] = z; });
    var mapa = $("[data-localidades-mapa]", box);
    var info = $("[data-localidades-info]", box);
    var botones = $("[data-localidades-zonas]", box);

    var svg = svgEl("svg", {
      viewBox: "0 0 1000 700",
      class: "localidades__svg",
      role: "img",
      "aria-label": "Plano del concierto: escenario y bocinas al frente; mesas VIP a ambos lados " +
        "de un pasillo central; detrás, General 1 a la izquierda y General 2 a la derecha."
    });

    // Escenario y bocinas
    svg.appendChild(svgEl("line", { x1: 40, y1: 14, x2: 960, y2: 14, class: "loc-muro" }));
    svg.appendChild(svgEl("rect", { x: 370, y: 24, width: 260, height: 66, rx: 8, class: "loc-escenario" }));
    svg.appendChild(svgEl("text", { x: 500, y: 66, class: "loc-escenario__texto" }, "ESCENARIO"));
    [[215, "Bocina 1"], [715, "Bocina 2"]].forEach(function (b) {
      svg.appendChild(svgEl("rect", { x: b[0], y: 24, width: 70, height: 84, rx: 6, class: "loc-bocina" }));
      svg.appendChild(svgEl("text", { x: b[0] + 35, y: 71, class: "loc-bocina__texto" }, b[1]));
    });

    // Pasillo central
    svg.appendChild(svgEl("text", { x: 500, y: 420, class: "loc-pasillo", transform: "rotate(-90 500 420)" }, "PASILLO"));

    function zonaGrupo(id) {
      var g = svgEl("g", { class: "loc-zona", "data-zona": id });
      svg.appendChild(g);
      return g;
    }

    // Mesas VIP: 8 columnas × 5 filas por lado
    var vip = porId.vip ? zonaGrupo("vip") : null;
    if (vip) {
      [["izquierdo", 40, config.mesasIzquierda], ["derecho", 540, config.mesasDerecha]].forEach(function (lado) {
        var x0 = lado[1];
        vip.appendChild(svgEl("rect", { x: x0, y: 150, width: 420, height: 330, rx: 10, class: "loc-area loc-area--vip" }));
        vip.appendChild(svgEl("text", { x: x0 + 210, y: 138, class: "loc-area__titulo" }, porId.vip.nombre));
        (Array.isArray(lado[2]) ? lado[2] : []).slice(0, 5).forEach(function (fila, f) {
          (Array.isArray(fila) ? fila : []).slice(0, 8).forEach(function (valor, c) {
            var numero = Math.max(0, Math.floor(Number(valor) || 0));
            var x = x0 + 14 + c * 50;
            var y = 162 + f * 63;
            var mesa = svgEl("g", { class: "loc-mesa", "data-mesa": String(numero), "data-lado": lado[0] });
            mesa.appendChild(svgEl("rect", { x: x, y: y, width: 42, height: 52, rx: 5 }));
            if (numero) mesa.appendChild(svgEl("text", { x: x + 21, y: y + 33 }, String(numero)));
            vip.appendChild(mesa);
          });
        });
      });
    }

    // Áreas generales
    [["general1", 40], ["general2", 540]].forEach(function (area) {
      var zona = porId[area[0]];
      if (!zona) return;
      var g = zonaGrupo(area[0]);
      g.appendChild(svgEl("rect", { x: area[1], y: 498, width: 420, height: 180, rx: 10, class: "loc-area loc-area--general" }));
      g.appendChild(svgEl("text", { x: area[1] + 210, y: 600, class: "loc-area__nombre" }, zona.nombre.toUpperCase()));
    });

    mapa.appendChild(svg);
    // En teléfonos el plano es más ancho que la pantalla: se empieza
    // centrado en el escenario y el pasillo (al siguiente cuadro, cuando
    // la sección ya es visible y tiene medidas)
    window.requestAnimationFrame(function () {
      mapa.scrollLeft = (mapa.scrollWidth - mapa.clientWidth) / 2;
    });

    // Un botón por zona (también es la forma de usar el mapa con teclado)
    var botonPorId = {};
    zonas.forEach(function (zona) {
      var boton = el("button", "localidades__zona localidades__zona--" + (zona.id === "vip" ? "vip" : "general"));
      boton.type = "button";
      boton.setAttribute("aria-pressed", "false");
      boton.appendChild(el("span", "localidades__zona-nombre", zona.nombre));
      if (hasText(zona.precio)) boton.appendChild(el("span", "localidades__zona-precio", zona.precio));
      boton.addEventListener("click", function () { seleccionar(zona.id, null); });
      botones.appendChild(boton);
      botonPorId[zona.id] = boton;
    });

    var mesaElegida = null;

    function seleccionar(id, mesa) {
      var zona = porId[id];
      if (!zona) return;
      mapa.classList.add("has-seleccion");
      svg.querySelectorAll("[data-zona]").forEach(function (g) {
        g.classList.toggle("is-activa", g.getAttribute("data-zona") === id);
      });
      Object.keys(botonPorId).forEach(function (key) {
        botonPorId[key].setAttribute("aria-pressed", String(key === id));
      });
      if (mesaElegida) mesaElegida.classList.remove("is-elegida");
      mesaElegida = mesa;
      if (mesa) mesa.classList.add("is-elegida");

      info.textContent = "";
      var titulo = zona.nombre;
      if (mesa) {
        var numero = mesa.getAttribute("data-mesa");
        titulo += " · " + (numero !== "0" ? "Mesa " + numero : "Mesa sin número") +
          " (lado " + mesa.getAttribute("data-lado") + ")";
      }
      var cabecera = el("p", "localidades__info-titulo", titulo);
      if (hasText(zona.precio)) cabecera.appendChild(el("span", "localidades__info-precio", zona.precio));
      info.appendChild(cabecera);
      if (hasText(zona.descripcion)) info.appendChild(el("p", "localidades__info-texto", zona.descripcion));
    }

    // Toques en el mapa: una mesa o una zona
    svg.addEventListener("click", function (event) {
      var mesa = event.target.closest(".loc-mesa");
      var zona = event.target.closest("[data-zona]");
      if (zona) seleccionar(zona.getAttribute("data-zona"), mesa);
    });

    box.hidden = false;
  }

  function renderEvento() {
    var section = $("#evento");
    var data = DATA.evento || {};
    var logo = data.logo || {};
    var target = new Date(data.fecha).getTime();
    if (!section || (DATA.secciones || {}).evento === false) return;
    if (!hasText(logo.ruta) || isNaN(target)) {
      section.setAttribute("data-vacia", ""); // applySectionVisibility la oculta
      return;
    }

    section.querySelectorAll("[data-evento-campo]").forEach(function (node) {
      var value = data[node.getAttribute("data-evento-campo")];
      if (hasText(value)) node.textContent = value;
      else node.remove();
    });

    // Logo del grupo (es el título de la sección); si falla, queda el nombre en texto
    var img = $("[data-evento-logo]", section);
    img.alt = logo.alt || "";
    if (logo.ancho) img.width = logo.ancho;
    if (logo.alto) img.height = logo.alto;
    img.addEventListener("error", function () {
      img.replaceWith(el("span", "evento-header__nombre", logo.alt || ""));
    }, { once: true });
    img.src = logo.ruta;

    var paisPrincipal = $("[data-evento-pais]", section);
    paisPrincipal.hidden = !fillPais(paisPrincipal, data.pais);

    // Grupos invitados: logo + país
    var invitados = (Array.isArray(data.invitados) ? data.invitados : []).filter(function (item) {
      return item && hasText(item.nombre);
    });
    if (invitados.length) {
      var lista = $("[data-evento-invitados-lista]", section);
      invitados.forEach(function (item, i) { lista.appendChild(createInvitado(item, i)); });
      $("[data-evento-invitados]", section).hidden = false;
    }

    var fecha = $("[data-evento-fecha]", section);
    fecha.dateTime = data.fecha;
    fecha.textContent = hasText(data.fechaTexto) ? data.fechaTexto : formatDate(data.fecha.slice(0, 10));

    // Cuenta regresiva
    var reloj = $("[data-evento-reloj]", section);
    var grid = $("[data-evento-reloj-grid]", reloj);
    reloj.hidden = false;
    startCountdown(grid, target, function () {
      grid.hidden = true;
      var fin = $("[data-evento-reloj-fin]", reloj);
      fin.textContent = data.mensajeFinal || "¡Hoy es el gran concierto!";
      fin.classList.add("is-visible");
    });

    // Entradas y puntos de venta
    var entradas = (Array.isArray(data.entradas) ? data.entradas : []).filter(function (e) {
      return e && hasText(e.nombre) && hasText(e.precio);
    });
    var puntos = (Array.isArray(data.puntosVenta) ? data.puntosVenta : []).filter(hasText);
    if (entradas.length) {
      var listaEntradas = $("[data-evento-entradas]", section);
      entradas.forEach(function (entrada, i) {
        var li = el("li", "evento-entrada" + (entrada.destacada ? " evento-entrada--destacada" : ""));
        li.setAttribute("data-revelar", "pop");
        li.style.setProperty("--i", i + 1);
        li.appendChild(el("span", "evento-entrada__nombre", entrada.nombre));
        li.appendChild(el("span", "evento-entrada__precio", entrada.precio));
        listaEntradas.appendChild(li);
      });
      if (puntos.length) {
        var venta = $("[data-evento-venta]", section);
        puntos.forEach(function (punto) { venta.appendChild(el("li", "", punto)); });
        $("[data-evento-venta-box]", section).hidden = false;
      }
      $("[data-evento-entradas-box]", section).hidden = false;
    }

    // Video: preload="none"; solo se descarga cuando llega a la pantalla
    var video = data.video || {};
    if (hasText(video.ruta)) {
      var videoBox = $("[data-evento-video-box]", section);
      var player = $("[data-evento-video]", videoBox);
      if (hasText(video.portada)) player.poster = video.portada;
      if (hasText(video.titulo)) {
        player.setAttribute("aria-label", video.titulo);
        $("[data-evento-video-titulo]", videoBox).textContent = video.titulo;
      }
      var source = document.createElement("source");
      source.src = video.ruta;
      source.type = "video/mp4";
      player.appendChild(source);
      videoBox.hidden = false;
      initVideoPromo(videoBox, player);
    }

    // Botones para llegar (abren la app si está instalada)
    var ubicacion = data.ubicacion || {};
    var lat = Number(ubicacion.lat);
    var lng = Number(ubicacion.lng);
    if (ubicacion.lat && ubicacion.lng && isFinite(lat) && isFinite(lng)) {
      var punto = lat + "," + lng;
      var lugar = [data.lugar, data.lugarDetalle].filter(hasText).join(", ");
      var waze = $("[data-evento-waze]", section);
      var maps = $("[data-evento-maps]", section);
      waze.href = "https://waze.com/ul?ll=" + punto + "&navigate=yes";
      maps.href = "https://www.google.com/maps/dir/?api=1&destination=" + punto;
      waze.setAttribute("aria-label", "Cómo llegar a " + lugar + " con Waze (se abre en una pestaña nueva)");
      maps.setAttribute("aria-label", "Cómo llegar a " + lugar + " con Google Maps (se abre en una pestaña nueva)");
      $("[data-evento-rutas]", section).hidden = false;
    }

    renderLocalidades(section, data);
  }

  /* =========================================================
   * Noticias del COCODE: publicaciones de su página de Facebook
   * con el plugin de página de Meta (iframe, sin el SDK de Facebook).
   * Se carga solo al acercarse a la pantalla. Sin URL, no se muestra.
   * ======================================================= */

  function renderCocode() {
    var section = $("#noticias");
    var data = DATA.cocode || {};
    var url = safeUrl(data.url);
    if (!section) return;
    if (!url) {
      section.setAttribute("data-vacia", ""); // applySectionVisibility la oculta
      return;
    }

    var texto = $("[data-cocode-texto]", section);
    if (hasText(data.texto)) texto.textContent = data.texto;
    else texto.remove();
    var enlace = $("[data-cocode-enlace]", section);
    enlace.href = url;
    enlace.setAttribute("aria-label", "Ver la página de " + (data.nombre || "COCODE") + " en Facebook (se abre en una pestaña nueva)");

    var marco = $("[data-cocode-marco]", section);
    function cargar() {
      // El plugin acepta de 180 a 500 px de ancho
      var ancho = Math.max(180, Math.min(500, Math.floor(marco.clientWidth)));
      var alto = window.innerWidth < 640 ? 620 : 720;
      var iframe = document.createElement("iframe");
      iframe.className = "cocode__iframe";
      iframe.title = "Publicaciones de " + (data.nombre || "COCODE") + " en Facebook";
      iframe.width = ancho;
      iframe.height = alto;
      iframe.loading = "lazy";
      iframe.setAttribute("scrolling", "no");
      iframe.setAttribute("allow", "clipboard-write; encrypted-media; picture-in-picture; web-share");
      iframe.src = "https://www.facebook.com/plugins/page.php?href=" + encodeURIComponent(url) +
        "&tabs=timeline&width=" + ancho + "&height=" + alto +
        "&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false";
      marco.style.setProperty("--alto", alto + "px");
      marco.appendChild(iframe);
      marco.classList.add("is-cargado");
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entradas) {
        if (!entradas[0].isIntersecting) return;
        io.disconnect();
        cargar();
      }, { rootMargin: "400px 0px" });
      io.observe(marco);
    } else {
      cargar();
    }
  }


  /* =========================================================
   * Flores de la Feria: agradecimiento a la municipalidad
   * ======================================================= */

  function renderApoyo() {
    var data = DATA.agradecimiento || {};
    var box = $("[data-apoyo]");
    if (!box || (!hasText(data.nombre) && !hasText(data.lugar))) return;

    box.querySelectorAll("[data-apoyo-campo]").forEach(function (node) {
      var value = data[node.getAttribute("data-apoyo-campo")];
      if (hasText(value)) node.textContent = value;
      else node.remove();
    });

    var img = $("[data-apoyo-logo]", box);
    var marco = img.parentNode;
    if (hasText(data.logo)) {
      img.alt = data.logoAlt || "";
      img.addEventListener("error", function () { marco.remove(); }, { once: true });
      img.src = data.logo;
    } else {
      marco.remove();
    }
    box.hidden = false;
  }

  /* =========================================================
   * Patrocinadores
   * ======================================================= */

  function createSponsorItem(item, index) {
    var li = el("li", "sponsor");
    li.setAttribute("data-revelar", "pop");
    li.style.setProperty("--i", index % 4);
    var url = safeUrl(item.url);
    var wrapper = url ? el("a", "sponsor__box") : el("div", "sponsor__box");

    if (url) {
      wrapper.href = url;
      wrapper.target = "_blank";
      wrapper.rel = "noopener noreferrer";
      wrapper.setAttribute("aria-label", item.nombre + " (se abre en una pestaña nueva)");
    }

    // Color de la tarjeta (solo se acepta un color hexadecimal)
    if (/^#[0-9a-f]{3,8}$/i.test(String(item.fondo || "").trim())) {
      wrapper.style.setProperty("--marca", item.fondo.trim());
    }

    // El nombre va debajo, así que el logo es decorativo para lectores de pantalla
    var img = createImage({
      src: item.logo,
      alt: "",
      width: 320,
      height: 240,
      className: "sponsor__logo",
      lazy: true
    }, function (failed) {
      // Si el logo no carga, queda la tarjeta con el nombre debajo
      failed.remove();
    });

    wrapper.appendChild(img);
    li.appendChild(wrapper);
    li.appendChild(el("p", "sponsor__caption", item.nombre));
    return li;
  }

  function renderPatrocinadores() {
    var grid = $("[data-patrocinadores]");
    var list = Array.isArray(DATA.patrocinadores) ? DATA.patrocinadores : [];
    var items = list
      .filter(function (item) { return item && hasText(item.nombre) && hasText(item.logo); })
      .sort(function (a, b) { return (a.orden || 0) - (b.orden || 0); });

    $("[data-patrocinadores-empty]").hidden = items.length > 0;
    grid.hidden = items.length === 0;
    items.forEach(function (item, i) { grid.appendChild(createSponsorItem(item, i)); });
  }

  /* =========================================================
   * Invitación a patrocinar (franja con botón a WhatsApp)
   * El enlace del botón lo pone js/pie.js, igual que el del pie.
   * ======================================================= */

  function renderPatrocinar() {
    var box = $("[data-patrocinar]");
    var data = DATA.patrocinar || {};
    var boton = box && $("[data-patrocinar-boton]", box);
    if (!box || !boton || !boton.href) return; // sin número de WhatsApp

    box.querySelectorAll("[data-patrocinar-campo]").forEach(function (campo) {
      var texto = data[campo.getAttribute("data-patrocinar-campo")];
      campo.textContent = hasText(texto) ? texto : "";
      campo.hidden = !hasText(texto);
    });
    box.hidden = false;
  }

  /* =========================================================
   * Secciones visibles
   * Oculta las secciones desactivadas en DATA.secciones y apunta
   * el indicador "Desliza" a la primera sección visible.
   * ======================================================= */

  function applySectionVisibility() {
    var config = DATA.secciones || {};
    var first = null;
    ["evento", "noticias", "flores", "patrocinadores"].forEach(function (id) {
      var section = document.getElementById(id);
      if (!section) return;
      section.hidden = config[id] === false || section.hasAttribute("data-vacia");
      if (!section.hidden && !first) first = section;
    });

    var hint = $(".scroll-hint");
    if (!hint) return;
    if (!first) {
      hint.hidden = true;
      return;
    }
    hint.href = "#" + first.id;
    var title = first.querySelector(".section__title");
    var label = $(".sr-only", hint);
    if (!label) return;
    if (first.hasAttribute("data-hint")) label.textContent = first.getAttribute("data-hint");
    else if (title) label.textContent = "hacia " + title.textContent;
  }

  /* =========================================================
   * Enlace directo a una sección: barrancocoloradofest.com/#reinas o /#concierto
   * Las secciones quedan fijas al desplazarse (js/escenas.js) y el
   * salto nativo del navegador no cae bien, así que se calcula aquí.
   * "#reinas", "#concierto" y "#baile" (enlace anterior) no son ids:
   * el navegador no salta por su cuenta.
   * ======================================================= */

  var ENLACES = { "#reinas": "flores", "#concierto": "evento", "#baile": "evento" };

  function initEnlaceDirecto() {
    // El carrusel de actividades se quitó: su enlace lleva al programa
    if (/^#(actividades|programa)$/i.test(location.hash)) {
      location.replace("programa.html");
      return;
    }
    var id = ENLACES[decodeURIComponent(location.hash).toLowerCase()];
    var section = id && document.getElementById(id);
    if (!section || section.hidden) return;

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    var destino = 0;
    function ir() {
      destino = Math.round(section.getBoundingClientRect().top + window.scrollY);
      window.scrollTo({ top: destino, behavior: "instant" }); // sin el desplazamiento suave del CSS
    }
    ir();

    // Fotos y tipografías pueden mover la sección: se corrige al terminar
    // de cargar, salvo que la persona ya se haya desplazado
    window.addEventListener("load", function () {
      var listo = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      listo.then(function () {
        if (Math.abs(window.scrollY - destino) < 4) ir();
      });
    }, { once: true });
  }

  /* =========================================================
   * Inicio
   * ======================================================= */

  function init() {
    renderGeneralInfo();
    renderLogo();
    initSlides();
    initCountdown();
    renderEvento();
    applySectionVisibility();
    renderCocode();
    renderApoyo();
    renderPatrocinadores();
    renderPatrocinar();
    initEnlaceDirecto();
    initBarraSitio();
  }

  /**
   * Barra fija con el logo y el botón al programa: aparece cuando la
   * portada sale de la pantalla (IntersectionObserver, sin escuchar el
   * desplazamiento) y se esconde al volver arriba.
   */
  function initBarraSitio() {
    var barra = $("[data-barra-sitio]");
    var marca = $("[data-portada-sentinela]");
    if (!barra) return;
    if (!marca || !("IntersectionObserver" in window)) {
      barra.classList.add("is-visible");
      return;
    }
    new IntersectionObserver(function (entradas) {
      barra.classList.toggle("is-visible", !entradas[0].isIntersecting);
    }).observe(marca);

    // El logo vuelve arriba (las escenas fijas confunden el salto nativo)
    $(".barra-sitio__logo", barra).addEventListener("click", function (event) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  init();
})();
