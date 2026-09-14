# outils-stat

Stats de jeu, sans bruit. Interface épurée, zéro publicité, zéro tracking — juste de la data issue des APIs officielles, présentée clairement.

Source initiale : **API Battle.net (Blizzard)**, gratuite.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router, TypeScript, React 19)
- [Tailwind CSS v4](https://tailwindcss.com/)
- Hébergement : [Vercel](https://vercel.com/) (abonnement gratuit)

## Sources

- **World of Warcraft** (Battle.net API) : statut des royaumes connectés, files d'attente, population — par région (US / EU / KR / TW).
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
| `/a-propos` | Le concept |
| `/api/blizzard/status` | État de configuration de l'API Blizzard |
| `/api/blizzard/wow/stats?region=eu` | Stats WoW agrégées par région |

## Déploiement sur Vercel

1. Connecter le dépôt GitHub dans Vercel.
2. Ajouter les variables d'environnement `BATTLE_NET_CLIENT_ID` et `BATTLE_NET_CLIENT_SECRET` dans les paramètres du projet Vercel.
3. Déployer (framework auto-détecté : Next.js).

## Notes

- Les requêtes vers l'API Battle.net se font côté serveur (OAuth 2.0 *client credentials*), jamais depuis le navigateur.
- Les tokens sont mis en cache mémoire et rafraîchis avant expiration.
- `referrer: no-referrer` et aucune intégration analytique/tracking.
- Data Blizzard © Blizzard Entertainment.
