/**
 * Contenido y configuración del sitio.
 * ---------------------------------------------------------------
 * Este es el ÚNICO archivo que hay que editar para actualizar la
 * información. Todo lo que está aquí se muestra con main.js.
 *
 * Reglas:
 *  - No inventar datos: si algo no está confirmado, dejarlo vacío ("")
 *    o con el arreglo vacío ([]). El sitio mostrará un aviso amable.
 *  - Las rutas de imágenes son relativas a index.html.
 *  - Las fechas usan formato ISO: "AAAA-MM-DD".
 */
window.FERIA_DATA = {
  /* ---------- Información general ---------- */
  feria: {
    nombre: "Feria Patronal Barranco Colorado 2026",
    nombreCorto: "Feria Barranco Colorado",
    lugar: "San Jorge, Zacapa",
    lugarCompleto: "Barranco Colorado, San Jorge, Zacapa",
    patrono: "En honor a San Rafael Arcángel",
    fechaInicioTexto: "Inicia el 21 de octubre de 2026",
    anio: 2026
  },

  /* ---------- Secciones visibles ----------
   * Cambiar a false para ocultar una sección sin borrar su contenido.
   */
  secciones: {
    evento: true,
    actividades: true,
    noticias: false,
    flores: true,
    patrocinadores: true
  },

  /* ---------- Cuenta regresiva ----------
   * PROVISIONAL: la hora oficial de inicio está pendiente.
   * Confirmar antes de publicar. Conservar el desfase de Guatemala (-06:00).
   */
  cuentaRegresiva: {
    fechaObjetivo: "2026-10-21T00:00:00-06:00",
    mensajeFinal: "¡La feria ha comenzado!"
  },

  /* ---------- Logo (portada) ----------
   * ancho/alto: tamaño real (en píxeles) del archivo. Sirven para
   * reservar el espacio y conservar la proporción; no deforman la imagen.
   */
  logo: {
    ruta: "assets/img/logo/logo.webp",
    alt: "Feria Patronal Barranco Colorado 2026",
    ancho: 1000,
    alto: 775
  },

  /* ---------- Fotos de fondo de la portada (carrusel) ----------
   * Son decorativas: se muestran detrás del logo con una capa oscura.
   * encuadre: qué parte de la foto se prioriza al recortar ("x% y%").
   */
  portada: {
    intervalo: 7000, // milisegundos que dura cada foto
    fotos: [
      { ruta: "assets/img/portada/iglesia.webp", encuadre: "50% 40%" },
      { ruta: "assets/img/portada/altar.webp", encuadre: "50% 35%" }
    ]
  },

  /* ---------- Evento destacado (sección con cuenta regresiva) ----------
   * fecha: inicio con el desfase de Guatemala (-06:00); la cuenta
   *        regresiva apunta a esta hora.
   * pais: código del país de cada grupo ("mx", "gt"); muestra su bandera.
   * invitados, entradas y puntosVenta: dejar [] si no aplican.
   * ubicacion: punto para los botones de Waze y Google Maps.
   * video: se reproduce solo (en bucle) mientras está en pantalla.
   */
  evento: {
    etiqueta: "Gran concierto de feria",
    logo: {
      ruta: "assets/img/evento/los-cms-logo.webp",
      alt: "Los Meros Meros Los CMS, Caminantes por Siempre",
      ancho: 1000,
      alto: 635
    },
    pais: "mx",
    invitadosTexto: "Acompañados de",
    invitados: [
      {
        nombre: "Los Sementales",
        pais: "gt",
        logo: { ruta: "assets/img/evento/los-sementales-logo.webp", ancho: 520, alto: 183 }
      },
      {
        nombre: "40 Grados GT",
        pais: "gt",
        logo: { ruta: "assets/img/evento/40-grados-gt-logo.webp", ancho: 520, alto: 230 }
      }
    ],
    fecha: "2026-10-24T20:00:00-06:00",
    fechaTexto: "Sábado 24 de octubre · 8:00\u00a0p.\u00a0m.", // \u00a0: espacio que no se corta
    mensajeFinal: "¡Hoy es el gran concierto!",
    lugar: "Estadio Comunal",
    lugarDetalle: "Aldea Barranco Colorado, San Jorge, Zacapa",
    // Punto exacto del Estadio Comunal (confirmado por el organizador)
    ubicacion: { lat: 14.9263488, lng: -89.594772 },
    entradas: [
      { nombre: "General", precio: "Q100" },
      { nombre: "VIP", precio: "Q200", destacada: true }
    ],
    puntosVenta: [
      "Tiendas Belikin, Zacapa",
      "Centro Comercial El Esfuerzo",
      "Barranco Colorado, San Jorge"
    ],
    video: {
      ruta: "assets/video/los-cms-promo.mp4",
      portada: "assets/img/evento/los-cms-video-poster.webp",
      titulo: "Video promocional del gran concierto con Los CMS"
    },

    /* Mapa interactivo de localidades (según el plano del organizador).
     * zonas: lo que se muestra al tocar cada área del mapa.
     * mesasIzquierda / mesasDerecha: filas de mesas VIP vistas desde el
     *   público (la primera fila es la más cercana al escenario).
     *   0 = mesa sin número en el plano.
     */
    localidades: {
      zonas: [
        { id: "vip", nombre: "VIP", precio: "Q200", descripcion: "Mesas numeradas frente al escenario, a ambos lados del pasillo central." },
        { id: "general1", nombre: "General 1", precio: "Q100", descripcion: "Área general detrás de las mesas VIP, lado izquierdo." },
        { id: "general2", nombre: "General 2", precio: "Q100", descripcion: "Área general detrás de las mesas VIP, lado derecho." }
      ],
      mesasIzquierda: [
        [8, 7, 6, 5, 4, 3, 2, 1],
        [17, 18, 19, 20, 21, 22, 23, 24],
        [33, 34, 35, 36, 37, 38, 39, 40],
        [49, 50, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
      ],
      mesasDerecha: [
        [9, 10, 11, 12, 13, 14, 15, 16],
        [25, 26, 27, 28, 29, 30, 31, 32],
        [41, 42, 43, 44, 45, 46, 47, 48],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
      ]
    }
  },

  /* ---------- Actividades: adelanto (no es el programa oficial) ----------
   * Carrusel ordenado por fecha y hora. Las de días pasados se ocultan solas.
   * Campos: titulo, fecha ("AAAA-MM-DD"), hora ("HH:MM", 24 h; opcional),
   *   horaTexto (opcional, reemplaza a la hora: ej. "Por la tarde"),
   *   lugar, descripcion (opcional),
   *   afiche (imagen completa, se abre al tocar) y miniatura (para la tarjeta),
   *   alt, encuadre (qué parte del afiche se ve en la tarjeta, ej. "50% 30%"),
   * Sin afiche se muestra una tarjeta de color con el nombre.
   * El gran concierto no va aquí: tiene su propia sección.
   * aviso: mensaje destacado sobre el programa oficial ("" para quitarlo).
   */
  actividades: {
    nota: "Un adelanto de algunas actividades de nuestra feria. Fechas y horarios pueden cambiar.",
    aviso: "El programa oficial de la feria aún está en preparación. ¡Muy pronto lo compartiremos aquí!",
    lista: [
      {
        titulo: "Desfile de inauguración",
        fecha: "2026-10-21",
        hora: "15:30",
        lugar: "Plaza San Rafael",
        descripcion: "Bandas rítmicas, nuestras reinas, alegría y mucha diversión.",
        afiche: "assets/img/actividades/desfile-inauguracion.webp",
        miniatura: "assets/img/actividades/desfile-inauguracion-mini.webp",
        alt: "Afiche del desfile de inauguración de la Feria Patronal Barranco Colorado 2026: miércoles 21 de octubre, 3:30 p. m., Plaza San Rafael",
        encuadre: "50% 45%"
      },
      {
        titulo: "Los Tigres de Oriente",
        fecha: "2026-10-21",
        hora: "20:00",
        lugar: "Plaza San Rafael",
        afiche: "assets/img/actividades/los-tigres-de-oriente.webp",
        miniatura: "assets/img/actividades/los-tigres-de-oriente-mini.webp",
        alt: "Afiche de Los Tigres de Oriente en Barranco Colorado: miércoles 21 de octubre, 8:00 p. m., Plaza San Rafael",
        encuadre: "50% 55%"
      },
      {
        titulo: "Titanium, la disco móvil",
        fecha: "2026-10-22",
        hora: "19:30",
        lugar: "Salón Social Barranco Colorado",
        descripcion: "Lluvia de espuma y show de robot.",
        afiche: "assets/img/actividades/titanium-disco-movil.webp",
        miniatura: "assets/img/actividades/titanium-disco-movil-mini.webp",
        alt: "Afiche de Titanium, la disco móvil, con lluvia de espuma y show de robot: jueves 22 de octubre, 7:30 p. m., Salón Social Barranco Colorado",
        encuadre: "50% 50%"
      },
      {
        titulo: "Tarde infantil",
        fecha: "2026-10-23",
        horaTexto: "Por la tarde"
      },
      {
        titulo: "Marimba Orquesta Maya Excelsior",
        fecha: "2026-10-23",
        hora: "20:00",
        afiche: "assets/img/actividades/maya-excelsior.webp",
        miniatura: "assets/img/actividades/maya-excelsior-mini.webp",
        alt: "Afiche de la Marimba Orquesta Maya Excelsior, La Preferida: viernes 23 de octubre, 8:00 p. m., Barranco Colorado",
        encuadre: "30% 50%"
      },
      {
        titulo: "Desfile hípico",
        fecha: "2026-10-25"
      },
      {
        titulo: "Banda Vega de Luis Vega",
        fecha: "2026-10-25",
        hora: "20:00",
        lugar: "Plaza San Rafael",
        afiche: "assets/img/actividades/banda-vega.webp",
        miniatura: "assets/img/actividades/banda-vega-mini.webp",
        alt: "Afiche del concierto de Banda Vega de Luis Vega: domingo 25 de octubre, 8:00 p. m., Plaza San Rafael",
        encuadre: "50% 30%"
      }
    ]
  },

  /* ---------- Noticias ----------
   * Campos: id, titulo, descripcion, fechaPublicacion, imagen, alt, publicado
   * Solo se muestran las que tienen publicado: true, de la más reciente
   * a la más antigua. Ver ejemplos en README.md.
   */
  noticias: [],

  /* ---------- Agradecimiento (al pie de la sección de las Flores) ----------
   * Se muestra como en el afiche: escudo + "Con el apoyo de…".
   * Dejar "" lo que no aplique; si no hay nombre ni lugar, no se muestra.
   */
  agradecimiento: {
    logo: "assets/img/municipalidad/escudo-san-jorge.webp",
    logoAlt: "Escudo de la Municipalidad de San Jorge, Zacapa",
    antes: "Con el apoyo de",
    nombre: "El alcalde David Trujillo",
    despues: "y la Municipalidad de",
    lugar: "San Jorge",
    mensaje: "¡Gracias por hacer posible esta celebración!"
  },

  /* ---------- Grupos de candidatas ----------
   * Cada grupo se muestra con su título, en este orden.
   * En cada candidata, "grupo" debe coincidir con un "id" de aquí.
   */
  floresGrupos: [
    { id: "senoritas", titulo: "Señoritas representantes de la belleza" },
    { id: "ninas", titulo: "Niñas representantes de la belleza" }
  ],

  /* ---------- Flores de la Feria (candidatas) ----------
   * Campos: nombre, grupo ("senoritas" o "ninas"),
   *         titulo (va en la banda, ej. "Candidata"),
   *         descripcion (opcional), foto, alt,
   *         encuadre (opcional, ej. "50% 20%"), publicado,
   *         corona (opcional): ya coronada. Su texto es el título que va
   *         bajo la corona, ej. "Niña San Rafael". Sustituye a la banda.
   */
  flores: [
    {
      nombre: "Kimberly Damacio Ortíz",
      grupo: "senoritas",
      corona: "Señorita San Rafael",
      foto: "assets/img/flores/kimberly-damacio-ortiz-senorita-san-rafael.webp",
      alt: "Kimberly Damacio Ortíz con corona y banda de Señorita San Rafael 2026",
      publicado: true
    },
    {
      nombre: "Ana Rosa de Paz Súchite",
      grupo: "senoritas",
      corona: "Flor de la Feria",
      foto: "assets/img/flores/ana-rosa-de-paz-suchite-flor-de-la-feria.webp",
      alt: "Ana Rosa de Paz Súchite con corona y banda de Flor de la Feria 2026",
      publicado: true
    },
    {
      nombre: "Linzeth Fajardo Acevedo",
      grupo: "senoritas",
      corona: "Señorita Barranco Colorado",
      foto: "assets/img/flores/linzeth-fajardo-acevedo-senorita-barranco-colorado.webp",
      alt: "Linzeth Fajardo Acevedo con corona y banda de Señorita Barranco Colorado 2026",
      publicado: true
    },
    {
      nombre: "Sofía Guadalupe Espino Archila",
      grupo: "ninas",
      corona: "Niña San Rafael",
      foto: "assets/img/flores/sofia-guadalupe-espino-archila-nina-san-rafael.webp",
      alt: "Sofía Guadalupe Espino Archila con corona y banda de Niña San Rafael 2026",
      publicado: true
    },
    {
      nombre: "Ayelén Alessandra Rosales",
      grupo: "ninas",
      corona: "Flor de la Feria Infantil",
      foto: "assets/img/flores/ayelen-alessandra-rosales-flor-infantil.webp",
      alt: "Ayelén Alessandra Rosales con corona y banda de Flor de la Feria Infantil 2026",
      publicado: true
    },
    {
      nombre: "Emely Daniela Villagrán Pérez",
      grupo: "ninas",
      corona: "Niña Barranco Colorado",
      foto: "assets/img/flores/emely-daniela-villagran-perez-nina-barranco-colorado.webp",
      alt: "Emely Daniela Villagrán Pérez con corona y banda de Niña Barranco Colorado 2026",
      publicado: true
    }
  ],

  /* ---------- Patrocinadores ----------
   * Campos: nombre, logo, url (opcional), orden,
   *         fondo (opcional): color de la tarjeta en formato "#RRGGBB".
   *         Útil para logos blancos o de marca, ej. Gallo sobre rojo.
   */
  patrocinadores: [
    {
      nombre: "Cerveza Gallo",
      logo: "assets/img/patrocinadores/gallo.webp",
      fondo: "#C8102E",
      url: "",
      orden: 1
    },
    {
      nombre: "Cooperativas MICOOPE",
      logo: "assets/img/patrocinadores/micoope.webp",
      fondo: "#FFFFFF",
      url: "https://micoope.com.gt/",
      orden: 2
    },
    {
      nombre: "Municipalidad de San Jorge",
      logo: "assets/img/municipalidad/escudo-san-jorge.webp",
      fondo: "#0B2B6E",
      url: "",
      orden: 3
    }
  ],

  /* ---------- Invitación a patrocinar ----------
   * Franja al final de Patrocinadores con un botón que abre WhatsApp
   * con el mensaje ya escrito. Usa el número de contacto.whatsapp;
   * si está vacío, la franja no se muestra.
   */
  patrocinar: {
    titulo: "¿Quieres patrocinar la feria?",
    texto: "Súmate a la celebración de Barranco Colorado y haz que tu negocio sea parte de nuestra fiesta patronal.",
    boton: "Contáctanos por WhatsApp",
    mensaje: "¡Hola! Me interesa patrocinar la Feria Patronal Barranco Colorado 2026."
  },

  /* ---------- Ubicación (mapa del pie de página) ----------
   * Coordenadas de Barranco Colorado, San Jorge, Zacapa (OpenStreetMap).
   * Ojo: hay otro "Barranco Colorado" en Teculután; por eso se usan
   * coordenadas y no el nombre. Para apuntar a la iglesia o al campo de
   * la feria, copiar lat/lng desde Google Maps (clic derecho en el punto).
   */
  ubicacion: {
    lat: 14.9236932,
    lng: -89.5971415,
    zoom: 14
  },

  /* ---------- Contacto y redes oficiales ----------
   * Dejar vacío lo que no se haya confirmado; no se mostrará.
   */
  contacto: {
    telefono: "",
    whatsapp: "50235985883", // +502 3598 5883 · solo números con código de país
    correo: ""
  },

  redes: [
    // { nombre: "Facebook", url: "https://..." }
  ]
};
