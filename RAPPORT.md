# Milo, le petit robot explorateur — Rapports d’étape

## Étape 1 — socle et jeu « Guide Milo » (16 octobre 2026)

Périmètre livré : socle du projet, identité visuelle, accueil, jeu « Guide Milo » complet (6 missions) et ses tests.
Hors périmètre à ce stade : Entraîne Milo, Milo s’est trompé, espace adulte, audio avec synthèse vocale, persistance, PWA.

### 1. Ce qui a été réalisé

#### Socle technique
- **React 19.3.1**, **React DOM 19.3.1**, **TypeScript ~5.9.3**, **Vite ^8.3.4**, **Vitest ^5.0.5**, **@vitejs/plugin-react ^6.1.2**, **@types/node ^24**.
- Versions épinglées dans `package.json`, `package-lock.json` conservé.
- TypeScript en mode strict (`strict`, `noUnusedLocals`, `noUnusedParameters`, `noUncheckedSideEffectImports`), aucun `any`.
- Séparation nette : `src/data` (missions), `src/engine` (moteur de déplacement), `src/progression` (progression), `src/components` (UI), `src/ecrans` (écrans), `src/audio` (bips).
- PWA volontairement reportée à l’étape 4.

#### Moteur de déplacement (`src/engine/gridEngine.ts`)
- Fonctions pures : direction écran, adjacence, limites de grille, obstacles, exécution complète d’un programme.
- Statuts possibles : `succes`, `hors-grille`, `obstacle`, `non-atteint`, `programme-vide`.
- **Règle de réussite** : Milo doit finir **sur** la cible à la fin du programme, sans déplacement invalide. Traverser la cible puis repartir ne suffit pas.
- Un déplacement invalide (sortie de grille ou obstacle) arrête le parcours immédiatement et n’avance pas Milo.
- Constante visible `LIMITE_COMMANDES = 12`.

#### Six missions (`src/data/missions.ts`)
1. **Le premier pas** — un seul déplacement (`droite`).
2. **Deux pas identiques** — (`haut`, `haut`).
3. **Deux directions** — (`droite`, `haut`).
4. **Le grand chemin** — 4 déplacements, un rocher sur le plateau.
5. **Autour du rocher** — contournement obligatoire.
6. **Le programme à corriger** — programme prérempli erroné : `gauche, droite, droite, droite, haut, haut` (la 1re flèche sort de l’île). Corrigé = retirer la 1re flèche.

Chaque mission fournit titre, objectif court, aide, grille, séquence initiale et solution. Un validateur `validationMission` contrôle la cohérence des données.

#### Interface
- Identité chaleureuse : fond crème, turquoise, bleu, corail, jaune employés sobrement.
- Illustrations 100 % SVG maison : **Milo** expressif (neutre, content, concentré, surpris), étoile, rocher, flèches, icônes (retour, aide, son, go, stop, rejouer, effacer, coche). Aucun emoji comme illustration.
- **Accueil** : Milo, trois lieux, dont deux réellement désactivés et marqués « Bientôt disponible » (aucun bouton ne donne l’impression d’être cassé).
- **Choix de mission** : les 6 missions sélectionnables, coche « Mission terminée » si réussie.
- **Écran de jeu** : objectif court, plateau 4×4, commandes directionnelles, séquence affichée, Go / Stop / Revoir le parcours / Recommencer la mission / Effacer, aide dépliable avec légende, bouton son, bips WebAudio locaux, réduction des animations.
- **Écran de fin** : retour positif bref, « Rejouer », « Une autre mission », « Terminer » ; aucun enchaînement automatique.
- Zones interactives ≥ 44 px, libellés courts contrastés, icône + texte, pas de compte à rebours ni de compétition.

#### Comportement du jeu (conforme aux exigences)
- Chaque exécution **repart de la position initiale**.
- **Stop** interrompt immédiatement et **conserve la séquence** ; on peut alors modifier puis relancer.
- Exécutions concurrentes et modifications bloquées pendant l’exécution (garde par `ref` + boutons désactivés).
- Quitter l’écran annule temporisations et animations (nettoyage `useEffect`).
- Limite visible de 12 commandes (compteur `n / 12`, commandes désactivées à 12).
- « Revoir le parcours » rejoue le programme ; « Recommencer la mission » restaure l’état initial, **programme erroné inclus** pour la mission 6.
- Réussite validée par le moteur, jamais par l’animation.

#### Progression
- En **mémoire de session** uniquement (pas de persistance à cette étape).
- Les 6 missions restent sélectionnables pour permettre le contrôle.
- Bouton « Continuer » sur l’accueil dès qu’une progression existe dans la session.

