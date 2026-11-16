# Déploiement du frontend

## Architecture retenue

Utiliser deux sous-domaines d’un même domaine :

- `crm.votre-domaine.com` : contenu compilé de `comsig-front-v1/dist` sur **Vercel**, via domaine personnalisé.
- `api.votre-domaine.com` : application Laravel `comsig-v2`, document root vers son dossier `public`.
- MySQL : accessible uniquement depuis Laravel, jamais depuis React.

Les noms sont des exemples, pas des domaines configurés. Aucun compte d’hébergement n’a été modifié.

## Variables de build

Utiliser `.env.production.example` comme modèle de variables Vercel (ou de `.env.production.local`) et remplacer :

```dotenv
VITE_API_BASE_URL=https://api.votre-domaine.com/api/v1
VITE_CSRF_URL=https://api.votre-domaine.com/sanctum/csrf-cookie
VITE_BASE_PATH=/
```

Puis exécuter `npm ci` et `npm run build`. Les variables `VITE_*` sont publiques et compilées dans JavaScript : aucune clé privée, aucun mot de passe MySQL et aucun jeton ne doit y figurer. Une modification d’URL d’API demande une nouvelle compilation.

## Alternative frontend Hostinger / Apache

Cette variante n’est pas le choix retenu actuellement ; Laravel reste hébergé chez Hostinger dans les deux cas.

1. Créer le sous-domaine frontend et vérifier son dossier racine exact.
2. Sauvegarder tout site déjà présent dans ce dossier avant remplacement.
3. Déposer **le contenu** de `dist`, y compris son `.htaccess`, dans le dossier frontend.
4. Ne pas déposer `src`, `node_modules`, `.env` ni le backend dans cet espace public.
5. Ne pas écraser le `.htaccess` de Laravel avec celui du frontend. Les deux applications ont des document roots distincts.
6. Activer HTTPS et vérifier l’ouverture directe de `/connexion`, `/clients` et `/devis` : le serveur doit retourner `index.html` pour ces routes React.
7. Si le domaine est derrière un cache/CDN, empêcher un cache durable de `index.html` pour que les nouvelles versions soient bien chargées.

## CORS et connexion

Dans l’environnement Laravel, autoriser uniquement l’origine frontend réelle via `FRONTEND_URLS`, par exemple `https://crm.votre-domaine.com`. Recharger la configuration de Laravel après changement. Ne pas utiliser une origine `*` pour contourner un défaut de configuration.

La version livrée utilise des sessions serveur **HttpOnly avec CSRF**, `credentials: include`, MFA TOTP et récupération de compte. Aucun jeton d’authentification conservé dans le navigateur. Le modèle backend `.env.vercel-hostinger.example` décrit les cookies partagés Secure/HttpOnly/Lax, les domaines Sanctum et CORS exacts. `FRONTEND_URL` fixe aussi l’origine des liens de récupération ; SMTP réel à configurer, les e-mails locaux restant privés sur disque. Voir [P02](VERIFICATION-P02-COMPLETE.md). Le contrôle statique `comsig:check-browser-security --production` doit être complété par des essais distants de cookies et d’e-mails.

Le backend doit tourner avec `APP_DEBUG=false` et ses secrets hors du document root. Les comptes de démonstration doivent être absents ou neutralisés. Vérifier les permissions avec plusieurs profils et le cloisonnement entre commerciaux. Se référer à la documentation de déploiement du backend pour MySQL, cron et sauvegardes.

## Vercel retenu pour React

Le dépôt contient `vercel.json` : commande `npm run build`, sortie `dist`, fallback SPA. Définir les URLs API/CSRF dans les variables de build. Utiliser le **sous-domaine personnalisé du même domaine que l’API** ; ne pas remplacer cette architecture par un domaine `vercel.app` indépendant autorisé seulement dans CORS. L’API PHP et MySQL restent chez Hostinger. Noms réels, DNS/TLS et recette cross-origin restent à configurer avant mise en service ; aucun déploiement réalisé.

Le fichier de configuration ne crée ni compte, ni projet, ni abonnement. Vérifier les conditions d’utilisation commerciale et l’offre choisie avant publication.

## Vérifications avant bascule réelle

- Session cookie/CSRF de production terminée et testée.
- Utilisateurs et droits réels validés ; aucun compte partagé de démonstration.
- API et frontend HTTPS, CORS limité et absence de secrets dans le bundle.
- Contrôles de portefeuille et de validation de devis vérifiés avec des comptes distincts.
- Factures toujours présentées comme internes tant que la certification FNE n’est pas portée.
- Double contrôle des règlements, sauvegardes et restauration validés avant usage financier réel.
- Vérification des modules à porter : ne pas activer les anciens écrans sur la seule base de leur présence dans le code source.
