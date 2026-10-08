/**
 * Lógica del sitio: portada, cuenta regresiva y secciones.
 * El contenido se lee de window.FERIA_DATA (js/data.js).
 * Los textos se insertan con textContent para evitar inyección de HTML.
 */
(function () {
  "use strict";

  var DATA = window.FERIA_DATA || {};

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
    var diff = Math.max(0, target - Date.now());
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
      setTimeout(tick, 1000 - (Date.now() % 1000) + 10);
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
   * Actividades: adelanto en carrusel (no es el programa oficial)
   * Tarjetas ordenadas por fecha; las de días pasados se ocultan.
   * Tocar un afiche lo abre completo en el visor.
   * ======================================================= */

  var DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  var MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  /** Fecha de hoy en Guatemala, "AAAA-MM-DD" (sin importar la zona del visitante). */
  function hoyEnGuatemala() {
    try {
      return new Date().toLocaleDateString("en-CA", { timeZone: "America/Guatemala" });
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }

  /** "20:00" -> "8:00 p. m." (con espacios que no se cortan). */
  function formatHora(hora) {
    var partes = String(hora || "").split(":").map(Number);
    if (partes.length !== 2 || partes.some(isNaN)) return "";
    var h = partes[0] % 12 || 12;
    var sufijo = partes[0] < 12 ? "a. m." : "p. m.";
    return h + ":" + pad(partes[1]) + " " + sufijo;
  }

  /** Posición natural de una sección (las fijas de escenas.js engañan a getBoundingClientRect). */
  function irASeccion(section, suave) {
    var main = $("#contenido");
    var top = main.getBoundingClientRect().top + window.scrollY;
    Array.prototype.some.call(main.children, function (node) {
      if (node === section) return true;
      if (node.tagName === "SECTION" && !node.hidden) top += node.offsetHeight;
      return false;
    });
    window.scrollTo({ top: Math.round(top), behavior: suave ? "smooth" : "instant" });
  }

  function createActividad(item, index, hoy) {
    var li = el("li", "actividad");
    li.setAttribute("data-revelar", "pop"); // crece en su lugar: no se sale del carrusel
    li.style.setProperty("--i", Math.min(index, 3));
    var partes = item.fecha.split("-").map(Number);
    var dia = new Date(partes[0], partes[1] - 1, partes[2]);

    // Calendario: día de la semana, número y mes
    var fecha = el("time", "actividad__fecha");
    fecha.dateTime = item.fecha + (hasText(item.hora) ? "T" + item.hora : "");
    fecha.appendChild(el("span", "actividad__fecha-dia", item.fecha === hoy ? "Hoy" : DIAS[dia.getDay()]));
    fecha.appendChild(el("span", "actividad__fecha-num", String(partes[2])));
    fecha.appendChild(el("span", "actividad__fecha-mes", MESES[partes[1] - 1]));

    var media;
    if (hasText(item.afiche)) {
      media = el("button", "actividad__media");
      media.type = "button";
      media.setAttribute("aria-label", "Ver afiche completo: " + item.titulo);
      var img = createImage({
        src: item.miniatura || item.afiche,
        alt: "",
        width: 480,
        height: 600,
        className: "actividad__afiche",
        lazy: true
      }, function (failed) {
        failed.remove();
        media.classList.add("actividad__media--sin-afiche");
      });
      if (hasText(item.encuadre)) img.style.objectPosition = item.encuadre;
      media.appendChild(img);
      media.addEventListener("click", function () {
        openViewer(item.afiche, item.alt || item.titulo, item.titulo, media);
      });
    } else {
      // Sin afiche todavía: tarjeta de color
      media = el("div", "actividad__media actividad__media--sin-afiche");
      var nombre = el("span", "actividad__arte-titulo", item.titulo);
      nombre.setAttribute("aria-hidden", "true"); // el título ya está debajo
      media.appendChild(nombre);
      media.appendChild(el("span", "actividad__pronto", "Detalles pronto"));
    }
    media.classList.add("actividad__media--tono-" + (index % 3)); // color si no hay afiche
    media.appendChild(fecha);
    li.appendChild(media);

    var cuerpo = el("div", "actividad__cuerpo");
    cuerpo.appendChild(el("h3", "actividad__titulo", item.titulo));
    var cuando = hasText(item.horaTexto) ? item.horaTexto : formatHora(item.hora);
    var datos = [cuando, item.lugar].filter(hasText);
    cuerpo.appendChild(el("p", "actividad__datos", datos.length ? datos.join(" · ") : "Hora y lugar por confirmar"));
    if (hasText(item.descripcion)) cuerpo.appendChild(el("p", "actividad__texto", item.descripcion));
    li.appendChild(cuerpo);
    return li;
  }

  function renderActividades() {
    var section = $("#actividades");
    var data = DATA.actividades || {};
    if (!section || (DATA.secciones || {}).actividades === false) return;

    var hoy = hoyEnGuatemala();
    var items = (Array.isArray(data.lista) ? data.lista : [])
      .filter(function (item) {
        return item && hasText(item.titulo) && /^\d{4}-\d{2}-\d{2}$/.test(String(item.fecha)) && item.fecha >= hoy;
      })
      .sort(function (a, b) {
        return (a.fecha + (a.hora || "12:00")).localeCompare(b.fecha + (b.hora || "12:00"));
      });
    if (!items.length) {
      section.setAttribute("data-vacia", ""); // applySectionVisibility la oculta
      return;
    }

    var nota = $("[data-actividades-nota]", section);
    if (hasText(data.nota)) nota.textContent = data.nota;
    else nota.remove();
    if (hasText(data.aviso)) {
      $("[data-actividades-aviso-texto]", section).textContent = data.aviso;
      $("[data-actividades-aviso]", section).hidden = false;
    }

    var lista = $("[data-actividades]", section);
    items.forEach(function (item, i) { lista.appendChild(createActividad(item, i, hoy)); });

    // Flechas (solo con ratón): avanzan casi una pantalla de tarjetas
    var flechas = section.querySelectorAll("[data-actividades-flecha]");
    function actualizarFlechas() {
      var max = lista.scrollWidth - lista.clientWidth - 2;
      flechas[0].disabled = lista.scrollLeft <= 2;
      flechas[1].disabled = lista.scrollLeft >= max;
    }
    flechas.forEach(function (flecha) {
      flecha.hidden = false;
      flecha.addEventListener("click", function () {
        var paso = Number(flecha.getAttribute("data-actividades-flecha"));
        lista.scrollBy({ left: paso * lista.clientWidth * 0.85, behavior: "smooth" });
      });
    });
    var pendiente = false;
    lista.addEventListener("scroll", function () {
      if (pendiente) return;
      pendiente = true;
      window.requestAnimationFrame(function () {
        pendiente = false;
        actualizarFlechas();
      });
    }, { passive: true });
    window.requestAnimationFrame(actualizarFlechas);
    window.addEventListener("resize", actualizarFlechas);
  }

  /** Botón "Ver actividades" de la portada. */
  function initBotonActividades() {
    var boton = $('[data-accion="actividades"]');
    var section = $("#actividades");
    if (!boton) return;
    if (!section || section.hidden) {
      boton.hidden = true;
      return;
    }
    boton.addEventListener("click", function () { irASeccion(section, true); });
  }

  /* =========================================================
   * Noticias
   * ======================================================= */

  function getPublishedNews() {
    var list = Array.isArray(DATA.noticias) ? DATA.noticias : [];
    return list
      .filter(function (item) { return item && item.publicado === true && hasText(item.titulo); })
      .sort(function (a, b) {
        return String(b.fechaPublicacion || "").localeCompare(String(a.fechaPublicacion || ""));
      });
  }

  function createNewsCard(item) {
    var card = el("article", "news-card");

    if (hasText(item.imagen)) {
      var figure = el("figure", "news-card__media");
      var button = el("button", "news-card__zoom");
      button.type = "button";
      button.setAttribute("aria-label", "Ampliar imagen: " + item.titulo);

      var img = createImage({
        src: item.imagen,
        alt: item.alt || "",
        width: 800,
        height: 1000,
        lazy: true
      }, function () { figure.remove(); });

      button.appendChild(img);
      button.addEventListener("click", function () {
        openViewer(img.currentSrc || img.src, item.alt || "", item.titulo, button);
      });
      figure.appendChild(button);
      card.appendChild(figure);
    }

    var body = el("div", "news-card__body");
    var dateText = formatDate(item.fechaPublicacion);
    if (dateText) {
      var meta = el("p", "news-card__date", "Publicado el ");
      var time = el("time", "", dateText);
      time.dateTime = item.fechaPublicacion;
      meta.appendChild(time);
      body.appendChild(meta);
    }
    body.appendChild(el("h3", "news-card__title", item.titulo));
    if (hasText(item.descripcion)) body.appendChild(el("p", "news-card__text", item.descripcion));

    card.appendChild(body);
    return card;
  }

  function renderNoticias() {
    var grid = $("[data-noticias]");
    var items = getPublishedNews();
    $("[data-noticias-empty]").hidden = items.length > 0;
    items.forEach(function (item) { grid.appendChild(createNewsCard(item)); });
  }

  /* =========================================================
   * Visor de afiches (dialog nativo: Escape lo cierra)
   * ======================================================= */

  var viewer = { dialog: null, trigger: null };

  function initViewer() {
    var dialog = $("[data-viewer]");
    if (!dialog || typeof dialog.showModal !== "function") return;
    viewer.dialog = dialog;

    $("[data-viewer-close]", dialog).addEventListener("click", function () { dialog.close(); });

    // Clic fuera de la imagen (en el fondo) cierra
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener("close", function () {
      document.body.classList.remove("no-scroll");
      if (viewer.trigger) viewer.trigger.focus();
    });
  }

  function openViewer(src, alt, caption, trigger) {
    if (!viewer.dialog) {
      window.open(src, "_blank", "noopener"); // navegadores sin <dialog>
      return;
    }
    var img = $("[data-viewer-img]", viewer.dialog);
    img.src = src;
    img.alt = alt;
    $("[data-viewer-caption]", viewer.dialog).textContent = caption || "";
    viewer.trigger = trigger;
    document.body.classList.add("no-scroll");
    viewer.dialog.showModal();
    $("[data-viewer-close]", viewer.dialog).focus();
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
   * Flores de la Feria: candidatas
   * Tarjeta con marco dorado y banda fucsia, como en el afiche.
   * ======================================================= */

  var SILUETA = "assets/img/flores/silueta-reina.webp";

  // Corona dorada con joyas fucsia (decorativa), para las ya coronadas
  var CORONA_SVG =
    '<svg viewBox="0 0 120 80" aria-hidden="true" focusable="false">' +
      '<defs><linearGradient id="corona-oro" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#FFE9A3"/><stop offset=".5" stop-color="#FFC93C"/><stop offset="1" stop-color="#C98A0B"/>' +
      '</linearGradient></defs>' +
      '<path d="M10 66 4 22l28 22L60 6l28 38 28-22-6 44Z" fill="url(#corona-oro)" stroke="#8A5A00" stroke-width="2" stroke-linejoin="round"/>' +
      '<rect x="10" y="62" width="100" height="12" rx="3" fill="url(#corona-oro)" stroke="#8A5A00" stroke-width="2"/>' +
      '<circle cx="4" cy="20" r="5" fill="#FF2E9A"/><circle cx="60" cy="6" r="6" fill="#FF2E9A"/><circle cx="116" cy="20" r="5" fill="#FF2E9A"/>' +
      '<circle cx="35" cy="68" r="3.5" fill="#E6007E"/><circle cx="60" cy="68" r="4" fill="#00BCEB"/><circle cx="85" cy="68" r="3.5" fill="#E6007E"/>' +
      '<path d="M60 30 66 44 60 56 54 44Z" fill="#FF2E9A" stroke="#FFE9A3" stroke-width="1.5"/>' +
    '</svg>';

  function createFlorCard(item, index) {
    var card = el("article", "flor-card");
    card.setAttribute("data-revelar", "voltear");
    card.style.setProperty("--i", index);
    var figure = el("figure", "flor-card__media");

    function showPlaceholder() {
      figure.classList.add("is-placeholder");
      figure.appendChild(createImage({ src: SILUETA, alt: "", width: 464, height: 500, lazy: true }, function (failed) {
        failed.remove();
      }));
    }

    if (hasText(item.foto)) {
      // La foto se amplía al tocarla, como los afiches
      var zoom = el("button", "flor-card__zoom");
      zoom.type = "button";
      zoom.setAttribute("aria-label", "Ampliar fotografía de " + item.nombre);
      var img = createImage({
        src: item.foto,
        alt: item.alt || ("Fotografía de " + item.nombre),
        width: 800,
        height: 1200,
        lazy: true
      }, function () { zoom.remove(); showPlaceholder(); });
      if (hasText(item.encuadre)) img.style.objectPosition = item.encuadre;
      zoom.appendChild(img);
      zoom.addEventListener("click", function () {
        openViewer(img.currentSrc || img.src, img.alt, item.nombre, zoom);
      });
      figure.appendChild(zoom);
    } else {
      showPlaceholder();
    }

    card.appendChild(figure);
    if (hasText(item.titulo)) card.appendChild(el("p", "flor-card__sash", item.titulo));

    var body = el("div", "flor-card__body");
    body.appendChild(el("h4", "flor-card__name", item.nombre));
    if (hasText(item.descripcion)) body.appendChild(el("p", "flor-card__text", item.descripcion));
    card.appendChild(body);
    if (!hasText(item.corona)) return card;

    // Ya coronada: corona y título encima de la tarjeta
    var wrap = el("div", "flor-coronada");
    var corona = el("span", "flor-coronada__corona");
    corona.setAttribute("data-revelar", "columpio");
    corona.style.setProperty("--i", index);
    corona.innerHTML = CORONA_SVG;
    var titulo = el("p", "flor-coronada__titulo", item.corona);
    titulo.setAttribute("data-revelar", "escribir");
    titulo.style.setProperty("--i", index + 1);
    card.style.setProperty("--i", index + 2);
    wrap.appendChild(corona);
    wrap.appendChild(titulo);
    wrap.appendChild(card);
    return wrap;
  }

  /** Un título y una cuadrícula por grupo; los grupos sin candidatas no se muestran. */
  function renderFlores() {
    var container = $("[data-flores]");
    var list = Array.isArray(DATA.flores) ? DATA.flores : [];
    var items = list.filter(function (item) {
      return item && item.publicado !== false && hasText(item.nombre);
    });
    var grupos = (Array.isArray(DATA.floresGrupos) ? DATA.floresGrupos : []).filter(function (g) {
      return g && hasText(g.id);
    });
    if (!grupos.length) grupos = [{ id: "", titulo: "" }];
    var ids = grupos.map(function (g) { return g.id; });

    grupos.forEach(function (grupo, index) {
      // Sin grupo (o con uno desconocido): va en el primero
      var miembros = items.filter(function (item) {
        return item.grupo === grupo.id || (index === 0 && ids.indexOf(item.grupo) === -1);
      });
      if (!miembros.length) return;

      var section = el("section", "flores-grupo");
      if (hasText(grupo.titulo)) {
        var title = el("h3", "flores-subtitle", grupo.titulo);
        title.setAttribute("data-revelar", "escribir");
        section.appendChild(title);
      }
      var grid = el("div", "flores-grid");
      miembros.forEach(function (item, i) { grid.appendChild(createFlorCard(item, i)); });
      section.appendChild(grid);
      container.appendChild(section);
    });

    $("[data-flores-empty]").hidden = items.length > 0;
    container.hidden = items.length === 0;
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
   * Invitación a patrocinar (botón a WhatsApp)
   * ======================================================= */

  function renderPatrocinar() {
    var box = $("[data-patrocinar]");
    var data = DATA.patrocinar || {};
    var numero = String((DATA.contacto || {}).whatsapp || "").replace(/\D/g, "");
    if (!box || !numero) return;

    box.querySelectorAll("[data-patrocinar-campo]").forEach(function (campo) {
      var texto = data[campo.getAttribute("data-patrocinar-campo")];
      campo.textContent = hasText(texto) ? texto : "";
      campo.hidden = !hasText(texto);
    });

    var url = "https://wa.me/" + numero;
    if (hasText(data.mensaje)) url += "?text=" + encodeURIComponent(data.mensaje.trim());
    // Botón de la franja y botón del pie de página
    document.querySelectorAll("[data-patrocinar-boton]").forEach(function (boton) {
      boton.href = url;
      boton.setAttribute("aria-label", boton.textContent.trim() + " por WhatsApp (se abre en una pestaña nueva)");
      boton.hidden = false;
    });
    box.hidden = false;
  }

  /* =========================================================
   * Mapa de Barranco Colorado (pie de página)
   * ======================================================= */

  function renderMapa() {
    var box = $("[data-mapa]");
    var ubicacion = DATA.ubicacion || {};
    var lat = Number(ubicacion.lat);
    var lng = Number(ubicacion.lng);
    if (!box || !ubicacion.lat || !ubicacion.lng || !isFinite(lat) || !isFinite(lng)) return;

    var punto = lat + "," + lng;
    var zoom = Number(ubicacion.zoom) || 14;
    $("[data-mapa-iframe]").src = "https://maps.google.com/maps?q=" + punto + "&z=" + zoom + "&output=embed";
    $("[data-mapa-enlace]").href = "https://www.google.com/maps/search/?api=1&query=" + punto;
    box.hidden = false;
  }

  /* =========================================================
   * Pie de página: redes y contacto
   * ======================================================= */

  function createLinkItem(label, href, external) {
    var li = el("li");
    var a = el("a", "site-footer__link", label);
    a.href = href;
    if (external) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    li.appendChild(a);
    return li;
  }

  function renderFooter() {
    var redesList = $("[data-redes]");
    var contactoList = $("[data-contacto]");
    var contacto = DATA.contacto || {};
    var redes = Array.isArray(DATA.redes) ? DATA.redes : [];

    redes.forEach(function (red) {
      var url = safeUrl(red && red.url);
      if (url && hasText(red.nombre)) redesList.appendChild(createLinkItem(red.nombre, url, true));
    });

    if (hasText(contacto.telefono)) {
      var tel = contacto.telefono.replace(/[^\d+]/g, "");
      contactoList.appendChild(createLinkItem("Tel. " + contacto.telefono, "tel:" + tel, false));
    }
    if (hasText(contacto.whatsapp)) {
      var wa = contacto.whatsapp.replace(/\D/g, "");
      contactoList.appendChild(createLinkItem("WhatsApp", "https://wa.me/" + wa, true));
    }
    if (hasText(contacto.correo)) {
      contactoList.appendChild(createLinkItem(contacto.correo, "mailto:" + contacto.correo.trim(), false));
    }

    redesList.hidden = !redesList.children.length;
    contactoList.hidden = !contactoList.children.length;
    $("[data-footer-links]").hidden = !redesList.children.length && !contactoList.children.length;
  }

  /* =========================================================
   * Secciones visibles
   * Oculta las secciones desactivadas en DATA.secciones y apunta
   * el indicador "Desliza" a la primera sección visible.
   * ======================================================= */

  function applySectionVisibility() {
    var config = DATA.secciones || {};
    var first = null;
    ["actividades", "evento", "noticias", "flores", "patrocinadores"].forEach(function (id) {
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

  var ENLACES = { "#reinas": "flores", "#concierto": "evento", "#baile": "evento", "#actividades": "actividades" };

  function initEnlaceDirecto() {
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
    initViewer();
    renderEvento();
    renderActividades();
    applySectionVisibility();
    initBotonActividades();
    renderNoticias();
    renderApoyo();
    renderFlores();
    renderPatrocinadores();
    renderPatrocinar();
    renderMapa();
    renderFooter();
    initEnlaceDirecto();
  }

  init();
})();
