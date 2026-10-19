# Feria Patronal Barranco Colorado 2026

Sitio informativo de la Feria Patronal de Barranco Colorado, San Jorge, Zacapa, en honor a San Rafael Arcángel.

Hecho solo con HTML, CSS y JavaScript, sin frameworks ni instalación.

## Estructura

```
index.html                 Página principal
programa.html              Programa oficial, día por día
css/styles.css             Estilos
js/data.js                 ← CONTENIDO Y CONFIGURACIÓN (lo único que se edita)
js/main.js                 Lógica: contador y generación de secciones
js/programa.js             Programa: "Hoy en la feria" (portada) y página del programa
js/figuras.js              Dibujos de San Rafael y la iglesia para los fuegos artificiales
js/fuegos.js               Fuegos pequeños del programa (San Rafael y la iglesia)
js/pie.js                  Pie de página (portada y programa): patrocinar, redes, contacto y mapa
js/reinas.js               "Nuestras reinas" (portada y programa) y visor de fotos y afiches
js/intro.js                Presentación con fuegos artificiales de la portada
js/escenas.js              Transición entre secciones al desplazarse
assets/img/logo/           Logo de la feria
assets/img/portada/        Fotos del carrusel de fondo de la portada
assets/img/noticias/       Imágenes y afiches de noticias
assets/img/flores/         Fotografías de las Flores de la Feria
assets/img/patrocinadores/ Logos de patrocinadores
```

## Abrir el proyecto

- **Directo:** doble clic en `index.html`.
- **Servidor local (opcional):** en la carpeta del proyecto ejecuta `python3 -m http.server 8000` y abre `http://localhost:8000`.

El contenido está en `js/data.js` y no se lee con `fetch`, así que funciona de las dos formas.

## Logo

La portada muestra solo el logo y la cuenta regresiva. El sitio no tiene encabezado ni menú.

- El logo está en `assets/img/logo/logo.webp`. El original en PNG se conserva como `logo.png`.
- Para reemplazarlo, copia el archivo nuevo y actualiza `logo.ruta`, `logo.ancho` y `logo.alto` en `data.js`. El ancho y el alto deben ser las medidas reales en píxeles para conservar la proporción.
- Si el logo no carga, se muestra el nombre de la feria en texto.

Tipografías del sitio, elegidas por su parecido con las del logo y cargadas desde Google Fonts:

- **Lilita One:** títulos y números del contador.
- **Kaushan Script:** textos pequeños sobre los títulos de sección.
- **Titan One:** números del contador, con el estilo de "Colorado" del logo (degradado amarillo a naranja, contorno blanco y borde azul marino).

## Fotos de fondo de la portada

Detrás del logo hay un carrusel con las fotos de la iglesia y del altar de San Rafael. Las fotos cambian con un fundido y un acercamiento lento (se pausa cuando la portada está cubierta), y llevan encima una capa azul marino para que el logo se lea bien.

Para agregar, quitar o cambiar fotos, edita `portada` en `data.js`:

```js
portada: {
  intervalo: 7000, // milisegundos por foto
  fotos: [
    { ruta: "assets/img/portada/iglesia.webp", encuadre: "50% 40%" },
    { ruta: "assets/img/portada/altar.webp", encuadre: "50% 35%" }
  ]
}
```

- Se recomiendan fotos horizontales de unos 1920 px de ancho, en formato WebP o JPG.
- `encuadre` define qué parte de la foto se prioriza en pantallas angostas: posición horizontal y vertical.
- Con "reducir movimiento" activado, se muestra solo la primera foto, fija.

## Barra fija de la portada

Al bajar de la portada aparece arriba una pastilla (15 px de relleno) con el logo de la feria, la **cuenta regresiva** compacta (la misma hora de `cuentaRegresiva.fechaObjetivo`) y el botón dorado **"Ver programa"** (`programa.html`); al volver arriba se esconde. Cuando termina el conteo, en lugar de la cuenta dice **"¡Bienvenido a Barranco Colorado!"** en cursiva dorada (se edita en `index.html`, `data-barra-bienvenida`). Tocar el logo regresa al inicio. Se decide con `IntersectionObserver` (sin escuchar el desplazamiento) y solo se anima `transform`. Está en `index.html` (`.barra-sitio`) y `initBarraSitio()` en `main.js`.

## Botón "Ver actividades"

