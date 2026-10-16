(function () {
  "use strict";

  /* ── Stock : une étiquette par voiture ─────────────────── */

  var cars = (window.AUTOCAPITAL_CARS || []).slice();
  var liste = document.getElementById("etiquettes");
  var filtres = document.getElementById("filtres");
  var compteur = document.getElementById("parc-nombre");

  var nf = new Intl.NumberFormat("de-CH");

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // Plus chère d'abord, les voitures sans prix à la fin.
  cars.sort(function (a, b) {
    var pa = typeof a.prix === "number" ? a.prix : -1;
    var pb = typeof b.prix === "number" ? b.prix : -1;
    return pb - pa;
  });

  function fiche(label, valeur) {
    var row = el("div");
    row.appendChild(el("dt", null, label));
    row.appendChild(el("dd", null, valeur));
    return row;
  }

  function mailto(car) {
    var nom = car.marque + " " + car.modele + (car.annee ? " (" + car.annee + ")" : "");
    var sujet = "Autocapital : " + nom;
    var corps = "Bonjour,\n\nJe suis intéressé par la voiture suivante : " + nom + ". Est-elle toujours disponible ?\n\nMerci.";
    return "mailto:info@autocapital.ch?subject=" + encodeURIComponent(sujet) + "&body=" + encodeURIComponent(corps);
  }

  function etiquette(car) {
    var li = el("li", "tag" + (car.vendu ? " tag--vendu" : ""));
    li.setAttribute("data-marque", car.marque);

    var swing = el("div", "tag__balancier");
    swing.appendChild(el("span", "tag__ficelle"));
    swing.appendChild(el("span", "tag__oeil"));

    var carte = el("article", "tag__carte");
    carte.appendChild(el("p", "tag__marque", car.marque));
    carte.appendChild(el("h3", "tag__modele", car.modele));
    carte.appendChild(el("p", "tag__version", car.version || ""));

    var dl = el("dl", "tag__fiche");
    if (car.annee) dl.appendChild(fiche("Année", car.annee));
    if (typeof car.km === "number") dl.appendChild(fiche("Kilométrage", nf.format(car.km) + " km"));
    if (dl.children.length) carte.appendChild(dl);

    var prix = el("p", "tag__prix");
    if (typeof car.prix === "number") {
      prix.appendChild(el("span", "tag__devise", "CHF"));
      prix.appendChild(el("span", "tag__montant", nf.format(car.prix)));
    } else {
      prix.appendChild(el("span", "tag__montant tag__montant--demande", "Prix sur demande"));
    }
    carte.appendChild(prix);

    if (car.vendu) {
      carte.appendChild(el("span", "tag__vendu", "Vendue"));
    } else {
      var a = el("a", "tag__action", "Demander cette voiture");
      a.href = mailto(car);
      a.setAttribute("aria-label", "Demander cette voiture : " + car.marque + " " + car.modele);
      carte.appendChild(a);
    }

    swing.appendChild(carte);
    li.appendChild(swing);
    return li;
  }

  function afficherNombre(n) {
    if (compteur) compteur.textContent = n + (n > 1 ? " voitures" : " voiture");
  }

  if (liste && cars.length) {
    var noscript = liste.querySelector("noscript");
    if (noscript) noscript.remove();

    cars.forEach(function (c) { liste.appendChild(etiquette(c)); });
    afficherNombre(cars.length);

    // Filtres par marque, dans l'ordre du nombre de voitures.
    var parMarque = {};
    cars.forEach(function (c) { parMarque[c.marque] = (parMarque[c.marque] || 0) + 1; });
    var marques = Object.keys(parMarque).sort(function (a, b) { return parMarque[b] - parMarque[a] || a.localeCompare(b); });

    function bouton(label, n, valeur) {
      var b = el("button", "filtre");
      b.type = "button";
      b.setAttribute("data-valeur", valeur);
      b.setAttribute("aria-pressed", valeur === "" ? "true" : "false");
      b.appendChild(document.createTextNode(label));
      b.appendChild(el("span", "filtre__n", String(n)));
      return b;
    }

    if (filtres && marques.length > 1) {
      filtres.appendChild(bouton("Toutes", cars.length, ""));
      marques.forEach(function (m) { filtres.appendChild(bouton(m, parMarque[m], m)); });

      filtres.addEventListener("click", function (e) {
        var b = e.target.closest(".filtre");
        if (!b) return;
        var valeur = b.getAttribute("data-valeur");
        Array.prototype.forEach.call(filtres.children, function (x) {
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
        });
        var visibles = 0;
        Array.prototype.forEach.call(liste.children, function (li) {
          var ok = valeur === "" || li.getAttribute("data-marque") === valeur;
          li.hidden = !ok;
          if (ok) visibles++;
        });
        afficherNombre(visibles);
      });
    }
  }

  /* ── Statut d'ouverture, à l'heure de Zurich ───────────── */

  // [À CONFIRMER] horaires relevés sur local.ch. Minutes depuis minuit.
  var HORAIRES = {
    1: [[480, 720], [810, 1110]],
    2: [[480, 720], [810, 1110]],
    3: [[480, 720], [810, 1110]],
    4: [[480, 720], [810, 1110]],
    5: [[480, 720], [810, 1110]],
    6: [[540, 720]],
    0: []
  };
  var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var CODE = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function maintenant() {
    try {
      var parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Zurich", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
      }).formatToParts(new Date());
      var o = {};
      parts.forEach(function (p) { o[p.type] = p.value; });
      return { jour: CODE[o.weekday], min: parseInt(o.hour, 10) * 60 + parseInt(o.minute, 10) };
    } catch (e) {
      var d = new Date();
      return { jour: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function heure(m) {
    var h = Math.floor(m / 60), mm = m % 60;
    return h + "h" + (mm < 10 ? "0" : "") + mm;
  }

  function prochaineOuverture(jour, min) {
    var restants = HORAIRES[jour].filter(function (c) { return c[0] > min; });
    if (restants.length) return { quand: "aujourd'hui", debut: restants[0][0] };
    for (var i = 1; i <= 7; i++) {
      var j = (jour + i) % 7;
      if (HORAIRES[j].length) {
        return { quand: i === 1 ? "demain" : JOURS[j], debut: HORAIRES[j][0][0] };
      }
    }
    return null;
  }

  function statut() {
    var n = maintenant();
    var creneau = HORAIRES[n.jour].filter(function (c) { return n.min >= c[0] && n.min < c[1]; })[0];
    var etat, texte;
    if (creneau) {
      etat = "ouvert";
      texte = "Ouvert, jusqu'à " + heure(creneau[1]);
    } else {
      var p = prochaineOuverture(n.jour, n.min);
      etat = "ferme";
      texte = p ? "Fermé, réouverture " + p.quand + " à " + heure(p.debut) : "Fermé";
    }

    Array.prototype.forEach.call(document.querySelectorAll("[data-statut]"), function (node) {
      node.removeAttribute("data-vide");
      node.setAttribute("data-etat", etat);
      var t = node.querySelector(".statut__texte");
      if (t) t.textContent = texte;
    });

    Array.prototype.forEach.call(document.querySelectorAll(".horaires tr[data-jour]"), function (tr) {
      tr.classList.toggle("est-aujourdhui", parseInt(tr.getAttribute("data-jour"), 10) === n.jour);
    });
  }

  statut();
  setInterval(statut, 60000);

  /* ── Bouton d'appel mobile : visible une fois le hero passé ── */

  var hero = document.getElementById("haut");
  var appel = document.querySelector(".appel-fixe");
  if (hero && appel && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      appel.classList.toggle("est-visible", !entries[0].isIntersecting);
    }, { threshold: 0.15 }).observe(hero);
  } else if (appel) {
    appel.classList.add("est-visible");
  }

  var annee = document.getElementById("annee");
  if (annee) annee.textContent = new Date().getFullYear();
})();
