# Autocapital, niveau 1 (vitrine)

Site vitrine statique pour Autocapital Guercioni & Mottier (Hauterive NE), avec une section voitures sous forme d'étiquettes de clé.

## Structure

```
autocapital/
├── ressources/
│   ├── entreprise.md        ← contenu source, points [À CONFIRMER]
│   └── images/              ← photos sources (récupérées sur le site actuel)
└── website/                 ← racine de déploiement
    ├── index.html
    ├── css/style.css
    ├── js/cars.js           ← LE stock : un objet par voiture
    ├── js/main.js           ← rendu des étiquettes, filtre, statut d'ouverture
    └── images/*.webp
```

## Modifier le stock

Éditer `website/js/cars.js` : ajouter, retirer une ligne, ou mettre `vendu: true`. Les champs `annee`, `km`, `prix` sont optionnels.

## Prévisualiser

```bash
npx serve websites/autocapital/website -l 8080
```

## Avant mise en ligne

- Valider le stock, les prix, années et kilométrages avec Autocapital (relevés Comparis).
- Confirmer l'e-mail `info@autocapital.ch` et les horaires (source : local.ch).
- Remplacer les photos de la galerie actuelle (2016) par des photos récentes.
- Photos par voiture : absentes pour l'instant, la grille fonctionne sans.

## Déploiement

Non déployé. Procédure standard du workspace : repo GitHub `autocapital`, projet Vercel, Root Directory `website`.
