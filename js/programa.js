/**
 * Programa oficial de la feria.
 * ---------------------------------------------------------------
 * - Utilidades compartidas (window.FERIA_PROGRAMA): qué día de la feria
 *   es hoy en Guatemala y la agenda de un día, con "Ahora" y
 *   "A continuación". Las usa la portada (main.js) durante la feria.
 * - En programa.html, además, arma la página: filtro por día, tarjetas
 *   (las principales, con su banner) y agradecimientos.
 *
 * Para probar cómo se ve un día de feria: agrega a la dirección
 * ?simular=2026-10-22T16:00 (hora de Guatemala).
 */
(function () {
  "use strict";

  var DATA = window.FERIA_DATA || {};
  var PROGRAMA = DATA.programa || {};
  var GUATEMALA = -6 * 3600000; // UTC-6, sin horario de verano

  /* =========================================================
   * Utilidades
   * ======================================================= */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function hasText(value) {
    return typeof value === "string" && value.trim() !== "";
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  /** "20:00" -> 1200 minutos; "24:00" (medianoche) -> 1440. NaN si no es válida. */
  function minutos(hora) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(hora || ""));
    return m && Number(m[1]) <= 24 ? Number(m[1]) * 60 + Number(m[2]) : NaN;
  }

  /** "20:00" -> "8:00 p. m."; "24:00" -> "12:00 a. m." (espacios que no se cortan). */
  function formatHora(hora) {
    var total = minutos(hora);
    if (isNaN(total)) return "";
    var h = Math.floor(total / 60) % 24;
    return (h % 12 || 12) + ":" + pad(total % 60) + " " + (h < 12 ? "a. m." : "p. m.");
  }

  var DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  var DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
    "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  /** "2026-10-21" -> partes para mostrar la fecha. */
  function partesFecha(fecha) {
    var p = fecha.split("-").map(Number);
    var semana = new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay();
    return { dia: DIAS[semana], corto: DIAS_CORTOS[semana], num: p[2], mes: MESES[p[1] - 1] };
  }

  /* ---------- Hora actual (o simulada con ?simular=) ---------- */

  var desfase = 0;
  (function () {
    var m = /[?&]simular=([^&]+)/.exec(location.search);
    if (!m) return;
    var valor = decodeURIComponent(m[1]);
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) valor += "T12:00";
    var t = new Date(valor + "-06:00").getTime();
    if (!isNaN(t)) desfase = t - Date.now();
  })();

  function ahora() {
    return Date.now() + desfase;
  }

  /* ---------- Días del programa ---------- */

  var dias = (Array.isArray(PROGRAMA.dias) ? PROGRAMA.dias : [])
    .filter(function (dia) {
      return dia && /^\d{4}-\d{2}-\d{2}$/.test(String(dia.fecha)) && Array.isArray(dia.actividades);
    })
    .map(function (dia) {
      return {
        fecha: dia.fecha,
        actividades: dia.actividades
          .filter(function (a) { return a && hasText(a.titulo) && !isNaN(minutos(a.hora)); })
          .sort(function (a, b) { return minutos(a.hora) - minutos(b.hora); })
      };
    })
    .filter(function (dia) { return dia.actividades.length; })
    .sort(function (a, b) { return a.fecha.localeCompare(b.fecha); });

  var cambioDeDia = minutos(PROGRAMA.cambioDeDia);
  if (isNaN(cambioDeDia)) cambioDeDia = 0;

  /**
   * Día de feria en Guatemala y minutos transcurridos desde su medianoche.
   * Antes de cambioDeDia (madrugada) sigue siendo el día anterior, así
   * que a las 12:30 a. m. los minutos pasan de 1440.
   */
  function momento() {
    var local = new Date(ahora() + GUATEMALA - cambioDeDia * 60000);
    return {
      fecha: local.toISOString().slice(0, 10),
      minuto: local.getUTCHours() * 60 + local.getUTCMinutes() + cambioDeDia
    };
  }

  function diaDeHoy() {
    var fecha = momento().fecha;
    return dias.filter(function (dia) { return dia.fecha === fecha; })[0] || null;
  }

  /* =========================================================
   * Íconos (trazos simples, se pintan con currentColor)
   * ======================================================= */

  var ICONOS = {
    desfile: '<path d="M5 22V3"/><path d="M5 4c3-2 6 2 9 0s4-1 5-1v9c-1 0-2-1-5 1s-6-2-9 0"/>',
    discurso: '<rect x="9" y="2" width="6" height="11" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4M8 22h8"/>',
    musica: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    marimba: '<rect x="2" y="4" width="20" height="4" rx="1"/><path d="M5 8v13M9.7 8v11M14.3 8v9M19 8v7"/>',
    corona: '<path d="m3 6 3.5 11h11L21 6l-5 5-4-7-4 7Z"/><path d="M6 21h12"/>',
    iglesia: '<path d="M12 2v5M10 4h4"/><path d="M6 22V12l6-5 6 5v10"/><path d="M10 22v-4a2 2 0 0 1 4 0v4"/><path d="M3 22h18"/>',
    ninos: '<circle cx="12" cy="9" r="6"/><path d="M12 15l-1.2 2h2.4L12 15"/><path d="M12 17c0 2.2-2 2.6-2 5"/>',
    moto: '<circle cx="5.5" cy="17" r="3.5"/><circle cx="18.5" cy="17" r="3.5"/><path d="M5.5 17 9 10h6l3.5 7"/><path d="M15 10l-1-4h3"/><path d="M9 10l3 7h1.5"/>',
    fuegos: '<path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/><circle cx="12" cy="12" r="1.5"/>',
    cafe: '<path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5Z"/><path d="M7 2v3M11 2v3M15 2v3"/>',
    caballo: '<path d="M7 21H4L3 13a9 9 0 0 1 18 0l-1 8h-3l1-8a6 6 0 0 0-12 0Z"/><path d="M6 15h.01M18 15h.01"/>',
    cena: '<path d="M4 2v7a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M20 15V2a4 4 0 0 0-4 4v7a2 2 0 0 0 2 2h2Zm0 0v7"/>'
  };

  function crearIcono(nombre, clase) {
    var span = el("span", clase || "agenda__icono");
    span.setAttribute("aria-hidden", "true");
    // Trazos fijos de este archivo, no vienen de data.js
    span.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false">' +
      (ICONOS[nombre] || ICONOS.musica) + "</svg>";
    return span;
  }

  /* =========================================================
   * Agenda de un día
   * ======================================================= */

  /** Solo enlaces del mismo sitio o http(s). */
  function enlaceSeguro(url) {
    var limpio = String(url || "").trim();
    return /^(https?:\/\/|\.\/|\/|#)/i.test(limpio) ? limpio : "";
  }

  /** "2026-10-21" + "24:00" -> "2026-10-22T00:00" (para <time datetime>). */
  function fechaHora(fecha, hora) {
    var p = fecha.split("-").map(Number);
    var total = minutos(hora);
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2], 0, total));
    return d.toISOString().slice(0, 16) + "-06:00";
  }

  /** Lista de actividades. nivel: etiqueta del título de cada actividad ("h3"). */
  function crearAgenda(dia, nivel) {
    var lista = el("ol", "agenda");
    dia.actividades.forEach(function (actividad) {
      var li = el("li", "agenda__item" + (actividad.destacado ? " agenda__item--destacado" : ""));
      li.setAttribute("data-minuto", String(minutos(actividad.hora)));
      li.appendChild(crearIcono(actividad.icono));

      var cuerpo = el("div", "agenda__cuerpo");
      var meta = el("p", "agenda__meta");
      var hora = el("time", "agenda__hora", formatHora(actividad.hora));
      hora.dateTime = fechaHora(dia.fecha, actividad.hora);
      meta.appendChild(hora);
      var estado = el("span", "agenda__estado");
      estado.setAttribute("data-estado", "");
      estado.hidden = true;
      meta.appendChild(estado);
      cuerpo.appendChild(meta);

      cuerpo.appendChild(el(nivel || "h3", "agenda__titulo", actividad.titulo));
      if (hasText(actividad.detalle)) cuerpo.appendChild(el("p", "agenda__detalle", actividad.detalle));

      var enlace = actividad.enlace || {};
      var url = enlaceSeguro(enlace.url);
      if (url && hasText(enlace.texto)) {
        var a = el("a", "agenda__enlace", enlace.texto);
        a.href = url;
        cuerpo.appendChild(a);
      }
      li.appendChild(cuerpo);
      lista.appendChild(li);
    });
    return lista;
  }

  /**
   * Marca el avance del día en una agenda de hoy:
   * - "Ahora": la última que empezó, durante sus primeras 2 horas.
   * - "A continuación": la siguiente por empezar.
   * - Las anteriores se atenúan.
   * apagar: quita las marcas (la agenda dejó de ser la de hoy).
   */
  var EN_CURSO = 120;

  function marcarEstados(lista, apagar) {
    var minuto = apagar ? -1 : momento().minuto;
    var items = Array.prototype.slice.call(lista.children);
    var empezadas = items.filter(function (li) { return Number(li.getAttribute("data-minuto")) <= minuto; });
    var ultima = empezadas[empezadas.length - 1];
    var ahoraItem = ultima && minuto - Number(ultima.getAttribute("data-minuto")) < EN_CURSO ? ultima : null;
    var proxima = apagar ? null : items[empezadas.length] || null;

    items.forEach(function (li) {
      var texto = li === ahoraItem ? "Ahora" : li === proxima ? "A continuación" : "";
      li.classList.toggle("is-ahora", li === ahoraItem);
      li.classList.toggle("is-proxima", li === proxima);
      li.classList.toggle("is-pasada", empezadas.indexOf(li) !== -1 && li !== ahoraItem);
      var estado = li.querySelector("[data-estado]");
      estado.textContent = texto;
      estado.hidden = !texto;
    });
  }

  /** Llama a fn ahora y al empezar cada minuto (se detiene mientras la pestaña está oculta). */
  function cadaMinuto(fn) {
    fn();
    function programar() {
      setTimeout(function () {
        if (!document.hidden) fn();
        programar();
      }, 60000 - (ahora() % 60000) + 50);
    }
    programar();
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) fn();
    });
  }

  /** "Miércoles 21 de octubre" */
  function fechaLarga(fecha) {
    var p = partesFecha(fecha);
    return p.dia + " " + p.num + " de " + p.mes;
  }

  window.FERIA_PROGRAMA = {
    ahora: ahora,
    dias: dias,
    diaDeHoy: diaDeHoy,
    fechaLarga: fechaLarga,
    crearAgenda: crearAgenda,
    marcarEstados: marcarEstados,
    cadaMinuto: cadaMinuto
  };

  /* =========================================================
   * Página del programa (programa.html)
   * ======================================================= */

  /** Tarjeta de una actividad. Con imagen es una de las principales. */
  function crearTarjeta(dia, actividad) {
    var imagen = actividad.imagen || {};
    var principal = hasText(imagen.ruta);
    var li = el("li", "act-card" + (principal ? " act-card--principal" : ""));
    // Banner muy ancho (los de los grupos): siempre arriba, a todo el ancho
    if (principal && imagen.ancho / imagen.alto > 3) li.classList.add("act-card--banner");
    // Foto casi cuadrada (la Flor de la Feria): más angosta y de alto limitado
    if (principal && imagen.ancho / imagen.alto < 1.6) li.classList.add("act-card--foto");
    li.setAttribute("data-minuto", String(minutos(actividad.hora)));

    if (principal) {
      var figura = el("figure", "act-card__media");
      var img = document.createElement("img");
      img.alt = imagen.alt || "";
      if (imagen.ancho) img.width = imagen.ancho;
      if (imagen.alto) img.height = imagen.alto;
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", function () { figura.remove(); }, { once: true });
      img.src = imagen.ruta;
      figura.appendChild(img);
      li.appendChild(figura);
    }

    var cuerpo = el("div", "act-card__cuerpo");
    var meta = el("p", "act-card__meta");
    meta.appendChild(crearIcono(actividad.icono, "act-card__icono"));
    var hora = el("time", "act-card__hora", formatHora(actividad.hora));
    hora.dateTime = fechaHora(dia.fecha, actividad.hora);
    meta.appendChild(hora);
    var estado = el("span", "act-card__estado");
    estado.setAttribute("data-estado", "");
    estado.hidden = true;
    meta.appendChild(estado);
    cuerpo.appendChild(meta);

    if (principal) {
      var etiqueta = hasText(actividad.etiqueta) ? actividad.etiqueta : "Actividad principal";
      cuerpo.appendChild(el("p", "act-card__etiqueta", etiqueta));
    }
    cuerpo.appendChild(el("h3", "act-card__titulo", actividad.titulo));
    if (hasText(actividad.detalle)) cuerpo.appendChild(el("p", "act-card__detalle", actividad.detalle));

    var enlace = actividad.enlace || {};
    var url = enlaceSeguro(enlace.url);
    if (url && hasText(enlace.texto)) {
      var a = el("a", "act-card__enlace", enlace.texto);
      a.href = url;
      cuerpo.appendChild(a);
    }
    li.appendChild(cuerpo);
    return li;
  }

  /**
   * En dos columnas, una tarjeta normal que queda sola en su fila
   * (antes de una principal o al final) ocupa el ancho completo:
   * así no quedan huecos y se respeta el orden por hora.
   */
  function marcarSolas(grid) {
    var columna = 0;
    var anterior = null;
    Array.prototype.forEach.call(grid.children, function (card) {
      if (card.classList.contains("act-card--principal")) {
        if (columna === 1) anterior.classList.add("act-card--ancha");
        columna = 0;
      } else {
        columna = (columna + 1) % 2;
      }
      anterior = card;
    });
    if (columna === 1) anterior.classList.add("act-card--ancha");
  }

  function crearDia(dia) {
    var p = partesFecha(dia.fecha);
    var section = el("section", "programa-dia");
    section.id = "dia-" + dia.fecha;
    section.setAttribute("aria-labelledby", "titulo-" + dia.fecha);

    // Aparecen al llegar a la pantalla, como en la portada (js/escenas.js)
    var cabecera = el("header", "programa-dia__cabecera");
    cabecera.setAttribute("data-revelar", "");
    var titulo = el("h2", "programa-dia__titulo");
    titulo.id = "titulo-" + dia.fecha;
    titulo.appendChild(el("span", "programa-dia__semana", p.dia));
    titulo.appendChild(el("span", "programa-dia__fecha", p.num + " de " + p.mes));
    cabecera.appendChild(titulo);
    var hoy = el("span", "programa-dia__hoy", "Hoy");
    hoy.hidden = true;
    cabecera.appendChild(hoy);
    section.appendChild(cabecera);

    var grid = el("ol", "act-grid");
    dia.actividades.forEach(function (actividad, i) {
      var tarjeta = crearTarjeta(dia, actividad);
      tarjeta.setAttribute("data-revelar", "voltear");
      tarjeta.style.setProperty("--i", Math.min(i, 3));
      grid.appendChild(tarjeta);
    });
    marcarSolas(grid);
    section.appendChild(grid);
    return section;
  }

  function renderPagina(pagina) {
    var contenedor = pagina.querySelector("[data-programa-dias]");
    var nav = pagina.querySelector("[data-programa-nav]");
    var filtro = pagina.querySelector("[data-programa-filtro]");
    var fechas = document.querySelector("[data-programa-fechas]");
    if (fechas && hasText(PROGRAMA.fechasTexto)) fechas.textContent = PROGRAMA.fechasTexto;

    if (!dias.length) {
      pagina.querySelector("[data-programa-vacio]").hidden = false;
      nav.hidden = true;
      return;
    }

    var secciones = {};
    var botones = {};

    function crearBoton(clave, texto, etiqueta) {
      var boton = el("button", "programa-filtro__boton");
      boton.type = "button";
      boton.setAttribute("aria-pressed", "false");
      boton.appendChild(el("span", "", texto));
      if (etiqueta) boton.setAttribute("aria-label", etiqueta);
      boton.addEventListener("click", function () { elegir(clave, true); });
      filtro.appendChild(boton);
      botones[clave] = boton;
    }

    crearBoton("todos", "Toda la semana");
    dias.forEach(function (dia) {
      var p = partesFecha(dia.fecha);
      secciones[dia.fecha] = crearDia(dia);
      contenedor.appendChild(secciones[dia.fecha]);
      crearBoton(dia.fecha, p.corto + " " + p.num, fechaLarga(dia.fecha));
    });

    // Filtro: "todos" o la fecha de un día
    var elegido = null;
    function elegir(clave, porPersona) {
      if (!botones[clave]) clave = "todos";
      elegido = clave;
      Object.keys(botones).forEach(function (k) {
        botones[k].setAttribute("aria-pressed", String(k === clave));
      });
      dias.forEach(function (dia) {
        secciones[dia.fecha].hidden = clave !== "todos" && clave !== dia.fecha;
      });
      if (!porPersona) return;
      history.replaceState(null, "", clave === "todos" ? location.pathname + location.search : "#dia-" + clave);
      botones[clave].scrollIntoView({ block: "nearest", inline: "nearest" });
      // Si la barra ya está fija arriba, vuelve al inicio de las actividades
      var inicio = contenedor.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 16;
      if (window.scrollY > inicio) window.scrollTo({ top: inicio });
    }

    // La pastilla se vuelve barra al quedar fija arriba (el margen de -1 px
    // hace que, pegada al borde, ya no quepa entera en la pantalla)
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entradas) {
        var e = entradas[0];
        nav.classList.toggle("is-fija", e.intersectionRatio < 1 && e.boundingClientRect.top <= 0);
      }, { threshold: 1, rootMargin: "-1px 0px 0px 0px" }).observe(nav);
    }

    // Al abrir: el día del enlace (#dia-AAAA-MM-DD), hoy si hay feria, o toda la semana
    var enlace = /^#dia-(\d{4}-\d{2}-\d{2})$/.exec(location.hash);
    var hoyInicial = diaDeHoy();
    elegir(enlace ? enlace[1] : hoyInicial ? hoyInicial.fecha : "todos", false);

    // Hoy: marca del día, Ahora / A continuación; se actualiza cada minuto
    var fechaMostrada = null;
    cadaMinuto(function () {
      var dia = diaDeHoy();
      var hoy = momento().fecha;
      var fecha = dia ? dia.fecha : "";
      if (fecha !== fechaMostrada) {
        // Cambió el día con la página abierta: si se veía el anterior, pasa al nuevo
        if (fecha && elegido === fechaMostrada) elegir(fecha, false);
        fechaMostrada = fecha;
        dias.forEach(function (d) {
          var esHoy = d.fecha === fecha;
          var seccion = secciones[d.fecha];
          seccion.classList.toggle("is-hoy", esHoy);
          seccion.querySelector(".programa-dia__hoy").hidden = !esHoy;
          if (!esHoy) marcarEstados(seccion.querySelector(".act-grid"), true);
          botones[d.fecha].classList.toggle("is-hoy", esHoy);
          botones[d.fecha].classList.toggle("is-pasado", d.fecha < hoy);
          var marca = botones[d.fecha].querySelector(".programa-filtro__hoy");
          if (esHoy && !marca) {
            marca = el("span", "programa-filtro__hoy", "Hoy");
            botones[d.fecha].insertBefore(marca, botones[d.fecha].firstChild);
            botones[d.fecha].setAttribute("aria-label", "Hoy, " + fechaLarga(d.fecha));
          } else if (!esHoy && marca) {
            marca.remove();
            botones[d.fecha].setAttribute("aria-label", fechaLarga(d.fecha));
          }
        });
      }
      if (dia) marcarEstados(secciones[fecha].querySelector(".act-grid"));
    });
  }

  /** Franja del patrocinio (escudo) y nombres de los agradecimientos. */
  function renderGracias() {
    var box = document.querySelector("[data-programa-gracias]");
    if (!box) return;

    var patrocinio = PROGRAMA.patrocinio || {};
    var apoyo = box.querySelector("[data-programa-apoyo]");
    if (hasText(patrocinio.nombre) || hasText(patrocinio.lugar)) {
      apoyo.querySelectorAll("[data-apoyo-campo]").forEach(function (node) {
        var value = patrocinio[node.getAttribute("data-apoyo-campo")];
        if (hasText(value)) node.textContent = value;
        else node.remove();
      });
      var escudo = apoyo.querySelector(".apoyo__escudo");
      escudo.addEventListener("error", function () { escudo.parentNode.remove(); }, { once: true });
      apoyo.hidden = false;
      box.hidden = false;
    }

    [["agradecimientos", "[data-programa-gracias-box]"], ["cocode", "[data-programa-cocode-box]"]].forEach(function (par) {
      var nombres = (Array.isArray(PROGRAMA[par[0]]) ? PROGRAMA[par[0]] : []).filter(hasText);
      var grupo = box.querySelector(par[1]);
      var lista = grupo.querySelector("ul");
      nombres.forEach(function (nombre) { lista.appendChild(el("li", "", nombre)); });
      grupo.hidden = !nombres.length;
      if (nombres.length) box.hidden = false;
    });
    animarGracias(box);
  }

  /**
   * Aparición de los agradecimientos, una sola vez al llegar a la
   * pantalla: el título se escribe, la franja sube, el escudo crece y
   * los nombres aparecen uno tras otro. Sin JS o con "reducir
   * movimiento" se ve todo desde el inicio.
   */
  function animarGracias(box) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    box.classList.add("anima-gracias");
    box.querySelectorAll(".programa-gracias__nombres").forEach(function (lista) {
      Array.prototype.forEach.call(lista.children, function (li, i) { li.style.setProperty("--i", i); });
    });
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("is-visible");
        io.unobserve(entrada.target);
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    box.querySelectorAll(".programa-gracias__titulo, .apoyo, .programa-gracias__subtitulo, .programa-gracias__nombres")
      .forEach(function (node) { io.observe(node); });
  }

  /**
   * Botón "Compartir programa": abre el menú para compartir del teléfono
   * (Web Share API); donde no existe, copia el enlace. Al lado, un enlace
   * directo a WhatsApp con el mensaje ya escrito.
   */
  function initCompartir() {
    var boton = document.querySelector("[data-compartir]");
    if (!boton) return;
    var aviso = document.querySelector("[data-compartir-aviso]");
    var url = "https://barrancocoloradofest.com/programa.html";
    var texto = "¡Ya está el programa oficial de la Feria Patronal Barranco Colorado 2026! Del 21 al 25 de octubre.";

    var whatsapp = document.querySelector("[data-compartir-whatsapp]");
    if (whatsapp) whatsapp.href = "https://wa.me/?text=" + encodeURIComponent(texto + " " + url);

    function avisar(mensaje) {
      aviso.textContent = mensaje;
      setTimeout(function () { aviso.textContent = ""; }, 3000);
    }

    boton.addEventListener("click", function () {
      if (navigator.share) {
        navigator.share({ title: "Programa oficial · Feria Barranco Colorado 2026", text: texto, url: url })
          .catch(function () {}); // la persona cerró el menú
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          avisar("¡Enlace copiado! Pégalo donde quieras compartirlo.");
        }, function () { avisar(url); });
      } else {
        avisar(url);
      }
    });
  }

  initCompartir();

  var pagina = document.querySelector("[data-programa-pagina]");
  if (pagina) {
    renderPagina(pagina);
    renderGracias();
  }
})();
