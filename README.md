# outils-stat

Stats de jeu, sans bruit. Interface épurée, zéro publicité, zéro tracking — juste de la data issue des APIs officielles, présentée clairement.

Source initiale : **API Battle.net (Blizzard)**, gratuite.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router, TypeScript, React 19)
- [Tailwind CSS v4](https://tailwindcss.com/)
- Hébergement : [Vercel](https://vercel.com/) (abonnement gratuit)

## Sources

- **World of Warcraft** (Battle.net API) : statut des royaumes connectés, files d'attente, population — par région (US / EU / KR / TW).
  Personnages : profil, équipement, hauts faits, statistiques, Mythic+, collections (montures/mascottes/jouets), raids, donjons, PvP (arènes, BG, brackets), réputations, professions, titres.
- D'autres sources (Steam, Riot…) seront ajoutées dès qu'une API utile ou marrante est disponible.

## Configuration locale

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Renseigner les credentials Blizzard :
   - Créer une application sur le portail [Battle.net Developer](https://account.battle.net/) pour obtenir un Client ID et un Client Secret.
   - Copier `.env.example` vers `.env.local` et remplir les valeurs :
     ```
     BATTLE_NET_CLIENT_ID=...
     BATTLE_NET_CLIENT_SECRET=...
     ```
3. Démarrer le serveur de dev :
   ```bash
   npm run dev
   ```
4. Ouvrir [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
| --- | --- |
| `/` | Accueil + liste des sources |
| `/stats/wow` | Stats WoW (statut des royaumes, files, population) |
| `/stats/wow/character` | Recherche de personnage WoW (profil + progression + détails) |
| `/a-propos` | Le concept |
| `/api/blizzard/status` | État de configuration de l'API Blizzard |
| `/api/blizzard/wow/stats?region=eu` | Stats WoW agrégées par région |
| `/api/blizzard/wow/character` | Profil d'un personnage (summary, status, equipment, media) |
| `/api/blizzard/wow/character/progression` | Progression : hauts faits, statistiques, Mythic+ |
| `/api/blizzard/wow/character/details` | Détails : collections, raids/donjons, PvP, réputations, professions, titres |
| `/api/auth/login` | Démarre le flux OAuth authorization code Battle.net |
| `/api/auth/callback` | Callback OAuth (échange du code, pose du cookie de session) |

## Flux OAuth authorization code (optionnel)

La plupart des données sont accessibles via le flux *client credentials* (serveur seul).
Le flux *authorization code* permet d'accéder aux données strictement liées au compte joueur
(collections détaillées, etc.), dans la mesure où Blizzard valide le scope `wow.profile`.

1. Ajouter une URL de redirection dans le portail Battle.net : `https://<votre-domaine>/api/auth/callback`.
2. Renseigner `BATTLE_NET_REDIRECT_URI` (et idéalement `SESSION_SECRET`) dans `.env.local` / Vercel.
3. Un lien « Se connecter (Battle.net) » apparaît dans l'en-tête lorsque l'OAuth est configuré.

## Déploiement sur Vercel

1. Connecter le dépôt GitHub dans Vercel.
2. Ajouter les variables d'environnement `BATTLE_NET_CLIENT_ID` et `BATTLE_NET_CLIENT_SECRET` dans les paramètres du projet Vercel.
   Pour l'OAuth utilisateur, ajouter aussi `BATTLE_NET_REDIRECT_URI` et `SESSION_SECRET`.
3. Déployer (framework auto-détecté : Next.js).

## Notes

- Les requêtes vers l'API Battle.net se font côté serveur (OAuth 2.0 *client credentials*), jamais depuis le navigateur.
- Les tokens sont mis en cache mémoire et rafraîchis avant expiration.
- `referrer: no-referrer` et aucune intégration analytique/tracking.
- Data Blizzard © Blizzard Entertainment.