### 2. Commande de lancement et adresse locale

```powershell
npm install     # déjà effectué
npm run dev     # http://localhost:5173
```

Autres scripts : `npm run build`, `npm run preview`, `npm run typecheck`, `npm test`, `npm run test:watch`.

### 3. Scénario de test manuel (≈ 2 min)

1. Accueil → « Guide Milo ». Les deux autres lieux sont grisés « Bientôt disponible ».
2. Mission 1 → touche **« Droite »**, puis **Go** : Milo avance, écran **Bravo**.
3. Mission 6 → le programme est prérempli.
   - **Go** : Milo sort de l’île, message d’erreur, **la séquence est conservée**.
   - Retire la **1re flèche (×)**, puis **Go** : réussite, message « Tu as corrigé le chemin de Milo ! ».
4. Pendant une exécution : appuie **Stop** au milieu, puis **Retour** : aucune erreur.

### 4. Vérifications réellement exécutées

- `npm run typecheck` : OK.
- `npm test` : **30/30** (moteur + données des missions, y compris les 6 solutions vérifiées par le vrai moteur, la non-réussite du programme erroné de la mission 6, le déterminisme, la règle « passer sur la cible puis repartir »).
- `npm run build` : OK (Vite, 27 modules, pas d’erreur).
- **Test de fumée sur navigateur réel headless (Edge) piloté par CDP**, contre le serveur de dev :
  - Test 1 — **21/21** : clics rapides (6 ajouts d’affilée), Stop, double clic Go sans double exécution, Stop conservant la séquence, changement d’écran pendant l’animation, réussite mission 1, présence des 3 boutons de fin, message de fin concret, **zéro erreur console**.
  - Test 2 — **30/30** : les **6 missions résolues via l’interface**, mission 6 (erreur → séquence conservée → correction → réussite), et contrôles à 360×640, 390×844, 768×1024, 1024×768, 1366×768, 1920×1080 : **pas de débordement horizontal**, boutons dans l’écran, zones interactives ≥ 44 px.

### 5. Problèmes connus et points restant à faire

- **Rendu visuel non jugé automatiquement** : le modèle de cette session n’accepte pas l’entrée image. Les captures sont générées pour relecture humaine dans
  `C:\Users\JONATHAN\AppData\Local\Temp\opencode\` :
  `milo-accueil.png`, `milo-accueil-tel.png`, `milo-choix.png`, `milo-jeu-tablette.png`, `milo-jeu-tel.png`, `milo-jeu-sequence.png`, `milo-jeu-execution.png`, `milo-fin.png`.
- Testé sur **Edge desktop headless** uniquement. Restent **à contrôler manuellement** : vrai iPad/Android, macOS, Safari et Firefox.
- Progression non persistée (voulu à cette étape) → « Continuer » disparaît au rechargement.
- Réglage du son non conservé au rechargement ; aucune musique automatique.
- Espace adulte et synthèse vocale non présents (prévus aux étapes 2–3).

### 6. Suite prévue

- **Étape 2** : jeu « Entraîne Milo », classificateur local (plus proche voisin) déterministe, sans accès aux catégories de test ; scénario « exemples peu variés → erreur → correction » vérifié par le vrai algorithme.
- **Étape 3** : jeu « Milo s’est trompé », espace adulte, sauvegarde versionnée, aide et audio avec repli.
- **Étape 4** : adaptation fine multi-appareils, PWA et hors connexion, vérifications finales.

*Arrêt demandé ici, en attente de validation avant l’étape 3.*

---

## Étape 3 — jeu « Milo s’est trompé » (17 octobre 2026)

Périmètre livré : le jeu « Milo s’est trompé » (3 missions), progression persistée dans `localStorage`, bouton activé sur l’accueil.

### Ce qui a été réalisé

#### Jeu « Milo s’est trompé »
- Reprise du moteur de grille existant (`src/engine/gridEngine.ts`). Pour chaque mission, Milo a un **programme erroné** prérempli ; l’enfant doit le corriger pour atteindre l’étoile.
- 3 missions : « Le premier faux-pas », « Trop direct » (contournement d’un rocher), « Le mauvais détour » (corriger la suite sans tout recommencer).
- Écran de jeu cohérent avec l’existant : aperçu de l’erreur (« Revoir l’erreur de Milo »), édition du programme, Go/Stop/Revoir/Effacer, messages adaptés, plateau 4×4 identique à « Guide Milo ».

#### Persistance
- Progression enregistrée/rechargée dans `localStorage` (clé `milo.progression.v2`), avec repli sur progression vide en cas de données corrompues.
- « Continuer » enchaîne désormais : Guide Milo → Entraîne Milo → Milo s’est trompé.

#### Intégration
- Bouton « Milo s’est trompé » activé sur l’accueil.
- `FinMission` partagée, libellé « Une autre mission » cohérent.

### Vérifications exécutées
- `npm run typecheck` : OK.
- `npm test` : **56/56** (ajout de tests : erreurs + persistance).
- `npm run build` : OK.
- Smoke Edge headless : 38/38 (état de l’accueil mis à jour).

### Problèmes connus et points restant à faire
- Espace adulte et synthèse vocale non présents.
- Pas de test de fumée dédié « Milo s’est trompé » (missions vérifiées par les tests unitaires).

### Suite prévue
- **Étape 4** : adaptation fine multi-appareils, PWA et hors connexion, synthèse vocale (repli), espace adulte si souhaité, vérifications finales.

---

## Étape 4 — PWA, hors connexion, synthèse vocale (17 octobre 2026)

Périmètre livré (priorité choisie « PWA + hors connexion + SSV ») : application installable et jouable hors réseau, voix de Milo sur les trois jeux.

### Ce qui a été réalisé

#### PWA et hors connexion
- `vite-plugin-pwa` (`vite.config.ts`) : manifest (nom, thème `#FFF6EC`, `display: standalone`, `lang: fr`, icône SVG 192×192), service worker Workbox généré au build avec précache de tous les assets (`js`, `css`, `html`, `svg`).
- `registerType: 'autoUpdate'` : la nouvelle version prend le relais au rechargement suivant.
- `index.html` : `apple-touch-icon` (SVG inline) pour iOS.

