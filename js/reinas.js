/**
 * Nuestras reinas (portada y programa) y visor de fotos y afiches.
 * ---------------------------------------------------------------
 * - Candidatas en grupos (señoritas, niñas), con la corona y el título
 *   de las ya coronadas. Contenido: flores y floresGrupos en data.js.
 * - Visor (dialog nativo; Escape lo cierra): window.FERIA_VISOR.abrir,
 *   (portada y programa).
 * Va antes de main.js y de escenas.js (las tarjetas usan [data-revelar]).
 */
(function () {
  "use strict";

  var DATA = window.FERIA_DATA || {};

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function hasText(value) {
    return typeof value === "string" && value.trim() !== "";
  }

  /** Imagen que, si falla, llama a onFail en lugar de mostrarse rota. */
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
    if (!container) return;
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

  initViewer();
  renderFlores();

  window.FERIA_VISOR = { abrir: openViewer };
})();
