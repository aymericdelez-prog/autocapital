/*
  Stock Autocapital.
  Un seul endroit à modifier pour ajouter, retirer ou marquer une voiture vendue.

  Champs :
    marque, modele  (obligatoires)
    version         (optionnel, ex. "3.9 V8")
    annee           (optionnel, "07.2018")
    km              (optionnel, nombre)
    prix            (optionnel, nombre en CHF ; absent = "Prix sur demande")
    vendu           (optionnel, true = affichée comme vendue)

  [À CONFIRMER] Données relevées sur Comparis, à valider voiture par voiture
  avec Autocapital (disponibilité, prix, année, kilométrage) avant mise en ligne.
*/
window.AUTOCAPITAL_CARS = [
  { marque: "Ferrari", modele: "488 Pista Spider", version: "3.9 V8", annee: "03.2021", km: 15700, prix: 579900 },
  { marque: "Ferrari", modele: "488 Pista", version: "3.9 V8", prix: 490000 },
  { marque: "Ferrari", modele: "GTC4Lusso", annee: "07.2018", km: 23000, prix: 219000 },
  { marque: "Ferrari", modele: "California", version: "3.9 V8 T", annee: "04.2016", km: 46000, prix: 134900 },
  { marque: "Porsche", modele: "911 Carrera GTS", annee: "12.2017", km: 37020, prix: 119800 },
  { marque: "Audi", modele: "RS6 Avant", version: "4.0 TFSI V8 quattro", annee: "03.2020", km: 132900, prix: 79900 },
  { marque: "Toyota", modele: "GR Yaris", version: "1.6 GR Sport", annee: "06.2022", km: 6000, prix: 55000 },
  { marque: "Mercedes-Benz", modele: "SL 320", version: "Special Edition", annee: "08.1998", km: 59050, prix: 49900 },
  { marque: "Porsche", modele: "911 Carrera S", annee: "01.2005", km: 95200, prix: 46800 },
  { marque: "BMW", modele: "M4 Coupé", version: "DKG", annee: "01.2015", km: 142000, prix: 39900 }
];
