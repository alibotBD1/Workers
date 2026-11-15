import type { Article } from "./types";

export const ARTICLES: Article[] = [
  {
    slug: "cv-qui-se-demarque-cameroun",
    titre: "Le CV qui se démarque auprès des recruteurs camerounais",
    chapo: "Une page, des résultats chiffrés et zéro photo floue : la méthode pour passer le premier tri.",
    categorie: "CV & candidature",
    minutes: 5,
    couleur: "#2d7d57",
    sections: [
      {
        titre: "Une page, deux au maximum",
        texte: [
          "Un recruteur à Douala ou à Yaoundé reçoit souvent plus d'une centaine de candidatures pour un même poste. Il consacre quelques secondes à chaque CV avant de décider s'il le lit vraiment. Une page suffit pour un profil junior ; deux pages sont acceptables au-delà de dix ans d'expérience.",
          "Placez en haut votre titre de poste visé, votre ville, un numéro joignable sur WhatsApp et une adresse e-mail professionnelle (prenom.nom@…, pas « bébé_d'amour237 »).",
        ],
      },
      {
        titre: "Des résultats plutôt que des tâches",
        texte: [
          "« Gestion de la caisse » ne dit rien. « Tenue d'une caisse de 2 millions FCFA par jour sans écart sur 18 mois » dit tout. Pour chaque expérience, cherchez un chiffre : un montant, un nombre de clients, un délai, un pourcentage.",
          "Commencez chaque ligne par un verbe d'action : piloté, conçu, négocié, réduit, formé.",
        ],
      },
      {
        titre: "Les spécificités locales",
        texte: [
          "Mentionnez votre niveau en français et en anglais : le bilinguisme est un vrai atout au Cameroun. Indiquez les langues nationales que vous parlez si le poste est sur le terrain.",
          "La photo n'est pas obligatoire. Si vous en mettez une, choisissez une photo nette, sur fond neutre, en tenue professionnelle. Inutile d'indiquer votre religion, votre ethnie ou votre situation matrimoniale.",
        ],
      },
      {
        titre: "Adaptez à chaque offre",
        texte: [
          "Reprenez les mots-clés de l'annonce dans votre CV : si l'offre demande « SYSCOHADA » et « Sage », ces termes doivent apparaître. Sur Workers, renseignez vos compétences dans votre profil pour voir instantanément votre score de compatibilité avec chaque offre.",
        ],
      },
    ],
  },
  {
    slug: "reussir-entretien-embauche",
    titre: "Réussir son entretien d'embauche : la préparation en 7 jours",
    chapo: "De la recherche sur l'entreprise à la question piège sur le salaire, un plan jour par jour.",
    categorie: "Entretien",
    minutes: 6,
    couleur: "#d14d31",
    sections: [
      {
        titre: "J-7 à J-5 : enquêter",
        texte: [
          "Lisez le site de l'entreprise, ses pages sur les réseaux sociaux et les articles de presse récents. Notez trois faits marquants : un nouveau produit, une implantation, un résultat. Vous les citerez naturellement pendant l'entretien.",
          "Relisez l'offre ligne par ligne et associez chaque exigence à une expérience concrète de votre parcours.",
        ],
      },
      {
        titre: "J-4 à J-2 : préparer vos histoires",
        texte: [
          "Préparez quatre ou cinq situations racontées avec la méthode STAR : la Situation, la Tâche, l'Action que vous avez menée, le Résultat obtenu. Un conflit résolu, un objectif dépassé, une erreur dont vous avez tiré une leçon.",
          "Entraînez-vous à voix haute, idéalement avec un proche qui joue le recruteur. Si l'entretien peut se dérouler en anglais, préparez aussi votre présentation dans cette langue.",
        ],
      },
      {
        titre: "J-1 : la logistique",
        texte: [
          "Repérez le trajet et prévoyez une marge pour les embouteillages : à Douala, une heure d'avance n'est pas du luxe. Préparez deux copies de votre CV, vos diplômes et une pièce d'identité. Pour un entretien en visio, testez votre connexion et chargez votre téléphone.",
        ],
      },
      {
        titre: "Le jour J",
        texte: [
          "Arrivez dix minutes avant, saluez tout le monde, y compris à l'accueil. À la fin, posez au moins une question sur l'équipe ou les priorités du poste. Le lendemain, envoyez un court message de remerciement : peu de candidats le font.",
        ],
      },
    ],
  },
  {
    slug: "negocier-son-salaire-fcfa",
    titre: "Négocier son salaire sans se brûler les ailes",
    chapo: "Brut, net, primes, 13ᵉ mois : comprendre une rémunération camerounaise avant de discuter chiffres.",
    categorie: "Salaire",
    minutes: 5,
    couleur: "#eea00b",
    sections: [
      {
        titre: "Connaître le marché",
        texte: [
          "Avant tout entretien, consultez le baromètre des salaires de Workers : il agrège les fourchettes publiées dans les offres par secteur et par ville. Une même fonction peut être rémunérée très différemment à Douala, à Garoua ou dans une ONG internationale.",
        ],
      },
      {
        titre: "Brut, net et avantages",
        texte: [
          "Le salaire annoncé est en général brut. Les cotisations sociales (CNPS) et les impôts sur le revenu sont ensuite retenus. Demandez toujours si le montant évoqué est brut ou net.",
          "Regardez la rémunération globale : prime de transport, de logement, 13ᵉ mois, assurance maladie pour la famille, forfait téléphone. Une offre à 400 000 FCFA avec une bonne couverture santé peut valoir plus qu'une offre à 450 000 FCFA sans rien.",
        ],
      },
      {
        titre: "Annoncer une fourchette",
        texte: [
          "Quand on vous demande vos prétentions, donnez une fourchette dont le bas correspond à ce que vous acceptez vraiment. Justifiez-la par vos compétences et le marché, jamais par vos dépenses personnelles.",
          "Si le salaire n'est pas négociable, discutez d'autres leviers : date de revue salariale, formation, télétravail, titre du poste.",
        ],
      },
    ],
  },
  {
    slug: "eviter-arnaques-emploi",
    titre: "Arnaques à l'emploi : les 6 signaux d'alerte",
    chapo: "Frais de dossier, visa garanti, recruteur injoignable… Savoir reconnaître une fausse offre.",
    categorie: "Sécurité",
    minutes: 4,
    couleur: "#b33a24",
    sections: [
      {
        titre: "La règle d'or",
        texte: [
          "Un employeur sérieux ne vous demandera jamais d'argent : ni frais de dossier, ni frais de formation obligatoire, ni « caution » pour obtenir un poste. Au moindre paiement exigé par Mobile Money, arrêtez l'échange.",
        ],
      },
      {
        titre: "Les autres signaux",
        texte: [
          "Un salaire très supérieur au marché pour un poste sans qualification. Une embauche immédiate sans entretien. Un recruteur qui n'utilise qu'une adresse e-mail gratuite et refuse de donner l'adresse des bureaux. Une promesse de visa ou de travail à l'étranger « garanti ». Une pression pour décider dans l'heure.",
        ],
      },
      {
        titre: "Que faire ?",
        texte: [
          "Vérifiez l'existence de l'entreprise, son adresse et son numéro de contribuable. Ne transmettez jamais la copie de vos pièces d'identité avant un entretien réel. Si une annonce vous semble suspecte sur Workers, signalez-la : nous la retirerons après vérification.",
        ],
      },
    ],
  },
  {
    slug: "premier-emploi-jeunes-diplomes",
    titre: "Jeunes diplômés : décrocher son premier emploi",
    chapo: "Stage, alternance, réseau, projets personnels : les stratégies qui fonctionnent quand on débute.",
    categorie: "Premier emploi",
    minutes: 6,
    couleur: "#0f7c8c",
    sections: [
      {
        titre: "Le stage comme porte d'entrée",
        texte: [
          "Beaucoup d'entreprises camerounaises recrutent en priorité leurs anciens stagiaires. Un stage bien réalisé vaut souvent mieux qu'un diplôme supplémentaire. Filtrez les offres « Stage » et « Alternance » sur Workers et créez une alerte pour ne rien manquer.",
        ],
      },
      {
        titre: "Montrer plutôt que dire",
        texte: [
          "Sans expérience professionnelle, vos projets parlent pour vous : une application publiée, une étude de marché réalisée pour une association, une page que vous animez, un mémoire appliqué à une entreprise réelle. Mettez-les en avant sur votre CV avec des résultats.",
        ],
      },
      {
        titre: "Activer son réseau",
        texte: [
          "Anciens camarades, enseignants, associations d'anciens élèves, groupes professionnels : faites savoir précisément ce que vous cherchez. Une recommandation interne reste l'un des moyens les plus efficaces d'obtenir un entretien.",
        ],
      },
      {
        titre: "Accepter un premier pas",
        texte: [
          "Un premier poste n'a pas à être parfait. Un CDD, un poste en région ou une fonction proche de votre domaine peuvent être un excellent tremplin. Ce qui compte, c'est ce que vous y apprenez.",
        ],
      },
    ],
  },
  {
    slug: "metiers-qui-recrutent",
    titre: "Les métiers qui recrutent au Cameroun",
    chapo: "Numérique, énergie solaire, logistique portuaire, santé : où se trouvent les opportunités.",
    categorie: "Tendances",
    minutes: 4,
    couleur: "#7a3fb0",
    sections: [
      {
        titre: "Le numérique et la fintech",
        texte: [
          "Développeurs, designers, data analysts et spécialistes de la cybersécurité sont recherchés par les banques, les opérateurs et les start-up de paiement mobile. Le télétravail ouvre aussi des opportunités auprès d'employeurs de toute la région.",
        ],
      },
      {
        titre: "L'énergie et les infrastructures",
        texte: [
          "Le solaire décentralisé, les chantiers routiers et les projets portuaires créent une forte demande en techniciens, électriciens, conducteurs de travaux et profils QHSE, souvent en dehors des grandes villes.",
        ],
      },
      {
        titre: "La santé et l'agro-industrie",
        texte: [
          "Infirmiers, sages-femmes et techniciens de laboratoire restent très demandés. La transformation locale du cacao, du café et des produits vivriers recrute agronomes, qualiticiens et techniciens de maintenance.",
        ],
      },
    ],
  },
];

export const articleParSlug = (slug: string) => ARTICLES.find((a) => a.slug === slug);
