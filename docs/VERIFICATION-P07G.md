# P07-G — Radar et prise en charge des tâches déléguées

## Réalisations

- Le radar inspecte un ensemble borné de paramètres, d’en-têtes et de champs JSON non secrets pour reconnaître des signatures d’injection SQL, scripts, traversée de répertoires, commandes, gabarits et outils de sondage. Les mots de passe, jetons, codes et autres champs sensibles sont ignorés ; les alertes ne conservent ni contenu ni échantillon des requêtes.
- Les sondes de chemins sensibles sont refusées ; les autres signatures sont **en mode alerte par défaut**. Le mode optionnel `COMSIG_RADAR_MODE=block` refuse les requêtes détectées, mais n’est pas activé sans recette des faux positifs et validation de la politique de sécurité. Aucun blocage d’adresse automatique n’est effectué.
- Le radar limite la taille inspectée et la profondeur des structures. Il ne remplace ni une revue de sécurité ni un pare-feu complet ; les pièces jointes et certains champs JSON volumineux ou sensibles ne sont pas inspectés. En cas d’échec interne, le contrôle applicatif laisse poursuivre la requête et consigne l’erreur.
- Complément P07-H : la taille réelle du corps JSON est vérifiée même en l’absence d’un en-tête de taille fiable ; les corps supérieurs à 50 000 octets ne sont pas analysés par ce radar.
- Les nouvelles tâches déléguées enregistrent leur auteur et leur date de délégation ainsi que la date effective de prise en charge. Une réaffectation ou une remise à faire relance le suivi. Le rapport de gouvernance peut signaler les tâches non prises en charge selon les délais P1 à P5.
- La migration est additive : aucune date de délégation ni de prise en charge n’a été inventée pour les tâches historiques, qui restent exclues de ce contrôle lorsqu’aucune trace fiable n’existe.

## Vérifications

- Vérification ciblée regroupée : 29 tests Laravel et 210 assertions réussis, couvrant notamment les signatures du radar, la non-conservation des contenus, le mode optionnel de refus, les droits d’accès et la prise en charge d’une tâche déléguée.
- Compilation TypeScript/Vite réussie, avec un avertissement sur la taille du paquet principal.
- P07-H : 6 tests de sécurité ciblés, 42 assertions réussies après le renforcement de la limite de taille.
- P07-H : correction des paliers et du classement commercial pour utiliser l’atteinte exacte avant arrondi ; seuils et taux limités à deux décimales. Vérification regroupée : 13 tests, 134 assertions, y compris un cas juste en dessous du seuil et le refus de paliers dupliqués ou trop précis.
- Aucun blocage d’adresse ou plan de commission réel n’a été créé par les tests ; la migration a été appliquée à la base locale.

## Avant clôture et production

- P07-H : la console de sécurité et la page des archives ont été ouvertes en lecture seule dans le navigateur avec le compte super-administrateur de démonstration. Les informations, les sections et l’état vide des archives s’affichent ; aucun blocage, scellement ou contrôle n’a été déclenché. L’accès direction à la console a été refusé comme prévu. La recette visuelle avec un compte administrateur technique distinct, la parité visuelle et les règles métier, bases et taux de commission restent à valider.
- Le radar étendu est en alerte, sans blocage automatique des adresses. Son passage en mode refus, la configuration des proxys Hostinger et l’exécution réelle du planificateur nécessitent une décision et une vérification de déploiement. Les radars ne couvrent pas tous les vecteurs et ne sont pas annoncés comme une protection exhaustive.
- Les sections historiques relatives aux contrats et aux suggestions dépendent de fonctions classées en P10. Les données de tâches antérieures au suivi ne peuvent pas être reconstituées sans source fiable.
