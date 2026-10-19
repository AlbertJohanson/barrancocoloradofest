/**
 * Dibujos de San Rafael Arcángel y de la iglesia de Barranco Colorado.
 * Los usan los fuegos artificiales de la portada (intro.js) y los
 * fuegos pequeños del programa (fuegos.js): se dibujan en un lienzo
 * oculto y se convierten en chispas.
 */
(function () {
  "use strict";

  /* =========================================================
   * Dibujo de la iglesia (espacio de 200 × 140)
   * Se dibuja en un lienzo oculto y se convierte en puntos.
   * ======================================================= */

  var CREMA = "#FFF4DA";
  var AZUL = "#3D95FF";
  var ORO = "#FFC62E";

  function arco(c, x, y, w, h) {
    c.moveTo(x, y + h);
    c.lineTo(x, y + w / 2);
    c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0);
    c.lineTo(x + w, y + h);
    c.closePath();
  }

  function figura(c, trazar, relleno) {
    c.beginPath();
    trazar();
    c.fillStyle = relleno;
    c.fill();
    c.strokeStyle = AZUL;
    c.stroke();
  }

  function cruz(c, x, y, alto) {
    c.fillStyle = ORO;
    c.fillRect(x - 1.8, y, 3.6, alto);
    c.fillRect(x - 7, y + alto * 0.28, 14, 3.6);
  }

  function dibujarIglesia(c, grosor) {
    c.lineJoin = "round";
    c.lineWidth = grosor;

    // Cuerpo central y frontón superior
    figura(c, function () { c.rect(54, 70, 92, 70); }, CREMA);
    figura(c, function () {
      c.moveTo(66, 72); c.lineTo(66, 40); c.lineTo(100, 25);
      c.lineTo(134, 40); c.lineTo(134, 72); c.closePath();
    }, CREMA);

    // Torres con campanario
    [0, 146].forEach(function (x) {
      figura(c, function () { c.rect(x + 2, 36, 50, 104); }, CREMA);
      figura(c, function () { c.rect(x - 1, 29, 56, 8); }, AZUL);
      figura(c, function () {
        c.moveTo(x + 8, 29); c.lineTo(x + 27, 19); c.lineTo(x + 46, 29); c.closePath();
      }, CREMA);
    });

    // Frontón del cuerpo bajo
    c.beginPath();
    c.moveTo(56, 106); c.lineTo(100, 84); c.lineTo(144, 106);
    c.strokeStyle = AZUL;
    c.stroke();

    // Aberturas: se recortan para que se vean como huecos
    var aberturas = [
      [13, 44, 26, 34], [159, 44, 26, 34],   // campanarios
      [19, 98, 16, 24], [165, 98, 16, 24],   // ventanas de las torres
      [71, 46, 16, 22], [92, 43, 16, 25], [113, 46, 16, 22], // nichos
      [88, 114, 24, 26]                      // puerta
    ];
    c.save();
    c.globalCompositeOperation = "destination-out";
    aberturas.forEach(function (a) { c.beginPath(); arco(c, a[0], a[1], a[2], a[3]); c.fill(); });
    c.restore();
    c.strokeStyle = AZUL;
    aberturas.forEach(function (a) { c.beginPath(); arco(c, a[0], a[1], a[2], a[3]); c.stroke(); });

    // Campanas
    c.fillStyle = ORO;
    [26, 172].forEach(function (x) {
      c.beginPath();
      c.moveTo(x - 7, 70); c.quadraticCurveTo(x - 6, 56, x, 55);
      c.quadraticCurveTo(x + 6, 56, x + 7, 70); c.closePath();
      c.fill();
    });

    // Santos en los nichos
    [[79, 58], [100, 56], [121, 58]].forEach(function (p) {
      c.beginPath();
      c.ellipse(p[0], p[1], 3, 7, 0, 0, Math.PI * 2);
      c.fill();
    });

    // Alas doradas de San Rafael sobre el frontón
    c.beginPath();
    c.moveTo(100, 80); c.lineTo(88, 74); c.lineTo(93, 81); c.closePath();
    c.moveTo(100, 80); c.lineTo(112, 74); c.lineTo(107, 81); c.closePath();
    c.fill();

    // Reloj
    c.beginPath();
    c.arc(100, 97, 7, 0, Math.PI * 2);
    c.fillStyle = CREMA;
    c.fill();
    c.strokeStyle = AZUL;
    c.stroke();

    // Cruces
    cruz(c, 27, 1, 18);
    cruz(c, 173, 1, 18);
    cruz(c, 100, 0, 25);
  }

  /* =========================================================
   * Dibujo de San Rafael Arcángel (espacio de 120 × 200)
   * Basado en la imagen venerada: aureola y corona doradas, alas
   * doradas, capa bordada, túnica azul con medallones, pez en una
   * mano y bastón de peregrino con calabaza en la otra.
   * ======================================================= */

  var R = {
    oro: "#FFC62E",
    oroClaro: "#FFE08A",
    manto: "#2A5CF0",
    tunica: "#4A86FF",
    manga: "#A6DBFF",
    piel: "#F2B98C",
    cabello: "#8A5530",
    pez: "#E8F1FF",
    baston: "#7CD957",
    calabaza: "#FF6A2B"
  };

  function elipse(c, x, y, rx, ry, rot, color) {
    c.beginPath();
    c.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2);
    c.fillStyle = color;
    c.fill();
  }

  /** Ala izquierda; alta y afilada, llega a la altura de la cabeza. */
  function ala(c) {
    c.beginPath();
    c.moveTo(45, 70);
    c.quadraticCurveTo(30, 50, 26, 18);   // borde interior hasta la punta
    c.quadraticCurveTo(12, 48, 16, 80);   // borde exterior
    c.quadraticCurveTo(20, 100, 32, 116); // punta inferior
    c.quadraticCurveTo(38, 98, 45, 88);
    c.closePath();
    c.fillStyle = R.oro;
    c.fill();
    // Plumas
    c.strokeStyle = R.oroClaro;
    c.beginPath();
    c.moveTo(42, 72); c.quadraticCurveTo(28, 56, 25, 30);
    c.moveTo(41, 82); c.quadraticCurveTo(24, 72, 19, 54);
    c.moveTo(40, 92); c.quadraticCurveTo(24, 90, 18, 76);
    c.moveTo(38, 102); c.quadraticCurveTo(28, 104, 23, 96);
    c.stroke();
  }

  function dibujarRafael(c, grosor) {
    c.lineJoin = "round";
    c.lineCap = "round";
    c.lineWidth = grosor;

    // Aureola
    c.beginPath();
    c.arc(60, 30, 21, 0, Math.PI * 2);
    c.strokeStyle = R.oro;
    c.lineWidth = Math.max(grosor, 3.5);
    c.stroke();
    c.lineWidth = grosor;

    // Alas (la derecha es el reflejo de la izquierda)
    ala(c);
    c.save();
    c.translate(120, 0);
    c.scale(-1, 1);
    ala(c);
    c.restore();

    // Manto azul que cae hasta el suelo
    c.beginPath();
    c.moveTo(44, 66);
    c.quadraticCurveTo(34, 130, 22, 196);
    c.lineTo(98, 196);
    c.quadraticCurveTo(86, 130, 76, 66);
    c.closePath();
    c.fillStyle = R.manto;
    c.fill();

    // Cabello, rostro y corona
    elipse(c, 60, 40, 11.5, 13, 0, R.cabello);
    c.fillStyle = R.cabello;
    c.fillRect(48.5, 40, 23, 15);
    elipse(c, 60, 40, 7.5, 9, 0, R.piel);
    c.fillStyle = R.oro;
    c.fillRect(51, 27, 18, 5);
    [53, 60, 67].forEach(function (x) {
      c.beginPath();
      c.moveTo(x - 3, 27); c.lineTo(x, 21); c.lineTo(x + 3, 27);
      c.closePath();
      c.fill();
    });

    // Mangas celestes
    elipse(c, 41, 92, 7, 12, -0.2, R.manga);
    elipse(c, 79, 90, 7, 12, 0.2, R.manga);

    // Túnica azul
    c.beginPath();
    c.moveTo(46, 80); c.lineTo(74, 80); c.lineTo(79, 148); c.lineTo(41, 148);
    c.closePath();
    c.fillStyle = R.tunica;
    c.fill();

    // Capa dorada bordada sobre los hombros
    c.beginPath();
    c.moveTo(40, 62);
    c.quadraticCurveTo(60, 54, 80, 62);
    c.lineTo(83, 84);
    c.quadraticCurveTo(60, 90, 37, 84);
    c.closePath();
    c.fillStyle = R.oroClaro;
    c.fill();
    c.strokeStyle = R.oro;
    c.stroke();
    c.fillStyle = R.tunica;
    c.fillRect(58, 60, 4, 27);
    elipse(c, 60, 57, 8, 3, 0, "#FFFFFF"); // cuello

    // Cinturón, medallones y bastilla dorados
    c.fillStyle = R.oro;
    c.fillRect(45, 95, 30, 4.5);
    [[51, 108], [69, 108], [60, 118], [50, 129], [70, 129], [60, 138]].forEach(function (p) {
      elipse(c, p[0], p[1], 3, 3, 0, R.oro);
    });
    c.fillStyle = R.oro;
    c.fillRect(41, 143, 38, 6);

    // Piernas y sandalias
    c.fillStyle = R.piel;
    c.fillRect(51, 149, 6, 29);
    c.fillRect(63, 149, 6, 29);
    c.fillStyle = R.oro;
    c.fillRect(49.5, 177, 9, 4);
    c.fillRect(61.5, 177, 9, 4);

    // Pez en la mano derecha
    elipse(c, 45, 124, 4.2, 14, 0.08, R.pez);
    c.beginPath();
    c.moveTo(44, 136); c.lineTo(38, 147); c.lineTo(50, 146);
    c.closePath();
    c.fillStyle = R.pez;
    c.fill();
    elipse(c, 46, 104, 3.6, 3.6, 0, R.piel);

    // Bastón de peregrino con calabaza en la mano izquierda
    c.beginPath();
    c.moveTo(91, 6); c.lineTo(74, 198);
    c.strokeStyle = R.baston;
    c.lineWidth = Math.max(grosor, 2.6);
    c.stroke();
    elipse(c, 88.6, 33, 4.2, 6.5, 0, R.calabaza);
    elipse(c, 89.2, 24.5, 2.4, 2.8, 0, R.calabaza);
    elipse(c, 84, 100, 3.6, 3.6, 0, R.piel);
  }

  window.FERIA_FIGURAS = {
    // ancho × alto del espacio de cada dibujo
    iglesia: { dibujar: dibujarIglesia, ancho: 200, alto: 140 },
    rafael: { dibujar: dibujarRafael, ancho: 120, alto: 200 }
  };
})();
