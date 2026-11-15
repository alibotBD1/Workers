# Workers · par Melanyne

> Première release du groupe **Melanyne** — version 1.0.0

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

## Publier une offre (flux recruteur)

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
