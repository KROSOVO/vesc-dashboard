# AUDIT — Projet hybride VESCDASH (Android + iOS compagnon)

> Rapport d'audit Phase 1 — branche `feature/hybrid` — 2026-11-17
> Périmètre : transposition du brief « DiPlay hybride » au projet vescdash.

## 1. Ce qui a été analysé

- Repo GitHub : [`clementdbs2-del/vesc-dashboard`](https://github.com/clementdbs2-del/vesc-dashboard) (public, branche `main`), compte `clementdbs2-del` (token scope `repo` vérifié).
- Fichiers racine : `README.md`, `CONDITIONS-UTILISATION.md`, `index.html` (site vitrine), `conditions.html`, `app/` (PWA déployée), `Pre-Releases/` (historique versionné).
- Dernière version locale : **V0.76** (`Pre-Releases/V0.76.html`, 169 152 octets — identique au local, Pre-Releases à jour).
- Workflow établi : chaque itération = nouveau `V0.xx.html` (jamais d'édition en place), publication PWA dans `app/`, bump README à chaque version.

## 2. État du dépôt au moment de l'audit

| Élément | État |
|---|---|
| `Pre-Releases/` | ✅ à jour jusqu'à V0.76 |
| `app/index.html` (PWA déployée) | ⚠️ basé sur **V0.70** (diff vérifié : V0.70 + manifest + apple-touch-icon + enregistrement SW). 6 versions de retard — **déploiement non effectué, accord utilisateur requis** |
| `app/sw.js` | v3, « réseau d'abord », cache shell + CDN (Leaflet 1.9.4, Google Fonts) |
| `README.md` | ✅ mentionne V0.76 |

## 3. Architecture actuelle de la PWA (V0.76)

- **Mono-fichier** HTML/CSS/JS (~169 Ko), aucune dépendance locale.
- **Communication VESC** : Web Bluetooth (`navigator.bluetooth`)
  - Service principal : `0000ffe0-0000-1000-8000-00805f9b34fb` (module BLE type HM-10, caractéristique `ffe1`)
  - Service alternatif : Nordic UART Service `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
  - Sélection par filtres + fallback `acceptAllDevices`
- **Position** : `navigator.geolocation` (écran GPS/Leaflet).
- **Vues** : `dash`, `gps`, `modes`, `recap` (data-view).
- **PWA** : manifest webmanifest, service worker réseau d'abord, icônes (192/512/maskable/apple-touch).

## 4. Contraintes techniques identifiées

1. **iOS/Safari ne supporte pas Web Bluetooth** → un iPhone ne peut **jamais** se connecter au VESC via la PWA. C'est la justification principale d'une app iOS native (CoreBluetooth) qui relaie la télémétrie.
2. **Pas de CarPlay dans vescdash** : les points du brief DiPlay (streaming vidéo, maphost, surfaces CarPlay) **ne s'appliquent pas**. L'hybride se réduit à : écran Android (interface locale) + iPhone (source de données) + protocole JSON.
3. La PWA fonctionne déjà sur Android Chrome (Web Bluetooth OK) ; l'app native Android apporte : installation hors navigateur, plein écran immersif, démarrage direct, bridge natif futur (BLE si Web Bluetooth indisponible sur certains head units, GPS, stockage).
4. Aucune clé/secret dans le repo à ce jour — à préserver.

## 5. Architecture cible

```
hybrid/
├── android/                 # Application Android (Kotlin, WebView + bridge natif)
│   └── app/src/main/
│       ├── java/com/krosovo/vescdash/
│       │   ├── MainActivity.kt      # WebView plein écran, cycle de vie
│       │   └── bridge/JsBridge.kt   # JS ↔ Kotlin (messages JSON)
│       └── assets/web/              # copie automatisée de hybrid/web/ au build
├── web/                     # UI embarquée (source de vérité unique)
│   ├── index.html
│   ├── css/  (base, statusbar, dock, screens)
│   └── js/   (bridge, mock-data, app, screens/*)
├── ios/                     # Phase 5 : app compagnon Swift (CoreBluetooth)
└── docs/                    # AUDIT.md, COMMUNICATION_PROTOCOL.md (Phase 4)
```

Décisions :
- **Une seule source de vérité** pour l'UI web (`hybrid/web/`), copiée dans les assets Android par une tâche Gradle (`copyWebAssets`) — pas de divergence.
- **Zéro modification** des fichiers existants du repo (PWA, README, site vitrine restent intacts).
- Dépendances minimales : Kotlin + SDK Android uniquement (pas de Compose, pas de lib réseau externe en Phase 2).

## 6. Transposition des écrans du brief

Le brief DiPlay liste 9 écrans dont Musique/Téléphone/Applications — justifiés par CarPlay. Sans CarPlay, créer ces écrans serait de fausses fonctionnalités (interdit par le brief §12). Écrans retenus :

1. **Accueil** (dash — télémétrie VESC)
2. **Navigation** (gps)
3. **Infos véhicule**
4. **Connexion iPhone** (état du lien iPhone ↔ écran)
5. **Paramètres**
6. **Diagnostic** (FPS, latence, reconnexions — Phase 7)

Données fictives en Phase 2-3 (testable sans iPhone ni VESC), réelles en Phase 4-5.

## 7. Phases (adaptées du brief)

| Phase | Contenu | État |
|---|---|---|
| 1 | Audit (ce document) | ✅ |
| 2 | Squelette Android : Gradle, WebView, bridge JS↔Kotlin, démo | en cours |
| 3 | UI : écrans, animations, données fictives | en cours |
| 4 | Protocole JSON + WiFi/TCP + reconnexion + sécurité | à venir |
| 5 | App iOS Swift (CoreBluetooth : VESC + GPS → relais) | à venir |
| 6 | Intégration (réutilisation PWA, surfaces d'affichage) | à venir |
| 7 | Tests, mesures perf, optimisation | à venir |

## 8. Limites et règles respectées

- Rien n'est publié sur `main` : travail exclusivement sur `feature/hybrid`.
- `app/` (V0.70 → V0.76) : déploiement reporté, accord utilisateur requis.
- Aucune restriction Apple contournée (Phase 5 : uniquement API publiques CoreBluetooth/CoreLocation, permissions déclarées).