Es un enlace al programa (`programa.html`). Durante la feria abre en el día de hoy (`programa.html#hoy`).

## Portada durante la feria

Cuando termina la cuenta regresiva y hoy hay actividades en el programa, la portada cambia:

- **Teléfonos (una columna):** logo, el mensaje "¡La feria ha comenzado, acompáñanos!" (con el estilo del contador; se edita en `cuentaRegresiva.mensajeFinal`), el botón "Ver actividades" y debajo el recuadro **Hoy en la feria** con las actividades del día.
- **Desde 900 px (dos columnas):** logo, mensaje y botón a la izquierda; las actividades de hoy a la derecha.
- La fecha "Inicia el 21 de octubre" se oculta.
- En la agenda de hoy, la actividad que empezó hace menos de 2 horas lleva **Ahora**, la siguiente **A continuación** y las anteriores se atenúan. Se actualiza cada minuto y cambia sola de día.
- Si la página está abierta cuando termina el conteo, cambia en ese momento. Los días sin programa (antes o después de la feria) la portada queda como siempre.

## Presentación con fuegos artificiales

Al entrar al sitio ocurre lo siguiente (`js/intro.js`), en unos 8 segundos:

1. Un cohete estalla y sus chispas dibujan a **San Rafael Arcángel**, basado en la imagen venerada: aureola, corona, alas doradas, capa bordada, túnica azul con medallones, el pez y el bastón con la calabaza.
2. San Rafael explota y otro cohete forma, en grande, **la iglesia de Barranco Colorado**.
3. La iglesia explota y, tras el destello, aparecen **el logo** y luego **el contador**.
4. Siguen unos 4 segundos más de fuegos detrás del logo y, cuando caen las últimas chispas, el lienzo se apaga y se oculta (no queda en bucle).

Al pie de la portada, el indicador "Desliza" con una flecha animada lleva a la primera sección visible.

- Tocar la pantalla o presionar una tecla salta la presentación.
- Si el dispositivo tiene activado "reducir movimiento", el logo y el contador se muestran directamente.
- Los fuegos se pausan cuando la portada no está en pantalla.
- Los tiempos, colores y el tamaño de las figuras se ajustan en la sección "Configuración" de `intro.js`. El orden de las figuras está en la lista `FIGURAS`.

## Programa oficial (`programa.html`)

Página propia con todas las actividades de la semana, tomada del programa oficial de la Municipalidad de San Jorge. Se edita en `programa` (`data.js`). Enlace directo: https://barrancocoloradofest.com/programa.html (el enlace anterior `#actividades` de la portada lleva aquí).

**Colores:** la cabecera y toda la sección de actividades usan el azul de la portada de inicio (`#0A3CB0` de base con el brillo `#1466F5` arriba; el filtro de días en `--marino`) con filetes dorados; "Nuestras reinas", los agradecimientos y el pie conservan la noche morada y fucsia, igual que en inicio.

**Letras:** títulos en **Cinzel** (como "FERIA PATRONAL" del afiche; se carga solo en esta página) y los textos (detalles de cada actividad, lugar de la cabecera) en la cursiva de los nombres de los agradecimientos (Kaushan Script), un poco más grande para leerse bien.

**Desplazamiento como en la portada (`js/escenas.js`):** la cabecera, las actividades y los agradecimientos son escenas: cada una se queda fija y la siguiente sube encima como una hoja curva, mientras la de atrás se oscurece. La cabecera no se oscurece (se quitó su velo en `styles.css`, `.programa-portada > .escena__velo`); solo se aleja un poco. Las tarjetas y los títulos de cada día aparecen al llegar a la pantalla. Lo que se aleja en la primera escena se marca con `data-escena-contenido` (en la portada de inicio es `.hero__inner`).

**Nuestras reinas:** entre las actividades y los agradecimientos, la misma sección de la portada (logo de Flor de la Feria y las candidatas por grupo, con corona y título), pero sin la franja de agradecimiento a la municipalidad. Las dos páginas la arman con `js/reinas.js` desde `flores` y `floresGrupos` en `data.js`; tocar una foto la amplía.

**Serenata a nuestras reinas:** lleva la foto de la Flor de la Feria (`assets/img/programa/flor-de-la-feria.webp`, recortada de su foto oficial) con la etiqueta "Nuestras reinas" en lugar de "Actividad principal" (campo `etiqueta`). Las fotos casi cuadradas se muestran con alto limitado y, en escritorio, más angostas que los banners.

