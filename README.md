# Feria Patronal Barranco Colorado 2026

Sitio informativo de la Feria Patronal de Barranco Colorado, San Jorge, Zacapa, en honor a San Rafael Arcángel.

Hecho solo con HTML, CSS y JavaScript, sin frameworks ni instalación.

## Estructura

```
index.html                 Página
css/styles.css             Estilos
js/data.js                 ← CONTENIDO Y CONFIGURACIÓN (lo único que se edita)
js/main.js                 Lógica: contador y generación de secciones
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

## Botón "Ver actividades"

Está en la portada, pero **todavía no hace nada**, porque la agenda de actividades es parte de una etapa posterior. Para conectarlo, busca `data-accion="actividades"` en `index.html`.

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
| `pop` | Crece con rebote | Logo de Flor de la Feria, logo de Discovery, botón "Ver afiche", logos de patrocinadores |
| `escribir` | Se descubre de izquierda a derecha | "de candidatas a Flor de la Feria", "Señoritas representantes…" |
| `desplegar` | Se despliega como una cinta | Cinta "Barranco Colorado" |
| `columpio` | Baja balanceándose | Cinta "Gran baile" |
| `voltear` | Se levanta girando en 3D | Panel del evento, tarjetas de candidatas |

Además, los íconos del evento rebotan al aparecer. En cada tarjeta, la banda "Candidata" se despliega, un destello dorado cruza la foto y luego aparece el nombre.

- Con "reducir movimiento" activado, todo se ve de forma normal, sin efectos.
- La intensidad del oscurecido y del alejamiento de la portada se ajusta en `actualizar()` de `escenas.js`.
- **Rendimiento:** en navegadores con `animation-timeline` (Chrome/Edge 115+, Safari 26+) el oscurecido de la sección de atrás y el alejamiento de la portada son animaciones CSS ligadas al desplazamiento, que corren fuera del hilo principal; en los demás, un `requestAnimationFrame` cambia solo `opacity` y `transform`. Durante el desplazamiento no se cambian clases que afecten a secciones enteras (antes `.is-pausada *` y `visibility: hidden` recalculaban y repintaban toda la sección a mitad de la transición): las pausas se deciden con `IntersectionObserver` y solo afectan a la flecha "Desliza", al acercamiento de las fotos, al carrusel y a los fuegos. Tampoco se vuelve a medir cuando la barra del navegador móvil aparece o se esconde. Las imágenes se decodifican con `decoding="async"`. No hay animaciones en bucle salvo la flecha "Desliza" y el acercamiento de las fotos de la portada (ambas solo `transform` y en pausa cuando la portada está cubierta); el corazón del pie late 3 veces. Para nuevas decoraciones, conviene evitar animaciones infinitas, `filter: blur()`, `backdrop-filter`, `mix-blend-mode`, animar `filter` o `box-shadow`, y selectores como `.clase *` que se activen al desplazarse. Cada `@keyframes` debe tener un nombre único (si se repite, el último reemplaza al primero en todo el sitio).

## Mostrar u ocultar secciones

En `data.js`, `secciones` activa o desactiva cada sección sin borrar su contenido:

```js
secciones: { noticias: false, flores: true, patrocinadores: true }
```

Ahora **Noticias está oculta**. El indicador "Desliza" de la portada lleva siempre a la primera sección visible.

## Noticias

Copia las imágenes a `assets/img/noticias/` y agrega registros al arreglo `noticias`.

**Ejemplo, no es contenido real:**

```js
noticias: [
  {
    id: "noticia-001",
    titulo: "Título de la noticia",
    descripcion: "Resumen breve de una o dos oraciones.",
    fechaPublicacion: "2026-10-01",
    imagen: "assets/img/noticias/afiche-001.jpg", // opcional
    alt: "Descripción del afiche",
    publicado: true
  }
]
```

- **Ordenar:** las noticias se ordenan solas por `fechaPublicacion`, de la más reciente a la más antigua.
- **Ocultar:** cambia `publicado` a `false`. No hace falta borrar el registro.
- **Editar:** cambia los textos y guarda.
- **Afiches:** se muestran completos, sin recortes. Al hacer clic o presionar Enter se amplían; se cierran con Escape.
- Si no hay noticias publicadas, se muestra "Pronto compartiremos las novedades de nuestra feria".

## Flores de la Feria

El diseño toma como base el afiche de coronación: un escenario de noche con reflectores, en fucsia y dorado.

- **Logo:** `assets/img/flores/logo-flor-de-la-feria.webp` (emblema "Flor de la Feria, Barranco Colorado 2026" con corona y flores, fondo transparente, 720 × 720). El original está en PNG con el mismo nombre.
- **Afiche completo:** `assets/img/flores/afiche-coronacion.jpg`. Se abre con el botón "Ver afiche".
- **Datos del evento:** están en `coronacion` en `data.js`: fecha, lugar, hora, entrada, baile y afiche. Lo que se deje en `""` no se muestra.
- **Gran baile:** dentro del panel del evento hay una pista con reflectores de colores, un ecualizador (fijo) y el logo de Discovery Móvil Disco (`assets/img/baile/`). Debajo está el botón "Ver afiche". Los textos y el logo están en `coronacion.baile` en `data.js`. Si el logo no carga, se muestra el nombre del grupo en texto.
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

## Antes de publicar

- [ ] Confirmar la hora oficial del contador.
- [x] Número de WhatsApp en `contacto.whatsapp`: +502 3598 5883.
- [ ] Revisar el contenido real de noticias, flores, patrocinadores y contacto.
- [ ] Confirmar el permiso de uso de los logos de los patrocinadores y si alguno quiere enlace a su sitio.

## Próximas etapas (no incluidas)

Integración con Google Sheets, mapa interactivo, historia del pueblo y del patrono, y agenda completa de actividades.

El contenido ya está separado en `data.js`. Más adelante se podrá cargar desde otra fuente sin cambiar el diseño.
