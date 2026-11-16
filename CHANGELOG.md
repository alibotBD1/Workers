# Journal des versions

## 1.1.0 — Comptes, back office et collecte IA

- **Comptes candidats et recruteurs** (Firebase) : e-mail ou Google, profil, CV, consentements
- Inscription obligatoire pour postuler, sauvegarder une offre ou publier
- **Espace candidat** : candidatures suivies en temps réel, profil et CV, export et suppression des données
- **Espace recruteur** : publication d'offres (vérifiées avant mise en ligne), candidatures reçues avec CV, suivi des statuts
- **Back office `/admin`** : tableau de bord, utilisateurs (fiche, suspension, « se connecter en tant que », export des contacts ayant consenti), modération des offres, sources de collecte, revenus, journal d'audit
- **Collecte IA des offres** : robot planifié toutes les 6 h (GitHub Actions + API Claude), respect de robots.txt, fiches reformulées, lien vers l'annonce d'origine
- **Recette** : branche `recette` déployée sur un projet Firebase de test
- Mesure d'audience Google Analytics après consentement, provenance des inscrits (utm)
- Politique de confidentialité et conditions d'utilisation (loi camerounaise n° 2024/017)
- Règles de sécurité Firestore et Storage, Cloud Function de connexion « en tant que »

## 1.0.0 — Première release

Première version publique de **Workers**, le job board du groupe Melanyne.

- Recherche d'offres avec filtres (ville/région, contrat, secteur, salaire FCFA, télétravail, date) et tri
- Fiche offre complète : missions, profil, compétences, avantages, partage WhatsApp
- Espace candidat sans compte : profil, score de compatibilité, favoris, alertes, suivi des candidatures
- Annuaire et fiches entreprises
- Baromètre des salaires et simulateur « Où vous situez-vous ? »
- Six guides de conseils carrière
- Espace recruteurs : publication gratuite via formulaire GitHub Issues ou e-mail, publication automatique après validation
- Déploiement automatique sur GitHub Pages