**Pie de página:** el mismo de la portada (logo, "Quiero ser patrocinador", redes, contacto y mapa), que arma `js/pie.js` en las dos páginas.

- **Cabecera:** la foto de la iglesia de fondo (`assets/img/portada/iglesia.webp`) con una capa azul, "Programa oficial", las fechas (`programa.fechasTexto`) y **San Rafael Arcángel** en un arco dorado (recortado de la portada del programa: `assets/img/programa/san-rafael.webp`).
- **Filtro por día:** botones "Toda la semana", "Mié 21"… que se quedan arriba al bajar. Antes y después de la feria abre en "Toda la semana"; durante la feria abre en **hoy** (el botón lleva la marca "Hoy" y los días pasados se atenúan). Cada día tiene enlace propio: `programa.html#dia-2026-10-24`.
- **Tarjetas en cuadrícula:** una columna en teléfonos y dos desde 640 px. Una tarjeta que quedaría sola en su fila ocupa todo el ancho, para no dejar huecos sin cambiar el orden por hora.
- **Actividades principales:** las que tienen `imagen` van en una tarjeta grande con borde dorado, la etiqueta "Actividad principal" y su banner. Los banners de los grupos y del desfile hípico están recortados del programa oficial (`assets/img/programa/`); la procesión usa la foto del altar de San Rafael. Desde 900 px, los banners muy anchos van arriba y los demás a un lado.
- **Hoy:** en las tarjetas del día, **Ahora** (fucsia) y **A continuación**; las anteriores se atenúan.
- **Agradecimientos especiales:** al final, con el estilo del cierre de "Nuestras reinas": la franja con el escudo para el alcalde, el Concejo Municipal y la Municipalidad (`programa.patrocinio`) y los demás nombres en cursiva dorada (`programa.agradecimientos` y `programa.cocode`).

### Neón de San Rafael y la iglesia (`js/neon.js`)

A los lados de las actividades flotan San Rafael y la iglesia en contorno de neón (celeste, dorado y fucsia), alternando lado y figura de arriba abajo. Son los mismos dibujos de los fuegos (`js/figuras.js`): se toman sus bordes y el brillo se pinta una sola vez en un lienzo.

- Se encienden con un parpadeo al llegar a la pantalla y luego flotan suavemente (solo `transform`; en pausa cuando la sección no se ve).
- Desde 1180 px van en el centro de los márgenes; en pantallas más angostas quedan en los bordes, tenues y detrás de las tarjetas.
- La cantidad depende del alto de la sección (una cada ~650 px), así que se ajusta al filtrar por día. Figuras, tamaños y colores en `MODELOS`.
- Con "reducir movimiento" se ven fijas.

**Filtro de días:** encima va el llamado "Filtra las actividades: toca un día para ver solo las de ese día". Al inicio es una pastilla redondeada; cuando queda fija arriba al bajar, se vuelve una barra normal de lado a lado, sin esquinas (`programa.js` pone `.is-fija`), y vuelve a ser pastilla al subir.

### Fuegos pequeños y animaciones (`js/fuegos.js`)

- **Cabecera:** al abrir la página suben dos cohetes que estallan y forman, en chiquito, a **San Rafael** y **la iglesia** a los lados del arco (en escritorio, entre el título y el arco). Se quedan titilando un momento, se deshacen en chispas y siguen tres fuegos normales. Tocar el arco de San Rafael lanza otro.
- **Agradecimientos:** cuando el título llega a la pantalla se escribe de izquierda a derecha y estallan la iglesia y San Rafael a sus lados (en teléfonos, la iglesia sobre el título). La franja del escudo sube, el escudo crece con rebote, "Lic. David Trujillo" se escribe, "SAN JORGE" aparece al final y los nombres van apareciendo uno tras otro.
- Son los mismos dibujos de la presentación de la portada (`js/figuras.js`), así que si se cambia un dibujo, cambia en los dos lugares.
- **Rendimiento:** todo ocurre una sola vez. El lienzo de los fuegos está detrás del texto, se pausa fuera de pantalla, tiene un límite de chispas y se oculta al terminar. Las apariciones usan solo `opacity`, `transform` y `clip-path`. Con "reducir movimiento" no hay fuegos ni animaciones.
- Tamaños, tiempos y lugares se ajustan en la sección "Configuración" y en `lugares()` de `fuegos.js`.