#### Synthèse vocale (`src/audio/tts.ts`)
- Module léger `SpeechSynthesis` : annule un discours en cours, voix `fr-FR`, débit ralenti (0.9) adapté aux enfants.
- **Repli** : si la synthèse vocale n'est pas disponible, le module reste silencieux ; les bips WebAudio existants continuent de fonctionner normalement.
- Intégré aux **trois jeux** : Guide Milo, Entraîne Milo (voix du verdict : « Milo a dit… bonne réponse / il lui manque un exemple ») et Milo s'est trompé (voix du message d'état).
- La voix suit le bouton « Son activé / Son coupé » existant.

### Vérifications exécutées
- `npm run typecheck` : OK.
- `npm test` : **56/56**.
- `npm run build` : OK (PWA : `dist/sw.js`, `dist/manifest.webmanifest`, `dist/registerSW.js`, precache 5 entrées).
- Smoke Edge headless : **38/38** (inchangé, la PWA n'altère pas le fonctionnement).

### Installation et test manuel (fait par l'utilisateur)
1. `npm install` puis `npm run build` et `npm run preview` (ou `npm run dev`).
2. **Navigateur (Chrome/Edge)** : ouvrir la page → menu ⋮ → « Installer Milo » / icône d'installation dans la barre d'adresse.
3. **Hors connexion** : après première visite, couper le réseau → recharger ou relancer l'app installée : tout fonctionne (precache Workbox).
4. **iOS (Safari)** : bouton Partager → « Sur l'écran d'accueil ».
5. Vérifier la voix : bouton « Son activé » puis jouer une mission (voix féminine enfantine, silencieuse si l'appareil n'a pas de voix).

### Problèmes connus et points restant à faire
- Espace adulte toujours absent (optionnel).
- Icône d'installation 512×512 absente (uniquement le 192×192 ; suffisant pour l'installation mais perfectible).
- Vérifications manuelles sur Safari/iPad/Android/Firefox toujours recommandées.

---

## Étape 5 — Réadaptation lycée : algorithmique et IA (11 novembre 2026)

Périmètre livré : réécriture complète du ton et des contenus pour un public de 16 ans, grilles dynamiques, barème d'optimalité, laboratoire k-NN et documentation technique. L'architecture et le fonctionnement 100 % hors ligne sont conservés.

### Ce qui a été réalisé

