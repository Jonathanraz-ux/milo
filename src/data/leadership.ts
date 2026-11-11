export interface ActionLeadership {
  id: string
  /** Libellé court affiché sous forme de carte action. */
  libelle: string
  /** Catégorie logique de l'action. */
  type: 'avancer' | 'aider' | 'ouvrir' | 'deplacer' | 'securiser'
  /** Indique si cette action doit obligatoirement figurer dans la solution. */
  obligatoire: boolean
}

export interface MissionLeadership {
  id: string
  numero: number
  titre: string
  /** Contexte système de la mission. */
  mission: string
  objectif: string
  aFaire: string[]
  aRespecter: string[]
  /** Note technique affichée dans l'interface. */
  conseilAdulte?: string
  actionsDisponibles: ActionLeadership[]
  /** Ordre correct des identifiants d'actions. */
  solutionOrdre: string[]
  /** Actions déjà placées au début du plan (facultatif). */
  ordreInitial: string[]
}

export const MISSIONS_LEADERSHIP: MissionLeadership[] = [
  {
    id: 'lead-1',
    numero: 1,
    titre: 'Initialisation du pipeline',
    mission: "Le pipeline d'acquisition doit démarrer sans dépendance non résolue.",
    objectif: "Ordonner l'allocation des ressources avant l'exécution de l'acquisition.",
    aFaire: [
      'Ordonne les tâches selon leurs dépendances.',
      'Place-les dans le plan de déploiement.',
      'Vérifie le graphe avant validation.',
    ],
    aRespecter: [
      "Le buffer doit être alloué avant l'initialisation du capteur.",
      "L'acquisition ne démarre qu'après calibration du seuil.",
    ],
    conseilAdulte: 'Un ordonnancement valide respecte strictement les arêtes du graphe de dépendances.',
    actionsDisponibles: [
      { id: 'allouer-buffer', libelle: "Allouer le buffer d'échantillons", type: 'securiser', obligatoire: true },
      { id: 'initialiser-capteur', libelle: 'Initialiser le capteur', type: 'ouvrir', obligatoire: true },
      { id: 'calibrer-seuil', libelle: 'Calibrer le seuil de décision', type: 'deplacer', obligatoire: true },
      { id: 'executer-acquisition', libelle: "Exécuter l'acquisition", type: 'avancer', obligatoire: true },
    ],
    solutionOrdre: ['allouer-buffer', 'initialiser-capteur', 'calibrer-seuil', 'executer-acquisition'],
    ordreInitial: [],
  },
  {
    id: 'lead-2',
    numero: 2,
    titre: 'Chemin critique',
    mission: 'Trois tâches partagent une ressource verrouillée : le chemin critique doit être respecté.',
    objectif: "Sérialiser les accès à la ressource partagée et libérer le verrou avant le redémarrage.",
    aFaire: [
      'Identifie les dépendances de verrouillage.',
      'Ordonne les actions dans le plan.',
      'Vérifie que le verrou est libéré avant le redémarrage.',
    ],
    aRespecter: [
      'Le verrou doit être acquis avant toute écriture.',
      "L'écriture doit précéder la validation d'intégrité.",
      'Le verrou doit être libéré avant le redémarrage du service.',
    ],
    conseilAdulte: 'La journalisation est une action leurre : elle ne fait pas partie du chemin critique.',
    actionsDisponibles: [
      { id: 'acquerir-verrou', libelle: 'Acquérir le verrou', type: 'securiser', obligatoire: true },
      { id: 'ecrire-index', libelle: "Écrire l'index", type: 'deplacer', obligatoire: true },
      { id: 'valider-integrite', libelle: "Valider l'intégrité", type: 'securiser', obligatoire: true },
      { id: 'liberer-verrou', libelle: 'Libérer le verrou', type: 'ouvrir', obligatoire: true },
      { id: 'redemarrer-service', libelle: 'Redémarrer le service', type: 'avancer', obligatoire: true },
      { id: 'journaliser', libelle: 'Journaliser les métriques', type: 'aider', obligatoire: false },
    ],
    solutionOrdre: ['acquerir-verrou', 'ecrire-index', 'valider-integrite', 'liberer-verrou', 'redemarrer-service'],
    ordreInitial: [],
  },
  {
    id: 'lead-3',
    numero: 3,
    titre: 'Ordonnancement bloqué',
    mission: "Une tâche d'analyse a été placée trop tôt dans le plan : la file reste bloquée.",
    objectif: 'Réorganiser le plan en respectant les dépendances de déblocage.',
    aFaire: [
      'Observe le plan initial déjà chargé.',
      'Déplace ou retire les actions mal ordonnées.',
      'Vérifie le plan avant validation.',
    ],
    aRespecter: [
      "La lecture du journal doit précéder l'analyse de l'anomalie.",
      "L'analyse doit précéder le déblocage de la file.",
      "La file ne doit être débloquée qu'après sauvegarde de l'état.",
    ],
    conseilAdulte: "L'ordre initial est volontairement invalide : la tâche d'analyse est en tête de plan.",
    actionsDisponibles: [
      { id: 'lire-journal', libelle: 'Lire le journal système', type: 'aider', obligatoire: true },
      { id: 'analyser-anomalie', libelle: "Analyser l'anomalie", type: 'aider', obligatoire: true },
      { id: 'sauvegarder-etat', libelle: "Sauvegarder l'état", type: 'securiser', obligatoire: true },
      { id: 'debloquer-file', libelle: 'Débloquer la file', type: 'ouvrir', obligatoire: true },
      { id: 'relancer-worker', libelle: 'Relancer le worker', type: 'avancer', obligatoire: true },
    ],
    solutionOrdre: ['lire-journal', 'analyser-anomalie', 'sauvegarder-etat', 'debloquer-file', 'relancer-worker'],
    ordreInitial: ['analyser-anomalie'],
  },
  {
    id: 'lead-4',
    numero: 4,
    titre: 'Bascule sans interruption',
    mission: 'Le service doit être migré sans perte de messages, avec retour arrière possible.',
    objectif: 'Ordonner une bascule blue/green complète.',
    aFaire: [
      'Ordonne les étapes de la bascule.',
      'Place-les dans le plan de migration.',
      "Vérifie qu'aucune étape critique n'est exécutée trop tôt.",
    ],
    aRespecter: [
      'Le nouveau nœud doit être démarré avant la vérification de santé.',
      'La vérification doit précéder le basculement du trafic.',
      'Le trafic ne bascule qu’après réplication des messages.',
      "L'ancien nœud ne s'arrête qu'après confirmation du basculement.",
    ],
    conseilAdulte: 'La confirmation du basculement est la seule condition autorisant l’arrêt de l’ancien nœud.',
    actionsDisponibles: [
      { id: 'demarrer-noeud', libelle: 'Démarrer le nouveau nœud', type: 'ouvrir', obligatoire: true },
      { id: 'verifier-sante', libelle: 'Vérifier la santé du nœud', type: 'securiser', obligatoire: true },
      { id: 'repliquer-messages', libelle: 'Répliquer les messages', type: 'deplacer', obligatoire: true },
      { id: 'basculer-trafic', libelle: 'Basculer le trafic', type: 'avancer', obligatoire: true },
      { id: 'confirmer-bascule', libelle: 'Confirmer la bascule', type: 'securiser', obligatoire: true },
      { id: 'arreter-ancien-noeud', libelle: "Arrêter l'ancien nœud", type: 'deplacer', obligatoire: true },
    ],
    solutionOrdre: [
      'demarrer-noeud',
      'verifier-sante',
      'repliquer-messages',
      'basculer-trafic',
      'confirmer-bascule',
      'arreter-ancien-noeud',
    ],
    ordreInitial: [],
  },
]