Cada actividad:

```js
{
  hora: "20:00",           // 24 h. Medianoche = "24:00" (queda al final de ese día)
  titulo: "Gran concierto internacional",
  detalle: "Con Los Caminantes, …",                 // opcional
  icono: "musica",         // desfile, discurso, musica, marimba, corona, iglesia,
                           // ninos, moto, fuegos, cafe, caballo, cena
  destacado: true,         // opcional: ícono dorado en "Hoy en la feria" de la portada
  etiqueta: "Nuestras reinas", // opcional: texto sobre el título de una principal
  imagen: { ruta: "assets/img/programa/concierto-internacional.webp", ancho: 892, alto: 166, alt: "…" },
                           // opcional: la vuelve actividad principal (ancho y alto reales)
  enlace: { texto: "Entradas y localidades", url: "./#concierto" } // opcional
}
```

- Las actividades se ordenan solas por hora.
- **Cambio de día:** hasta `programa.cambioDeDia` (ahora 5:00 a. m.) se sigue mostrando el día anterior, para que la serenata de medianoche siga en "Hoy".
- Toda la hora se calcula en hora de Guatemala, sin importar la zona del visitante.

**Para probar cómo se ve un día de feria**, agrega `?simular=` a la dirección con la fecha y hora de Guatemala; afecta a la portada, al contador y al programa:

- `index.html?simular=2026-10-21T19:50` → portada de feria, "Acto de inauguración" en **Ahora**.
- `programa.html?simular=2026-10-22T00:30` → todavía es el miércoles: la serenata a las reinas en **Ahora**.

Los afiches del antiguo carrusel siguen en `assets/img/actividades/` por si se quieren volver a usar; ya no se cargan en el sitio.

## Hora del contador ⚠️

**La hora oficial está pendiente. Confírmala antes de publicar.**

Ahora se usa provisionalmente la medianoche del 21 de octubre:

```js
cuentaRegresiva: {
  fechaObjetivo: "2026-10-21T00:00:00-06:00",
  mensajeFinal: "¡La feria ha comenzado!"
}
```

Para cambiarla, modifica solo la hora y conserva `-06:00`, que corresponde a la hora de Guatemala. Por ejemplo, para las 6:00 p. m.:

`"2026-10-21T18:00:00-06:00"`

El sitio no muestra esta hora como oficial. En la portada solo aparece "Inicia el 21 de octubre de 2026", que se edita en `feria.fechaInicioTexto`.

**Para probar el final del conteo**, cambia temporalmente la fecha por una pasada, como `"2020-01-01T00:00:00-06:00"`, y recarga la página. Debe aparecer "¡La feria ha comenzado!".

## Transición entre secciones

`js/escenas.js` controla esta transición. Al bajar, cada sección se queda fija cuando se llega a su final. La siguiente sube encima como una hoja con bordes curvos, mientras la de atrás se encoge y se oscurece. Cada elemento con `data-revelar` tiene su propia entrada cuando aparece en pantalla. `--i` define el orden: cada paso agrega 120 ms de retraso.

| Valor | Efecto | Dónde se usa |
|---|---|---|
| *(vacío)* | Sube y aparece | Título, datos del evento, textos |
| `pop` | Crece con rebote | Logo de Flor de la Feria, logos de patrocinadores |
| `escribir` | Se descubre de izquierda a derecha | "Nuestras reinas", "Señoritas representantes…", títulos bajo las coronas |
| `desplegar` | Se despliega como una cinta | Cinta "Barranco Colorado" |
| `columpio` | Baja balanceándose | Coronas de las reinas |
| `voltear` | Se levanta girando en 3D | Tarjetas de candidatas y reinas |

En cada tarjeta, la banda "Candidata" se despliega, un destello dorado cruza la foto y luego aparece el nombre. En las reinas, la corona baja balanceándose y brilla una vez, luego se escribe su título y se levanta la tarjeta. Todas las animaciones ocurren una sola vez, sin bucle.

