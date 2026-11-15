// Génère les offres de démonstration (fictives) à partir de modèles.
// Les dates sont calculées par rapport au jour courant pour que la
// démo reste toujours « fraîche ».
import type { Offre } from "./types";
import type { Contrat, Niveau, Teletravail } from "./taxonomie";
import { ENTREPRISES_DEMO } from "./entreprises";
import { slugify } from "@/lib/format";

interface Modele {
  titre: string;
  secteur: string;
  niveau: Niveau;
  contrat: Contrat;
  teletravail?: Teletravail;
  salaire?: [number, number]; // en milliers de FCFA
  competences: string[];
  resume: string;
  missions: string[];
  profil: string[];
}

const M: Modele[] = [
  // ---- Tech
  { titre: "Développeur·se Full-Stack React / Node.js", secteur: "tech", niveau: "Confirmé", contrat: "CDI", teletravail: "Hybride", salaire: [650, 1100], competences: ["React", "Node.js", "TypeScript", "PostgreSQL", "Git"], resume: "Rejoignez l'équipe produit pour concevoir des applications web utilisées par des centaines de milliers de Camerounais.", missions: ["Développer de nouvelles fonctionnalités front et back", "Participer aux revues de code et aux choix d'architecture", "Optimiser les performances pour les connexions 3G", "Accompagner les profils juniors"], profil: ["3 ans d'expérience minimum en développement web", "Maîtrise de React et de Node.js", "Bonne compréhension des API REST", "Anglais technique lu"] },
  { titre: "Développeur·se mobile Flutter", secteur: "tech", niveau: "Confirmé", contrat: "CDI", teletravail: "Hybride", salaire: [600, 1000], competences: ["Flutter", "Dart", "Firebase", "API REST"], resume: "Vous construirez des applications mobiles rapides et légères, pensées pour tous les smartphones.", missions: ["Concevoir et publier des applications Android et iOS", "Intégrer les paiements Mobile Money", "Mettre en place les tests automatisés", "Travailler main dans la main avec les designers"], profil: ["2 ans d'expérience sur Flutter", "Applications publiées sur les stores", "Sens du détail et de l'expérience utilisateur"] },
  { titre: "Data Analyst", secteur: "tech", niveau: "Débutant", contrat: "CDI", teletravail: "Hybride", salaire: [400, 650], competences: ["SQL", "Python", "Power BI", "Excel"], resume: "Transformez les données en décisions pour nos clients de la banque et du commerce.", missions: ["Construire des tableaux de bord", "Analyser les parcours utilisateurs", "Présenter les résultats aux équipes métier"], profil: ["Bac+3/5 en statistiques, économie ou informatique", "Bonne maîtrise de SQL", "Esprit de synthèse"] },
  { titre: "Product Designer UX/UI", secteur: "tech", niveau: "Confirmé", contrat: "CDI", teletravail: "Télétravail", salaire: [550, 900], competences: ["Figma", "UX research", "Design system", "Prototypage"], resume: "Concevez des parcours simples pour des utilisateurs qui découvrent parfois le numérique.", missions: ["Mener des entretiens utilisateurs à Douala et Yaoundé", "Créer maquettes et prototypes", "Faire vivre le design system"], profil: ["Portfolio démontrant une démarche UX", "Maîtrise de Figma", "Empathie et curiosité"] },
  { titre: "Ingénieur·e DevOps / Cloud", secteur: "tech", niveau: "Senior", contrat: "CDI", teletravail: "Hybride", salaire: [900, 1500], competences: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"], resume: "Garantissez la disponibilité d'une plateforme de paiement critique.", missions: ["Automatiser les déploiements", "Superviser la production 24/7", "Renforcer la sécurité de l'infrastructure"], profil: ["5 ans d'expérience en administration système", "Expérience en environnement financier appréciée"] },
  { titre: "Stage — Développement web", secteur: "tech", niveau: "Débutant", contrat: "Stage", teletravail: "Sur site", salaire: [80, 120], competences: ["HTML", "CSS", "JavaScript", "Git"], resume: "Un stage de 6 mois pour apprendre aux côtés de développeurs expérimentés.", missions: ["Participer au développement d'un site client", "Écrire des tests", "Présenter votre travail en démo"], profil: ["Étudiant·e en informatique (Bac+2 à Bac+5)", "Premiers projets personnels sur GitHub", "Envie d'apprendre"] },
  // ---- Banque
  { titre: "Chargé·e de clientèle particuliers", secteur: "banque", niveau: "Débutant", contrat: "CDI", salaire: [350, 550], competences: ["Relation client", "Vente", "Produits bancaires"], resume: "Accueillez, conseillez et fidélisez un portefeuille de clients en agence.", missions: ["Gérer un portefeuille de 400 clients", "Proposer les produits adaptés", "Atteindre les objectifs commerciaux"], profil: ["Bac+3 en banque, finance ou commerce", "Excellent relationnel", "Bilingue français-anglais apprécié"] },
  { titre: "Analyste crédit PME", secteur: "banque", niveau: "Confirmé", contrat: "CDI", salaire: [600, 900], competences: ["Analyse financière", "OHADA", "Excel", "Gestion des risques"], resume: "Évaluez les demandes de financement des PME et coopératives.", missions: ["Analyser les états financiers", "Rédiger les notes de crédit", "Rencontrer les entrepreneurs sur le terrain"], profil: ["Bac+5 en finance", "3 ans en analyse crédit", "Connaissance du référentiel OHADA"] },
  { titre: "Auditeur·rice interne", secteur: "banque", niveau: "Confirmé", contrat: "CDI", salaire: [700, 1000], competences: ["Audit", "Contrôle interne", "COBAC", "Excel"], resume: "Contribuez à la maîtrise des risques du réseau d'agences.", missions: ["Conduire des missions d'audit en agence", "Formuler des recommandations", "Suivre les plans d'action"], profil: ["Bac+5 audit / comptabilité", "Connaissance de la réglementation COBAC", "Mobilité nationale"] },
  { titre: "Comptable", secteur: "banque", niveau: "Débutant", contrat: "CDD", salaire: [300, 450], competences: ["SYSCOHADA", "Sage", "Fiscalité", "Excel"], resume: "Assurez la tenue de la comptabilité générale et les déclarations fiscales.", missions: ["Saisir et contrôler les écritures", "Préparer les déclarations DGI", "Participer aux clôtures mensuelles"], profil: ["BTS / Licence en comptabilité", "Maîtrise du SYSCOHADA révisé", "Rigueur"] },
  // ---- Télécom
  { titre: "Technicien·ne réseaux télécoms", secteur: "telecom", niveau: "Confirmé", contrat: "CDI", salaire: [350, 550], competences: ["Fibre optique", "Radio", "Énergie solaire", "Habilitation électrique"], resume: "Intervenez sur les sites télécoms pour assurer la continuité du réseau.", missions: ["Maintenance préventive et corrective des sites", "Raccordements fibre", "Rédaction des rapports d'intervention"], profil: ["BTS / DUT en électronique ou télécoms", "Permis B exigé", "Aptitude au travail en hauteur"] },
  { titre: "Ingénieur·e radio 4G/5G", secteur: "telecom", niveau: "Senior", contrat: "CDI", salaire: [1000, 1600], competences: ["LTE", "5G", "Optimisation radio", "Drive test"], resume: "Pilotez l'optimisation du réseau radio sur le Littoral et le Sud-Ouest.", missions: ["Analyser les KPI réseau", "Planifier les nouveaux sites", "Encadrer les sous-traitants"], profil: ["Ingénieur télécoms", "5 ans d'expérience en optimisation radio"] },
  { titre: "Conseiller·ère service client bilingue", secteur: "telecom", niveau: "Débutant", contrat: "CDD", salaire: [180, 260], competences: ["Relation client", "Anglais", "Écoute"], resume: "Répondez aux clients par téléphone, WhatsApp et réseaux sociaux.", missions: ["Traiter les demandes clients", "Résoudre les incidents de premier niveau", "Remonter les irritants"], profil: ["Baccalauréat minimum", "Parfaitement bilingue français-anglais", "Patience et sourire au téléphone"] },
  // ---- BTP
  { titre: "Conducteur·rice de travaux routiers", secteur: "btp", niveau: "Senior", contrat: "CDI", salaire: [900, 1400], competences: ["Génie civil", "Planification", "Management d'équipe", "AutoCAD"], resume: "Pilotez un chantier routier de 40 km dans la région de l'Est.", missions: ["Planifier et suivre l'avancement", "Encadrer 80 ouvriers et sous-traitants", "Garantir sécurité et qualité"], profil: ["Ingénieur génie civil", "7 ans d'expérience sur chantiers routiers", "Disponibilité pour vivre en base vie"] },
  { titre: "Ingénieur·e structure", secteur: "btp", niveau: "Confirmé", contrat: "CDI", teletravail: "Hybride", salaire: [700, 1100], competences: ["Robot", "Eurocodes", "Béton armé", "AutoCAD"], resume: "Dimensionnez des bâtiments résidentiels et commerciaux.", missions: ["Réaliser les notes de calcul", "Produire les plans d'exécution", "Assurer le suivi technique sur chantier"], profil: ["Diplôme d'ingénieur (ENSP, ENSTP ou équivalent)", "3 ans d'expérience en bureau d'études"] },
  { titre: "Chef·fe de chantier bâtiment", secteur: "btp", niveau: "Confirmé", contrat: "CDD", salaire: [450, 700], competences: ["Gros œuvre", "Lecture de plans", "Sécurité"], resume: "Encadrez les équipes sur un programme de 120 logements.", missions: ["Organiser le travail des équipes", "Contrôler la qualité d'exécution", "Gérer les approvisionnements"], profil: ["BTS bâtiment", "5 ans d'expérience terrain"] },
  { titre: "Alternance — Assistant·e QHSE", secteur: "btp", niveau: "Débutant", contrat: "Alternance", salaire: [100, 150], competences: ["QHSE", "Sécurité", "ISO 45001"], resume: "Une alternance pour devenir acteur de la sécurité sur nos chantiers.", missions: ["Animer les quarts d'heure sécurité", "Suivre les indicateurs QHSE", "Participer aux audits"], profil: ["Étudiant·e en Licence pro QHSE", "Goût du terrain"] },
  // ---- Agro
  { titre: "Responsable de production", secteur: "agro", niveau: "Senior", contrat: "CDI", salaire: [1000, 1500], competences: ["Agroalimentaire", "Lean", "HACCP", "Management"], resume: "Dirigez l'usine de transformation et ses 150 collaborateurs.", missions: ["Piloter la production et la maintenance", "Améliorer les rendements", "Garantir la sécurité alimentaire"], profil: ["Ingénieur agroalimentaire", "8 ans dont 3 en management d'usine"] },
  { titre: "Agronome — appui aux producteurs", secteur: "agro", niveau: "Confirmé", contrat: "CDI", salaire: [450, 700], competences: ["Agronomie", "Cacaoculture", "Formation", "Certification"], resume: "Accompagnez les coopératives pour améliorer qualité et rendements.", missions: ["Former les planteurs aux bonnes pratiques", "Suivre les parcelles certifiées", "Collecter les données terrain"], profil: ["Ingénieur agronome (FASA ou équivalent)", "Permis moto", "Langues locales appréciées"] },
  { titre: "Technicien·ne de maintenance industrielle", secteur: "agro", niveau: "Confirmé", contrat: "CDI", salaire: [350, 550], competences: ["Électromécanique", "Automatismes", "Maintenance préventive"], resume: "Maintenez en état les lignes de production.", missions: ["Diagnostiquer les pannes", "Réaliser la maintenance préventive", "Proposer des améliorations"], profil: ["BTS maintenance industrielle", "3 ans d'expérience en usine"] },
  { titre: "Contrôleur·se qualité", secteur: "agro", niveau: "Débutant", contrat: "CDD", salaire: [250, 380], competences: ["Contrôle qualité", "Laboratoire", "HACCP"], resume: "Veillez à la conformité des produits à chaque étape.", missions: ["Réaliser les analyses en laboratoire", "Tenir les registres qualité", "Alerter en cas de non-conformité"], profil: ["Licence en biochimie ou agroalimentaire", "Rigueur et organisation"] },
  // ---- Santé
  { titre: "Infirmier·ère diplômé·e d'État", secteur: "sante", niveau: "Confirmé", contrat: "CDI", salaire: [300, 450], competences: ["Soins infirmiers", "Urgences", "Travail en équipe"], resume: "Rejoignez notre service des urgences, ouvert 24h/24.", missions: ["Assurer les soins et la surveillance des patients", "Participer à l'accueil des urgences", "Assurer la traçabilité des soins"], profil: ["Diplôme d'État d'infirmier", "Inscription à l'ordre", "2 ans d'expérience"] },
  { titre: "Médecin généraliste", secteur: "sante", niveau: "Confirmé", contrat: "CDI", salaire: [1200, 1800], competences: ["Médecine générale", "Téléconsultation", "Urgences"], resume: "Consultations, gardes et téléconsultations vers nos centres partenaires.", missions: ["Assurer les consultations", "Participer aux gardes", "Mener les téléconsultations"], profil: ["Doctorat en médecine", "Inscription à l'ONMC"] },
  { titre: "Délégué·e médical·e", secteur: "sante", niveau: "Débutant", contrat: "CDI", salaire: [350, 500], competences: ["Visite médicale", "Négociation", "Pharmacologie"], resume: "Présentez nos gammes aux médecins et pharmaciens de votre secteur.", missions: ["Visiter 8 à 10 professionnels de santé par jour", "Organiser des réunions d'information", "Remonter la veille concurrentielle"], profil: ["Bac+3 scientifique", "Permis B", "Aisance relationnelle"] },
  // ---- Logistique
  { titre: "Responsable entrepôt", secteur: "logistique", niveau: "Confirmé", contrat: "CDI", salaire: [600, 900], competences: ["WMS", "Gestion de stock", "Management", "Sécurité"], resume: "Pilotez un entrepôt de 12 000 m² au cœur de la zone portuaire.", missions: ["Organiser réception, stockage et expédition", "Manager 40 caristes et agents", "Fiabiliser les inventaires"], profil: ["Bac+3/5 en logistique", "4 ans en gestion d'entrepôt"] },
  { titre: "Déclarant·e en douane", secteur: "logistique", niveau: "Confirmé", contrat: "CDI", salaire: [400, 650], competences: ["Dédouanement", "CEMAC", "Incoterms", "Sydonia"], resume: "Prenez en charge les dossiers de dédouanement import/export.", missions: ["Établir les déclarations sur Sydonia", "Suivre les dossiers avec les autorités", "Conseiller les clients"], profil: ["Formation en transit / douane", "Agrément apprécié", "3 ans d'expérience"] },
  { titre: "Chauffeur·se poids lourds", secteur: "logistique", niveau: "Confirmé", contrat: "CDI", salaire: [200, 300], competences: ["Permis C/E", "Conduite défensive", "Mécanique de base"], resume: "Transport de marchandises sur le corridor Kribi – Ngaoundéré – N'Djamena.", missions: ["Assurer les livraisons dans les délais", "Effectuer les contrôles du véhicule", "Respecter les règles de sécurité"], profil: ["Permis C et E", "5 ans d'expérience", "Casier judiciaire vierge"] },
  { titre: "Intérim — Agent·e de manutention", secteur: "logistique", niveau: "Débutant", contrat: "Intérim", salaire: [90, 120], competences: ["Manutention", "Sécurité", "Port de charges"], resume: "Missions de 1 à 3 mois sur un terminal à conteneurs.", missions: ["Charger et décharger les marchandises", "Préparer les commandes", "Respecter les consignes de sécurité"], profil: ["Bonne condition physique", "Ponctualité", "Débutants acceptés"] },
  // ---- Commerce
  { titre: "Responsable de magasin", secteur: "commerce", niveau: "Confirmé", contrat: "CDI", salaire: [500, 800], competences: ["Gestion de magasin", "Management", "Merchandising"], resume: "Prenez la tête d'un supermarché de quartier et de son équipe de 25 personnes.", missions: ["Piloter le chiffre d'affaires et la marge", "Recruter et animer l'équipe", "Garantir la qualité de l'accueil"], profil: ["3 ans en management de point de vente", "Leadership et sens du commerce"] },
  { titre: "Commercial·e terrain B2B", secteur: "commerce", niveau: "Débutant", contrat: "CDI", salaire: [250, 400], competences: ["Prospection", "Négociation", "CRM"], resume: "Développez notre réseau de revendeurs dans les quartiers de la ville.", missions: ["Prospecter boutiques et grossistes", "Négocier et suivre les commandes", "Reporter dans le CRM"], profil: ["Bac+2 en commerce", "Moto appréciée", "Résistance et persévérance"] },
  { titre: "Caissier·ère", secteur: "commerce", niveau: "Débutant", contrat: "CDD", salaire: [90, 130], competences: ["Caisse", "Accueil", "Mobile Money"], resume: "Accueillez nos clients et assurez les encaissements.", missions: ["Encaisser espèces, cartes et Mobile Money", "Tenir la caisse", "Renseigner les clients"], profil: ["Niveau BEPC/Probatoire", "Sourire et rigueur"] },
  { titre: "Community manager", secteur: "commerce", niveau: "Débutant", contrat: "Freelance", teletravail: "Télétravail", salaire: [150, 300], competences: ["Réseaux sociaux", "Canva", "Rédaction", "TikTok"], resume: "Animez nos communautés Facebook, Instagram et TikTok.", missions: ["Créer un calendrier éditorial", "Produire visuels et vidéos courtes", "Répondre aux commentaires"], profil: ["Portfolio de comptes animés", "Excellente orthographe", "Créativité"] },
  // ---- Énergie
  { titre: "Technicien·ne solaire", secteur: "energie", niveau: "Débutant", contrat: "CDI", salaire: [180, 300], competences: ["Photovoltaïque", "Électricité", "Installation"], resume: "Installez des kits et mini-réseaux solaires dans les villages du Nord.", missions: ["Installer et mettre en service les équipements", "Former les utilisateurs", "Assurer le SAV"], profil: ["CAP/BT en électricité", "Fulfuldé apprécié", "Mobilité"] },
  { titre: "Ingénieur·e HSE mines", secteur: "energie", niveau: "Senior", contrat: "CDI", salaire: [1200, 1800], competences: ["HSE", "Environnement", "ISO 14001", "Audit"], resume: "Garantissez la sécurité et la conformité environnementale du site.", missions: ["Définir la politique HSE du site", "Conduire les audits et inspections", "Dialoguer avec les communautés riveraines"], profil: ["Ingénieur HSE", "8 ans dont 3 en environnement minier"] },
  { titre: "Géologue d'exploration", secteur: "energie", niveau: "Confirmé", contrat: "CDD", salaire: [800, 1200], competences: ["Géologie", "SIG", "Cartographie", "Échantillonnage"], resume: "Campagne d'exploration de 12 mois sur le plateau de l'Adamaoua.", missions: ["Superviser les sondages", "Interpréter les données géologiques", "Rédiger les rapports"], profil: ["Master en géologie", "Expérience terrain", "Maîtrise de QGIS"] },
  // ---- Éducation
  { titre: "Enseignant·e de mathématiques (bilingue)", secteur: "education", niveau: "Confirmé", contrat: "CDI", salaire: [300, 450], competences: ["Mathématiques", "Pédagogie", "Anglais"], resume: "Enseignez les mathématiques en sections francophone et anglophone.", missions: ["Préparer et dispenser les cours", "Évaluer et suivre les élèves", "Préparer aux examens officiels"], profil: ["Licence en mathématiques", "Diplôme ENS apprécié", "Bilingue"] },
  { titre: "Formateur·rice en développement web", secteur: "education", niveau: "Confirmé", contrat: "Freelance", teletravail: "Hybride", salaire: [400, 600], competences: ["JavaScript", "Pédagogie", "React"], resume: "Formez une promotion de 30 jeunes au métier de développeur web.", missions: ["Animer les sessions de formation", "Encadrer les projets", "Évaluer les apprenants"], profil: ["3 ans d'expérience en développement", "Goût de la transmission"] },
  // ---- Hôtellerie
  { titre: "Réceptionniste bilingue", secteur: "hotellerie", niveau: "Débutant", contrat: "CDI", salaire: [180, 260], competences: ["Accueil", "Anglais", "Opera PMS"], resume: "Soyez le premier sourire de nos clients.", missions: ["Gérer arrivées et départs", "Traiter les réservations", "Répondre aux demandes des clients"], profil: ["BTS hôtellerie", "Bilingue français-anglais", "Excellente présentation"] },
  { titre: "Chef·fe de cuisine", secteur: "hotellerie", niveau: "Senior", contrat: "CDI", salaire: [700, 1100], competences: ["Cuisine", "Management", "Hygiène", "Gestion des coûts"], resume: "Signez une carte qui marie cuisine camerounaise et internationale.", missions: ["Créer les menus", "Manager la brigade de 15 personnes", "Maîtriser le food cost"], profil: ["8 ans d'expérience dont 3 comme chef", "Créativité"] },
  // ---- ONG
  { titre: "Chargé·e de suivi-évaluation", secteur: "ong", niveau: "Confirmé", contrat: "CDD", salaire: [700, 1000], competences: ["Suivi-évaluation", "KoboToolbox", "Analyse de données", "Rédaction"], resume: "Mesurez l'impact de nos programmes eau et éducation.", missions: ["Concevoir les outils de collecte", "Former les enquêteurs", "Rédiger les rapports bailleurs"], profil: ["Master en statistiques ou sciences sociales", "3 ans en ONG", "Disponibilité pour le terrain"] },
  { titre: "Coordinateur·rice de projet jeunesse", secteur: "ong", niveau: "Senior", contrat: "CDD", salaire: [1000, 1400], competences: ["Gestion de projet", "Entrepreneuriat", "Budget", "Partenariats"], resume: "Pilotez un programme d'appui à 2 000 jeunes entrepreneurs.", missions: ["Coordonner l'équipe projet", "Gérer le budget et les partenaires", "Assurer le reporting"], profil: ["5 ans en gestion de projets de développement", "Excellente rédaction"] },
];

// Petit générateur pseudo-aléatoire déterministe (mulberry32)
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const AVANTAGES: string[] = [
  "Assurance maladie famille",
  "Prime de transport",
  "13ᵉ mois",
  "Formations certifiantes",
  "Déclaration CNPS dès l'embauche",
  "Prime de performance",
  "Forfait internet mobile",
  "Cantine subventionnée",
  "Évolution de carrière rapide",
];

const VILLES_SECONDAIRES = ["Douala", "Yaoundé", "Bafoussam", "Garoua", "Bamenda", "Buea", "Kribi", "Bertoua", "Maroua", "Limbé"];

export function genererOffresDemo(aujourdhui = new Date()): Offre[] {
  const r = rng(237);
  const offres: Offre[] = [];
  const base = new Date(aujourdhui);
  base.setHours(8, 0, 0, 0);

  M.forEach((m, i) => {
    const candidates = ENTREPRISES_DEMO.filter((e) => e.secteur === m.secteur);
    const repetitions = r() < 0.45 ? 2 : 1;
    for (let k = 0; k < repetitions; k++) {
      const ent = candidates[(i + k) % candidates.length];
      const ville = k === 0 || r() < 0.4 ? ent.ville : VILLES_SECONDAIRES[Math.floor(r() * VILLES_SECONDAIRES.length)];
      const ilYa = Math.floor(r() * r() * 28); // plus de récentes que d'anciennes
      const publiee = new Date(base.getTime() - ilYa * 86400000 - Math.floor(r() * 10) * 3600000);
      const expire = new Date(publiee.getTime() + 45 * 86400000);
      const avantages = [...AVANTAGES].sort(() => r() - 0.5).slice(0, 3 + Math.floor(r() * 2));
      const slug = `${slugify(m.titre)}-${slugify(ent.nom)}-${slugify(ville)}`.slice(0, 90);
      if (offres.some((o) => o.slug === slug)) continue;
      offres.push({
        slug,
        titre: m.titre,
        entreprise: ent.slug,
        entrepriseNom: ent.nom,
        ville,
        contrat: m.contrat,
        niveau: m.niveau,
        teletravail: m.teletravail ?? "Sur site",
        secteur: m.secteur,
        salaireMin: m.salaire ? m.salaire[0] * 1000 : undefined,
        salaireMax: m.salaire ? m.salaire[1] * 1000 : undefined,
        publieeLe: publiee.toISOString(),
        expireLe: expire.toISOString(),
        resume: m.resume,
        missions: m.missions,
        profil: m.profil,
        avantages,
        competences: m.competences,
        candidature: { email: `recrutement@${slugify(ent.nom)}.example` },
        urgent: r() < 0.07,
        demo: true,
      });
    }
  });
  return offres;
}
