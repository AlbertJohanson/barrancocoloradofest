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

  function initCountdown() {
    var config = DATA.cuentaRegresiva || {};
    var grid = $("[data-countdown]");
    var done = $("[data-countdown-done]");
    var target = new Date(config.fechaObjetivo).getTime();
    if (!grid || isNaN(target)) {
      if (grid) grid.closest(".countdown").hidden = true;
      return;
    }

    var nodes = {};
    ["dias", "horas", "minutos", "segundos"].forEach(function (unit) {
      nodes[unit] = grid.querySelector('[data-unit="' + unit + '"]');
    });

    function finish() {
      grid.hidden = true;
      $("#titulo-contador").textContent = "¡Llegó el día!";
      done.textContent = config.mensajeFinal || "¡La feria ha comenzado!";
      done.classList.add("is-visible");
    }

    function tick() {
      var r = getRemaining(target);
      if (r.total <= 0) {
        finish();
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
    ["noticias", "flores", "patrocinadores"].forEach(function (id) {
      var section = document.getElementById(id);
      if (!section) return;
      section.hidden = config[id] === false;
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
    if (title && label) label.textContent = "hacia " + title.textContent;
  }

  /* =========================================================
   * Enlace directo a una sección: barrancocoloradofest.com/#reinas
   * Las secciones quedan fijas al desplazarse (js/escenas.js) y el
   * salto nativo del navegador no cae bien, así que se calcula aquí.
   * "#reinas" no es un id: el navegador no salta por su cuenta.
   * ======================================================= */

  var ENLACES = { "#reinas": "flores" };

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
    applySectionVisibility();
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
