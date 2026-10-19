/**
 * Pie de página (portada y programa): botón para patrocinar por
 * WhatsApp, redes, contacto y mapa de Barranco Colorado.
 * Lee window.FERIA_DATA (js/data.js). Va antes de main.js.
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

  /** Solo acepta enlaces http(s), mailto y tel. */
  function safeUrl(url) {
    if (!hasText(url)) return "";
    var trimmed = url.trim();
    return /^(https?:\/\/|mailto:|tel:)/i.test(trimmed) ? trimmed : "";
  }

  /** Nombre, lugar y patrono del pie, desde data.js. */
  function renderTextos() {
    var feria = DATA.feria || {};
    document.querySelectorAll(".site-footer [data-feria]").forEach(function (node) {
      var value = feria[node.getAttribute("data-feria")];
      if (value !== undefined && value !== "") node.textContent = String(value);
    });
  }

  /**
   * Botones "Quiero ser patrocinador" (pie y franja de Patrocinadores):
   * abren WhatsApp con el mensaje ya escrito. Sin número no se muestran.
   */
  function renderBotonesPatrocinar() {
    var data = DATA.patrocinar || {};
    var numero = String((DATA.contacto || {}).whatsapp || "").replace(/\D/g, "");
    if (!numero) return;

    var url = "https://wa.me/" + numero;
    if (hasText(data.mensaje)) url += "?text=" + encodeURIComponent(data.mensaje.trim());
    document.querySelectorAll("[data-patrocinar-boton]").forEach(function (boton) {
      boton.href = url;
      boton.setAttribute("aria-label", boton.textContent.trim() + " por WhatsApp (se abre en una pestaña nueva)");
      boton.hidden = false;
    });
  }

  /** Mapa de Barranco Colorado. */
  function renderMapa() {
    var box = $("[data-mapa]");
    var ubicacion = DATA.ubicacion || {};
    var lat = Number(ubicacion.lat);
    var lng = Number(ubicacion.lng);
    if (!box || !ubicacion.lat || !ubicacion.lng || !isFinite(lat) || !isFinite(lng)) return;

    var punto = lat + "," + lng;
    var zoom = Number(ubicacion.zoom) || 14;
    $("[data-mapa-iframe]", box).src = "https://maps.google.com/maps?q=" + punto + "&z=" + zoom + "&output=embed";
    $("[data-mapa-enlace]", box).href = "https://www.google.com/maps/search/?api=1&query=" + punto;
    box.hidden = false;
  }

  /* ---------- Redes y contacto ---------- */

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

  function renderEnlaces() {
    var redesList = $("[data-redes]");
    var contactoList = $("[data-contacto]");
    if (!redesList || !contactoList) return;
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

  renderTextos();
  renderBotonesPatrocinar();
  renderMapa();
  renderEnlaces();
})();
