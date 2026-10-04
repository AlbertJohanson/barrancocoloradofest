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

  /* ---------- Noticias ----------
   * Campos: id, titulo, descripcion, fechaPublicacion, imagen, alt, publicado
   * Solo se muestran las que tienen publicado: true, de la más reciente
   * a la más antigua. Ver ejemplos en README.md.
   */
  noticias: [],

  /* ---------- Coronación de Flor de la Feria ----------
   * Datos del afiche oficial. Dejar "" lo que no aplique; no se mostrará.
   */
  coronacion: {
    fecha: "Domingo 04 de octubre",
    lugar: "Salón de la Comunidad",
    hora: "A partir de 7:00 PM",
    entrada: "Entrada Q20.00",
    baile: {
      antes: "Después",
      titulo: "Gran baile",
      amenizaPor: "Amenizado por",
      grupo: "Discovery Móvil Disco",
      logo: "assets/img/baile/discovery-movil-disco.webp"
    },
    afiche: "assets/img/flores/afiche-coronacion.jpg",
    aficheAlt: "Afiche de la presentación y coronación de candidatas a Flor de la Feria Barranco Colorado 2026"
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
   *         encuadre (opcional, ej. "50% 20%"), publicado
   */
  flores: [
    {
      nombre: "Ana Rosa de Paz Súchite",
      grupo: "senoritas",
      titulo: "Candidata",
      foto: "assets/img/flores/ana-rosa-de-paz-suchite.webp",
      alt: "Ana Rosa de Paz Súchite, candidata a Flor de la Feria 2026",
      publicado: true
    },
    {
      nombre: "Kimberly Damacio Ortíz",
      grupo: "senoritas",
      titulo: "Candidata",
      foto: "assets/img/flores/kimberly-damacio-ortiz.webp",
      alt: "Kimberly Damacio Ortíz, candidata a Flor de la Feria 2026",
      publicado: true
    },
    {
      nombre: "Linzeth Fajardo Acevedo",
      grupo: "senoritas",
      titulo: "Candidata",
      foto: "assets/img/flores/linzeth-fajardo-acevedo.webp",
      alt: "Linzeth Fajardo Acevedo, candidata a Flor de la Feria 2026",
      publicado: true
    },
    {
      nombre: "Sofía Guadalupe Espino Archila",
      grupo: "ninas",
      titulo: "Candidata",
      foto: "assets/img/flores/sofia-guadalupe-espino-archila.webp",
      alt: "Sofía Guadalupe Espino Archila, niña representante de la belleza 2026",
      publicado: true
    },
    {
      nombre: "Emely Daniela Villagran Pérez",
      grupo: "ninas",
      titulo: "Candidata",
      foto: "assets/img/flores/emely-daniela-villagran-perez.webp",
      alt: "Emely Daniela Villagran Pérez, niña representante de la belleza 2026",
      publicado: true
    },
    {
      nombre: "Ayelen Alessandra Rosales",
      grupo: "ninas",
      titulo: "Candidata",
      foto: "assets/img/flores/ayelen-alessandra-rosales.webp",
      alt: "Ayelen Alessandra Rosales, niña representante de la belleza 2026",
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