- Con "reducir movimiento" activado, todo se ve de forma normal, sin efectos.
- La intensidad del oscurecido y del alejamiento de la portada se ajusta en `actualizar()` de `escenas.js`.
- **Rendimiento:** en navegadores con `animation-timeline` (Chrome/Edge 115+, Safari 26+) el oscurecido de la sección de atrás y el alejamiento de la portada son animaciones CSS ligadas al desplazamiento, que corren fuera del hilo principal; en los demás, un `requestAnimationFrame` cambia solo `opacity` y `transform`. Durante el desplazamiento no se cambian clases que afecten a secciones enteras (antes `.is-pausada *` y `visibility: hidden` recalculaban y repintaban toda la sección a mitad de la transición): las pausas se deciden con `IntersectionObserver` y solo afectan a la flecha "Desliza", al acercamiento de las fotos, al carrusel y a los fuegos. Tampoco se vuelve a medir cuando la barra del navegador móvil aparece o se esconde. Las imágenes se decodifican con `decoding="async"`. No hay animaciones en bucle salvo la flecha "Desliza" y el acercamiento de las fotos de la portada (ambas solo `transform` y en pausa cuando la portada está cubierta); el corazón del pie late 3 veces. Para nuevas decoraciones, conviene evitar animaciones infinitas, `filter: blur()`, `backdrop-filter`, `mix-blend-mode`, animar `filter` o `box-shadow`, y selectores como `.clase *` que se activen al desplazarse. Cada `@keyframes` debe tener un nombre único (si se repite, el último reemplaza al primero en todo el sitio).

## Mostrar u ocultar secciones

En `data.js`, `secciones` activa o desactiva cada sección sin borrar su contenido:

```js
secciones: { evento: true, noticias: true, flores: true, patrocinadores: true }
```

El indicador "Desliza" de la portada lleva siempre a la primera sección visible.

## Gran concierto (evento destacado)

Sección después de la portada, con estilo de fuego tomado del logo del grupo. Todo se edita en `evento` (`data.js`); si falta el logo o la fecha, la sección no se muestra.

- **Grupos:** logo del grupo principal + `pais` (`"mx"` o `"gt"`, muestra bandera y nombre). `invitados`: nombre, país y logo. Si un logo no carga, se muestra el nombre en texto.
- **Cuenta regresiva propia:** apunta a `fecha` (con `-06:00`). Usa clases distintas a las de la portada (`evento-reloj`) para no heredar la animación de la presentación.
- **Entradas y puntos de venta:** `entradas` (la de `destacada: true` va en dorado) y `puntosVenta`.
- **Video:** en bucle, sin controles. Arranca solo cuando llega a la pantalla y se pausa al salir o al quedar cubierto por la sección siguiente. Intenta sonar con audio; si el navegador lo bloquea (la persona aún no ha tocado la página), suena silenciado con el botón dorado "Activar sonido". Tocar el video lo pausa o lo reanuda. Con "reducir movimiento" o ahorro de datos no arranca solo. Archivo: `assets/video/los-cms-promo.mp4` (comprimido a ~8 MB; `preload="none"`).
- **Cómo llegar:** `ubicacion` (punto exacto del Estadio Comunal) arma los botones de Waze y Google Maps.
- **Mapa de localidades:** plano interactivo dibujado en SVG desde `localidades` (según el plano del organizador): escenario, bocinas, mesas VIP a ambos lados del pasillo y General 1 / General 2. Tocar una zona o mesa muestra nombre, precio y descripción; los botones de zona sirven también con teclado. `mesasIzquierda` / `mesasDerecha` son las filas de mesas (8 por fila, la primera junto al escenario); `0` = mesa sin número. En teléfonos el plano se desplaza de lado y empieza centrado en el escenario.
- **Logos:** `assets/img/evento/`. Se recortaron del video promocional (no hay versiones oficiales en internet); conviene reemplazarlos por los originales si el organizador los consigue.

## Noticias del COCODE

Sección después del gran concierto con las publicaciones de la página de Facebook del COCODE (**Cocode Barranco Colorado 2025**), usando el plugin de página de Meta (Page Plugin) en su versión de iframe: no carga el SDK de Facebook en el resto del sitio. Se edita en `cocode` (`data.js`):

```js
cocode: {
  nombre: "COCODE Barranco Colorado",
  url: "https://www.facebook.com/profile.php?id=61576769459995",
  texto: "Avisos y novedades de nuestra comunidad, directo desde la página del COCODE."
}
```