#### Vocabulaire et narration
- « Milo, le petit robot » → **MILO Core // Système d'Exploration & IA**.
- Les cinq modules sont renommés : **Navigation Algorithmique**, **Machine Learning Lab (k-NN)**, **Debug Lab (Analyse d'Anomalies)**, **Ordonnancement & Dépendances Critiques**, **Documentation & Spécifications Techniques**.
- Les encouragements sont remplacés par des journaux système préfixés (`[VALIDÉ]`, `[ERREUR]`, `[k-NN]`, `[ANOMALIE]`), affichés en police monospace.

#### Navigation et Debug Lab
- Grilles dynamiques **5×5, 6×6, 7×7 et 8×8** dimensionnées par les variables CSS `--grille-w` / `--grille-h`.
- **9 missions** de navigation progressives et **4 anomalies** à corriger.
- Buffer plafonné à **24 instructions**.
- **Barème 3 étoiles** calculé par BFS, source unique de vérité : ⭐ séquence valide, ⭐⭐ buffer réduit dans la marge `max(2, ceil(optimal × 0,2))`, ⭐⭐⭐ chemin le plus court. La meilleure note est conservée en progression.

#### Machine Learning Lab
- Catalogue de **13 signaux** décrits par deux caractéristiques normalisées : **amplitude** et **cohérence**.
- Règle visible du jeu de données : SIGNAL si `amplitude ≥ 0,55` ET `cohérence ≥ 0,55`.
- Classificateur **k-NN supervisé** avec `k ∈ {1, 3, 5}`, vote majoritaire et égalité tranchée par le voisin le plus proche.
- **4 défis**, dont un faux positif : à `k = 1`, une dérive thermique aberrante impose sa classe ; à `k = 3`, l'injection d'une impulsion calibrée rétablit la majorité.
- Visualisations : oscillogrammes déterministes, nuage de points (cohérence × amplitude), seuils, cible et voisins retenus.

#### Ordonnancement et documentation
- **4 scénarios** de graphes de dépendances (initialisation, chemin critique, file bloquée, bascule blue/green) avec actions leurres.
- Écran **Documentation & Spécifications Techniques** : architecture, moteur BFS, barème, protocole k-NN, Debug Lab, ordonnancement et contraintes d'exécution.
- Thème sombre technique appliqué aussi au manifeste PWA, à `index.html` et à la configuration Capacitor.

#### Persistance
- Clé `milo.progression.v2` conservée. Le champ `etoiles` est ajouté ; les progressions antérieures restent lisibles et reçoivent une étoile par module déjà terminé. Rejouer une mission ne peut jamais faire baisser la meilleure note.

### Vérifications exécutées

- `npm run typecheck` : OK.
- `npm test` : **99/99** sur 7 fichiers (moteur BFS et barème, 9 missions, 4 anomalies, k-NN, 4 défis ML, progression et rétrocompatibilité, ordonnancement).
- `npm run build` : OK (Vite + PWA, service worker et precache générés).
- Cohérence des données garantie par les validateurs : chaque solution de navigation et de Debug Lab est exactement le chemin optimal BFS ; chaque défi ML échoue avec son jeu initial puis réussit avec l'étagère complète.

### Points restant à faire
- Rejouer les parcours manuellement sur appareil réel après `npm run build` puis `npx cap copy android` (les assets WebView Android sont une copie de `dist`).
- Vérifier le rendu sur les tailles d'écran extrêmes et avec un lecteur d'écran (les cibles tactiles, libellés ARIA et réductions d'animation sont en place).

## Étape 6 — Distribution Android

### Prérequis de chaîne de build
- **JDK 21 obligatoire** (`JAVA_HOME` doit pointer dessus) : Capacitor 7 et AGP 8.13 compilent en `source release 21`. Le JDK 17 installé à côté provoque `error: invalid source release: 21`.
- Android SDK avec `compileSdk 36`, build-tools 36.

### Signature
- Keystore PKCS12 `android/keystore/milo-release.jks`, alias `milo`, RSA 4096, validité 10 000 jours, sujet `CN=MILO Core, O=MILO, C=FR`.
- Identifiants lus par `android/app/build.gradle` depuis `android/keystore.properties` (non versionné).
- Repli automatique sur la clé de debug si le fichier est absent : un contributeur peut lancer `assembleRelease` sans secret, mais l'APK produit n'est alors pas distribuable.
- **Le keystore et son mot de passe doivent être sauvegardés hors du dépôt** : sans eux, aucune mise à jour publiée n'est possible.

### Commandes
```powershell
npm run build
npx cap copy android
cd android
.\gradlew.bat assembleRelease
```

Sortie : `android/app/build/outputs/apk/release/app-release.apk`, copiée dans `apk/` avec son empreinte SHA-256.

### Caractéristiques de l'APK de release
- `com.milo.robot`, `versionName 1.0.0`, `versionCode 1`.
- minSdk 24 (Android 7.0), targetSdk 36 (Android 16).
- Label `MILO Core`, non débuggable, signé avec le certificat de release.
- Le bundle WebView embarqué doit correspondre à `dist/assets` (`index-CqJnk5Hy.js`).