export function missionLeadershipParId(id: string): MissionLeadership | undefined {
  return MISSIONS_LEADERSHIP.find((m) => m.id === id)
}

export function validationMissionLeadership(mission: MissionLeadership): string[] {
  const problemes: string[] = []
  if (mission.solutionOrdre.length === 0) problemes.push(`${mission.id} : solution vide`)
  if (new Set(mission.solutionOrdre).size !== mission.solutionOrdre.length) {
    problemes.push(`${mission.id} : doublon dans la solution`)
  }

  const idsDispo = new Set(mission.actionsDisponibles.map((a) => a.id))
  if (idsDispo.size !== mission.actionsDisponibles.length) {
    problemes.push(`${mission.id} : identifiant d'action en double`)
  }
  for (const id of mission.solutionOrdre) {
    if (!idsDispo.has(id)) problemes.push(`${mission.id} : action « ${id} » introuvable dans les actions disponibles`)
  }

  for (const id of mission.ordreInitial) {
    if (!idsDispo.has(id)) problemes.push(`${mission.id} : ordreInitial contient « ${id} » inconnu`)
    if (!mission.solutionOrdre.includes(id)) {
      problemes.push(`${mission.id} : ordreInitial contient « ${id} » hors solution`)
    }
  }

  const obligatoires = mission.actionsDisponibles.filter((a) => a.obligatoire).map((a) => a.id)
  const manquants = obligatoires.filter((o) => !mission.solutionOrdre.includes(o))
  if (manquants.length > 0) {
    problemes.push(`${mission.id} : actions obligatoires absentes de la solution : ${manquants.join(', ')}`)
  }

  if (mission.ordreInitial.length === mission.solutionOrdre.length) {
    problemes.push(`${mission.id} : le plan initial est déjà complet`)
  }

  return problemes
}