- El plugin se agrega solo cuando la sección se acerca a la pantalla. Mide entre 180 y 500 px de ancho (el máximo que permite Facebook) y va en un marco dorado; el alto se reserva para que la página no salte.
- Debajo, el botón **"Ver en Facebook"** abre la página por si el plugin no carga (bloqueadores, Facebook caído).
- Sin `url`, la sección no se muestra. Para ocultarla sin borrar nada: `secciones.noticias: false`.
- **Ojo:** Facebook decide qué muestra el plugin. En pruebas sin sesión iniciada aparece el encabezado de la página (nombre, seguidores, botón Seguir) pero no las publicaciones; con sesión de Facebook en el navegador suelen verse. No se puede cambiar el estilo de las publicaciones, solo el marco.

## Flores de la Feria

El diseño toma como base el afiche de coronación: un escenario de noche con reflectores, en fucsia y dorado.

- **Encabezado:** el logo `assets/img/flores/logo-flor-de-la-feria.webp` (720 × 720, fondo transparente; original en PNG) y el título "Nuestras reinas" (en `index.html`). El panel con los datos de la coronación y el gran baile se quitó tras la coronación.
- **Reinas:** una candidata con `corona` (ej. `corona: "Flor de la Feria"`) lleva una corona dorada y ese título sobre su tarjeta, en lugar de la banda. Todas las coronadas se ven igual.
- **Agradecimiento:** al final de la sección hay una franja como la del afiche, con el escudo de la Municipalidad de San Jorge y el texto "Con el apoyo de El alcalde David Trujillo y la Municipalidad de San Jorge". Se edita en `agradecimiento` en `data.js`. El escudo sin fondo está en `assets/img/municipalidad/escudo-san-jorge.webp` (también en PNG) y el original en `logo-original.jpg`.
- **Sin candidatas:** se muestra la silueta de la reina (`silueta-reina.webp`) con el texto "Pronto conocerás a las candidatas…". Esa silueta también sustituye la foto de una candidata que no tenga foto.

Las candidatas se muestran en grupos, cada uno con su título. Los grupos se definen en `floresGrupos` en `data.js`, y cada candidata indica el suyo con `grupo`:

- **Señoritas representantes de la belleza** (`"senoritas"`): Ana Rosa de Paz Súchite, Kimberly Damacio Ortíz y Linzeth Fajardo Acevedo.
- **Niñas representantes de la belleza** (`"ninas"`): Sofía Guadalupe Espino Archila, Emely Daniela Villagran Pérez y Ayelen Alessandra Rosales.

Un grupo sin candidatas no se muestra. Si una candidata no tiene `grupo`, o tiene uno que no existe, aparece en el primer grupo.

Si una foto no viene en proporción 2:3, se completa arriba y abajo con un fondo difuminado de la misma foto para no recortar el nombre impreso. Así se preparó la foto de Ayelen, que venía en 4:5.

Copia las fotos de las candidatas a `assets/img/flores/`. Se recomiendan fotos verticales en proporción 2:3, como las oficiales, que ya traen el nombre impreso. Se muestran completas y se amplían al tocarlas. El `titulo` aparece en la banda fucsia cruzada sobre la foto, por ejemplo "Candidata".

**Ejemplo, no es contenido real:**

```js
flores: [
  {
    nombre: "Nombre completo",
    titulo: "Categoría oficial",
    descripcion: "Texto breve opcional.",
    foto: "assets/img/flores/nombre.jpg",
    alt: "Retrato de Nombre completo",
    encuadre: "50% 20%", // opcional: posición horizontal y vertical
    publicado: true
  }
]
```

`encuadre` ajusta qué parte de la foto queda visible. Si una foto corta el rostro, baja el segundo valor, por ejemplo `"50% 10%"`.

Si el arreglo está vacío, se muestra "Pronto conocerás a nuestras Flores de la Feria 2026".

## Patrocinadores

Patrocinadores actuales, en este orden:

| Patrocinador | Logo | Color de la tarjeta | Origen del logo |
|---|---|---|---|
| Cerveza Gallo | `assets/img/patrocinadores/gallo.webp` | Rojo `#C8102E` | Wikimedia Commons ("CervezaGalloWordmark.png", dominio público), sin el fondo rojo |
| Cooperativas MICOOPE | `assets/img/patrocinadores/micoope.webp` | Blanco | Sitio oficial micoope.com.gt, ya con fondo transparente |
| Municipalidad de San Jorge | `assets/img/municipalidad/escudo-san-jorge.webp` | Azul marino `#0B2B6E` | Logo enviado por la feria, sin fondo |

