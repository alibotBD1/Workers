# Workers · par Melanyne

> Groupe **Melanyne** — version 1.1.0

**Le job board camerounais.** Offres d'emploi à Douala, Yaoundé et dans les 10 régions : CDI, CDD, stages, alternance, freelance.

Site 100 % statique, hébergé gratuitement sur **GitHub Pages**. Pas de serveur, pas de base de données, pas d'abonnement.

## Fonctionnalités

| Pour les candidats | Pour les recruteurs |
| --- | --- |
| Recherche plein texte + filtres (ville/région, contrat, secteur, salaire, télétravail, date) | Formulaire de publication gratuit |
| **Score de compatibilité** calculé à partir du profil, sans IA ni serveur | Publication automatique via GitHub Issues après validation |
| Favoris, alertes, suivi des candidatures (envoyée → entretien → offre) | Données structurées *JobPosting* pour Google |
| Baromètre des salaires en FCFA et simulateur « où vous situez-vous ? » | Fiche entreprise avec toutes les offres |
| Conseils carrière (CV, entretien, salaire, arnaques…) | |
| Partage WhatsApp, mobile d'abord, installable (manifest) | |

Les données personnelles des candidats restent **dans leur navigateur** (localStorage).

## Démarrer en local

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de production dans dist/
```

Node.js 20 ou plus récent.

## Mise en ligne sur GitHub Pages

1. Dans le dépôt : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
2. Poussez sur `main` : le workflow `Déployer sur GitHub Pages` construit et publie le site sur `https://<compte>.github.io/<nom-du-depot>/`.

### Domaine `workers-melanyne.com`

1. Chez le registrar du domaine, créez ces enregistrements DNS :

   | Type | Nom | Valeur |
   | --- | --- | --- |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | CNAME | `www` | `alibotbd1.github.io` |

2. **Settings → Pages → Custom domain** : `workers-melanyne.com`, puis cochez **Enforce HTTPS** quand GitHub le propose.
3. **Settings → Secrets and variables → Actions → Variables** : `BASE_PATH` = `/` et `SITE_URL` = `https://workers-melanyne.com`.
4. Relancez le workflow « Déployer sur GitHub Pages ».

Contact et expéditeur : `recrutement@workers-melanyne.com` (modifiable dans `src/lib/config.ts`). Site du groupe : [melanyne.com](https://melanyne.com).

## Comptes, back office et collecte IA (v1.1)

Sans configuration Firebase, le site fonctionne comme avant, en mode local et sans comptes. Pour activer les comptes :

### 1. Créer les projets Firebase (une fois)

Sur [console.firebase.google.com](https://console.firebase.google.com), créez **deux projets** : `workers-recette` et `workers-prod`. Dans chacun :

1. **Authentication → Sign-in method** : activez *E-mail/Mot de passe* et *Google*. Dans *Settings → Authorized domains*, ajoutez `alibotbd1.github.io` et `workers-melanyne.com`.
2. **Firestore Database → Créer** : mode production, région **africa-south1 (Johannesburg)**.
3. **Storage → Commencer**.
4. **Paramètres du projet → Vos applications → Web** : créez une application ; notez la configuration (`apiKey`, `authDomain`…). Activez Google Analytics si vous voulez les statistiques d'audience.
5. **Paramètres du projet → Comptes de service → Générer une nouvelle clé privée** : un fichier JSON (secret !).

### 2. Configurer GitHub

**Settings → Environments** : créez `production` et `recette`. Dans chacun :

| Type | Nom | Valeur |
| --- | --- | --- |
| Variable | `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID` | configuration web du projet |
| Secret | `FIREBASE_SERVICE_ACCOUNT` | contenu du fichier JSON du compte de service |
| Secret (production) | `ANTHROPIC_API_KEY` | clé API Claude pour la collecte IA |

### 3. Déployer règles, index et fonctions

**Actions → « Firebase production » → Run workflow** (cible `recette`, puis `production`). Cochez « Cloud Functions » pour la connexion « en tant que » : elle exige la formule **Blaze** (paiement à l'usage) de Firebase.

### 4. Nommer les administrateurs

Créez votre compte sur le site, puis :

```bash
FIREBASE_SERVICE_ACCOUNT="$(cat cle.json)" npm run admin:ajouter -- vous@melanyne.com
```

Reconnectez-vous : le lien **Admin** apparaît dans l'en-tête (`/admin`).

### Recette

Créez la branche `recette` : chaque push la déploie sur `https://workers-recette.web.app`, avec ses propres comptes et données de test (bandeau violet). Validez-y les changements, puis fusionnez dans `main` pour la production.

### Collecte IA

Dans le back office, **Collecte IA → Ajouter une source** : page carrières d'un employeur ou flux RSS public. Cochez « conditions vérifiées » seulement si le site autorise la réutilisation de ses offres. Le robot passe toutes les 6 heures (ou via *Actions → Collecte IA → Run workflow*), respecte robots.txt, reformule chaque annonce avec Claude et renvoie vers l'annonce d'origine. Les offres arrivent dans **Offres → À valider**.

Test local sans base : `SOURCES_FICHIER=sources.json DRY_RUN=1 ANTHROPIC_API_KEY=… npm run collecte`.

### Données personnelles

Données collectées, finalités et durées : `src/pages/PageLegale.tsx` (page `/confidentialite`). Avant la mise en production : autorisation préalable de l'Autorité de protection des données à caractère personnel (loi n° 2024/017), y compris pour le stockage hors du Cameroun, et relecture juridique des textes.

## Publier une offre via GitHub (sans comptes)

```
Recruteur ──► page /recruteurs ──► issue GitHub pré-remplie (label « offre »)
                                              │
              Mainteneur relit et ajoute le label « offre-validée »
                                              │
     Action « Publier une offre validée » ──► src/data/offres/<slug>.json
                                              │
                         commit + redéploiement automatique du site
```

À faire une fois : créer les labels **`offre`** et **`offre-validée`** (Issues → Labels).

Pour ajouter une offre à la main, déposez un fichier JSON dans `src/data/offres/` (voir le type `Offre` dans `src/data/types.ts`). Les offres expirées (`expireLe`) disparaissent automatiquement.

## Mode démonstration

Par défaut, le site affiche des offres et entreprises **fictives** (bandeau en haut de page) pour montrer le rendu. Pour ne garder que les vraies offres, créez la variable de dépôt `VITE_DEMO` = `false`.

## Structure

```
src/
  data/          taxonomie (villes, secteurs…), entreprises et offres de démo, articles, offres réelles (offres/*.json)
  lib/           recherche & score de compatibilité, espace candidat (localStorage), formats FCFA/dates
  components/    en-tête, pied de page, carte d'offre, barre de recherche, fenêtre de candidature…
  pages/         Accueil, Offres, Offre, Entreprises, Salaires, Conseils, Mon espace, Recruteurs…
scripts/         conversion issue → offre, post-build GitHub Pages
.github/         workflows de déploiement et de publication, formulaire d'issue
```

**Stack** : React 18, TypeScript, Vite, Tailwind CSS, React Router, Lucide. Polices Bricolage Grotesque & Inter auto-hébergées.

## À compléter avant le lancement

- Mentions légales (raison sociale, NIU, responsable de publication) dans `src/pages/PageLegale.tsx`
- Adresse de contact dans `src/lib/config.ts`
