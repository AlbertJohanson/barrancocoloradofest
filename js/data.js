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
    noticias: true, // Noticias del COCODE (Facebook)
    flores: true,
    patrocinadores: true
  },

  /* ---------- Cuenta regresiva ----------
   * PROVISIONAL: la hora oficial de inicio está pendiente.
   * Confirmar antes de publicar. Conservar el desfase de Guatemala (-06:00).
   */
  cuentaRegresiva: {
    fechaObjetivo: "2026-10-21T00:00:00-06:00",
    mensajeFinal: "¡La feria ha comenzado, acompáñanos!"
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

  /* ---------- Programa oficial (página programa.html) ----------
   * Tomado del programa oficial de la Municipalidad de San Jorge.
   * Antes de la feria se ven todos los días. Durante la feria, las
   * actividades del día se destacan en la portada y el programa abre en hoy.
   * Campos de cada actividad:
   *   hora ("HH:MM", 24 h). Medianoche = "24:00": queda al final de ese día.
   *   titulo, detalle (opcional),
   *   icono: desfile, discurso, musica, marimba, corona, iglesia, ninos,
   *          moto, fuegos, cafe, caballo, cena
   *   destacado (opcional): true para las actividades principales.
   *   enlace (opcional): { texto, url } para ver más.
   *   imagen (opcional): { ruta, ancho, alto, alt }. Las actividades con
   *          imagen son las principales: tarjeta grande con su banner
   *          (los banners salen del programa oficial).
   *   etiqueta (opcional): texto sobre el título de una principal
   *          en lugar de "Actividad principal".
   * cambioDeDia: hasta esa hora de la madrugada se sigue mostrando el día
   *   anterior (así la serenata de medianoche sigue en "Hoy").
   */
  programa: {
    fechasTexto: "Del 21 al 25 de octubre de 2026",
    cambioDeDia: "05:00",
    dias: [
      {
        fecha: "2026-10-21",
        actividades: [
          {
            hora: "15:30",
            titulo: "Desfile de inauguración",
            detalle: "Iniciando en el barrio La Ceiba, San Jorge, recorriendo las principales calles de Barranco Colorado, hacia la plaza San Rafael.",
            icono: "desfile",
            destacado: true
          },
          {
            hora: "19:45",
            titulo: "Acto de inauguración",
            detalle: "A cargo del señor alcalde municipal, Lic. David Trujillo, y su honorable Concejo Municipal.",
            icono: "discurso"
          },
          {
            hora: "20:00",
            titulo: "Gran concierto con Los Tigres de Oriente",
            imagen: { ruta: "assets/img/programa/los-tigres-de-oriente.webp", ancho: 850, alto: 212, alt: "Grupo musical Los Tigres de Oriente" },
            detalle: "Gracias a la Municipalidad de San Jorge.",
            icono: "musica",
            destacado: true
          },
          {
            hora: "24:00",
            titulo: "Serenata a nuestras reinas",
            imagen: { ruta: "assets/img/programa/flor-de-la-feria.webp", ancho: 800, alto: 680, alt: "Ana Rosa de Paz Súchite, Flor de la Feria 2026, con su corona y su banda" },
            etiqueta: "Nuestras reinas",
            icono: "corona"
          }
        ]
      },
      {
        fecha: "2026-10-22",
        actividades: [
          {
            hora: "15:30",
            titulo: "Tarde cultural y familiar",
            detalle: "Con marimba de la Municipalidad de Zacapa (agradecimientos a Xiomara Ovalle). En plaza San Rafael.",
            icono: "marimba"
          },
          {
            hora: "20:00",
            titulo: "Gran baile con Disco Móvil Titanium",
            imagen: { ruta: "assets/img/programa/titanium.webp", ancho: 894, alto: 204, alt: "Discomóvil Titanium, la disco móvil sin límites" },
            detalle: "En el salón social, gracias a la Municipalidad de San Jorge.",
            icono: "musica",
            destacado: true
          }
        ]
      },
      {
        fecha: "2026-10-23",
        actividades: [
          {
            hora: "16:00",
            titulo: "Tarde infantil",
            detalle: "Gracias a Amarilis Trabanino y familia, en plaza San Rafael.",
            icono: "ninos"
          },
          {
            hora: "20:00",
            titulo: "Gran concierto con marimba Orquesta Maya Excelsior",
            imagen: { ruta: "assets/img/programa/maya-excelsior.webp", ancho: 888, alto: 194, alt: "Marimba Orquesta Maya Excelsior, La Preferida" },
            detalle: "En plaza San Rafael. Gracias al patrocinio del señor alcalde David Trujillo y su Concejo Municipal.",
            icono: "marimba",
            destacado: true
          },
          {
            hora: "24:00",
            titulo: "Serenata al santo patrono San Rafael Arcángel",
            detalle: "En la iglesia católica.",
            icono: "iglesia"
          }
        ]
      },
      {
        fecha: "2026-10-24",
        actividades: [
          {
            hora: "10:00",
            titulo: "Inscripciones para el Motocross",
            detalle: "Evento organizado por jóvenes de nuestra comunidad de Barranco Colorado.",
            icono: "moto"
          },
          {
            hora: "18:00",
            titulo: "Procesión del santo patrono San Rafael Arcángel",
            imagen: { ruta: "assets/img/programa/procesion.webp", ancho: 1200, alto: 500, alt: "Altar de San Rafael Arcángel en la iglesia de Barranco Colorado" },
            detalle: "Saliendo del templo católico.",
            icono: "iglesia",
            destacado: true
          },
          {
            hora: "20:00",
            titulo: "Gran concierto internacional",
            imagen: { ruta: "assets/img/programa/concierto-internacional.webp", ancho: 892, alto: 166, alt: "Los CMS, 40 Grados Gt y Los Sementales" },
            detalle: "Con Los Caminantes, Los Sementales y 40 Grados Gt, en el estadio comunal de Barranco Colorado.",
            icono: "musica",
            destacado: true,
            enlace: { texto: "Entradas y localidades", url: "./#concierto" }
          },
          {
            hora: "22:30",
            titulo: "Quema del tradicional castillo",
            icono: "fuegos"
          }
        ]
      },
      {
        fecha: "2026-10-25",
        actividades: [
          {
            hora: "15:00",
            titulo: "Refacción para el ganadero",
            detalle: "Cortesía de José Adelmo Rosales, en el Estadio Comunal.",
            icono: "cafe"
          },
          {
            hora: "16:00",
            titulo: "Desfile hípico",
            imagen: { ruta: "assets/img/programa/desfile-hipico.webp", ancho: 426, alto: 190, alt: "Desfile hípico Barranco Colorado, San Jorge" },
            detalle: "Recorriendo las principales calles de San Jorge y Barranco Colorado.",
            icono: "caballo",
            destacado: true
          },
          {
            hora: "19:00",
            titulo: "Cena para el ganadero",
            detalle: "Cortesía de la Municipalidad de San Jorge, en el Estadio Comunal.",
            icono: "cena"
          },
          {
            hora: "20:00",
            titulo: "Gran concierto con Banda Vega de Luis Vega",
            imagen: { ruta: "assets/img/programa/banda-vega.webp", ancho: 450, alto: 190, alt: "Banda Vega de Luis Vega" },
            detalle: "En plaza San Rafael. Gracias a la Municipalidad de San Jorge.",
            icono: "musica",
            destacado: true
          }
        ]
      }
    ],

    // Franja final, con el escudo, como en la sección de las reinas
    patrocinio: {
      antes: "Gracias al patrocinio de",
      nombre: "Lic. David Trujillo",
      despues: "Alcalde municipal, su honorable Concejo Municipal y la Municipalidad de",
      lugar: "San Jorge"
    },

    // Última página del programa oficial
    agradecimientos: [
      "Cerveza Gallo",
      "Cooperativa MICOOPE",
      "Agua Pura el Petón",
      "Banrural",
      "José Adelmo Rosales Salguero",
      "Sergio Ventura",
      "Amarilis Trabanino",
      "Transportes Nohely",
      "Tiendas Belikyn",
      "Hencer Oliva",
      "Kelyn Trabanino",
      "Luis Curin"
    ],
    cocode: [
      "Carlos Iván Granados",
      "Mario Flores Cruz",
      "Taty de la Peña",
      "Julio Trujillo",
      "Nilson Rosales",
      "Miguel Ángel"
    ]
  },

  /* ---------- Noticias del COCODE (sección "noticias" de la portada) ----------
   * Publicaciones de la página de Facebook del COCODE con el plugin de
   * página de Meta (Page Plugin). url: dirección pública de la página.
   */
  cocode: {
    nombre: "COCODE Barranco Colorado",
    url: "https://www.facebook.com/profile.php?id=61576769459995",
    texto: "Avisos y novedades de nuestra comunidad, directo desde la página del COCODE."
  },

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