Para agregar uno, copia el logo a `assets/img/patrocinadores/` (PNG o WebP con fondo transparente) y agrega un registro:

```js
{ nombre: "Nombre del negocio", logo: "assets/img/patrocinadores/negocio.webp", fondo: "#FFFFFF", url: "https://...", orden: 4 }
```

- `orden` define la posición, de menor a mayor.
- `fondo` es opcional y pinta la tarjeta con el color de la marca. Sirve para logos blancos como el de Gallo. Sin `fondo`, la tarjeta es blanca.
- Si `url` está vacía, la tarjeta no tiene enlace. Los enlaces se abren en otra pestaña.
- El nombre aparece debajo de cada tarjeta. Los logos no se recortan ni se deforman, y si uno no carga, queda la tarjeta con el nombre.

La sección usa el mismo estilo de noche, fucsia y dorado que el agradecimiento de las Flores ("Agradecemos a nuestros Patrocinadores por apoyar nuestra celebración").

### Invitación a patrocinar

Al final de la sección hay una franja "¿Quieres patrocinar la feria?" con un botón que abre WhatsApp con un mensaje ya escrito. Los textos se editan en `patrocinar` en `data.js`; el número es el de `contacto.whatsapp`. **Si ese número está vacío, la franja no se muestra.**

## Redes sociales y contacto

```js
contacto: {
  telefono: "",
  whatsapp: "", // solo números con código de país, ej. "502XXXXXXXX"
  correo: ""
},
redes: [
  { nombre: "Facebook", url: "https://..." }
]
```

Solo aparece lo que tenga datos. Si todo está vacío, el pie de página muestra únicamente el nombre y la ubicación.

## Pie de página y mapa

El pie continúa el fondo de noche de Patrocinadores: logo de la feria, botón "Quiero ser patrocinador" (WhatsApp, aparece cuando `contacto.whatsapp` tiene número), redes y contacto, y un mapa de Google Maps con la ubicación de Barranco Colorado.

```js
ubicacion: { lat: 14.9236932, lng: -89.5971415, zoom: 14 }
```

Se usan coordenadas porque hay otro "Barranco Colorado" en Teculután. Para apuntar a la iglesia o al campo de la feria, en Google Maps haz clic derecho en el punto y copia las coordenadas. Si se borran, el mapa no se muestra.

El crédito "Hecho con ♥ por AJ Trujillo Dev" enlaza a https://albertrujillo.dev/ (logo en `assets/img/credito/trujillo-dev.webp`).

## Enlace directo, vista previa al compartir e ícono

- **Enlace directo a las reinas:** https://barrancocoloradofest.com/#reinas abre la página directamente en la sección. Igual para el concierto: https://barrancocoloradofest.com/#concierto (también funciona `#baile`). `#actividades` (el carrusel que se quitó) lleva a `programa.html`. `#reinas` no es un id: el salto lo hace `initEnlaceDirecto()` en `main.js` (las secciones fijas de `escenas.js` confunden el salto nativo). Para agregar otro enlace, añade una entrada a `ENLACES`.
- **Vista previa al compartir:** etiquetas Open Graph y Twitter en el `<head>` de `index.html`, con la imagen general `assets/img/compartir/feria-2026.jpg` (1200 × 630: logo y fecha de inicio, estilo de la portada). La anterior, `reinas-2026.jpg`, queda guardada por si se quiere volver a usar. Las URL deben ser absolutas. Si cambias la imagen, usa otro nombre de archivo: Facebook y WhatsApp guardan la anterior en caché (en Facebook se puede refrescar con el Sharing Debugger).
- **Ícono de la pestaña:** `assets/img/icono/` (32, 48 y 180 px para iPhone), hechos a partir de `assets/img/logo/logo.png`.

## Antes de publicar

- [ ] Confirmar la hora oficial del contador.
- [x] Número de WhatsApp en `contacto.whatsapp`: +502 3598 5883.
- [ ] Revisar el contenido real de noticias, flores, patrocinadores y contacto.
- [ ] Confirmar el permiso de uso de los logos de los patrocinadores y si alguno quiere enlace a su sitio.

## Próximas etapas (no incluidas)

Integración con Google Sheets, mapa interactivo e historia del pueblo y del patrono.

El contenido ya está separado en `data.js`. Más adelante se podrá cargar desde otra fuente sin cambiar el diseño.
