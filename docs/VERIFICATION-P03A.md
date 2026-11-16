# P03-A — Clients, contacts et prospection

3 novembre 2026. Premier sous-lot réalisé ; **P03 reste en cours et la validation utilisateur reste ouverte**. La demande était de terminer P02 puis de commencer P03, pas de déclarer toute la fusion CRM achevée.

## Changements visibles

- [Clients et contacts](http://127.0.0.1:5174/clients) : listes dédiées, recherche, filtres secteur/commune/type/potentiel/qualification/responsable selon profil, rôle du contact, tri, pagination et CSV correspondant à la sélection. Filtres conservés dans l’URL au rechargement.
- Formulaires détaillés : personne ressource et fonction, nom commercial, secteur, structure, source, taille, potentiel, identifiant légal/NCC distincts, coordonnées, commune/ville, site et notes. Contacts : civilité, service, rôle de décision, mobile, canal préféré, contact principal et opposition aux sollicitations.
- Fiche client : vue d’ensemble, qualification, contacts et dossiers liés paginés (historique, tâches, opportunités, propositions, factures uniquement si autorisées), onglet Documents privé, actions de création liées. La lecture d’un client ne donne pas automatiquement accès à sa finance.
- [Prospection](http://127.0.0.1:5174/prospection) : vraie page, plus une redirection ; compteurs calculés sur le portefeuille entier, filtres et accès aux fiches.
- Qualification reprise de la source : sept critères, score calculé côté serveur, cinq au minimum pour qualifier (71 %), motif obligatoire pour disqualifier. Impossible de forcer le score ou l’état via un simple PATCH de profil.
- Un nouveau prospect reçoit un appel de premier contact à deux jours dans son portefeuille. Ce n’est pas un appel réellement effectué ; aucun message externe envoyé. La vue « sans contact depuis 14 j » se base sur les interactions terminées, pas les appels futurs planifiés.

La structure et les composants CRM ont guidé l’implémentation locale via le skill Sites. Les contrôles mobiles et captures ont conduit à corriger l’étirement de la fiche et le retour à la ligne des noms longs. **Aucune comparaison pixel exhaustive de ces nouvelles fiches n’est annoncée** : des écarts fonctionnels/source sont explicités ci-dessous.

## Recette et essai guidé

1. Avec `awa` en local, ouvrir Prospection puis « Nouveau prospect » ; renseigner raison sociale, personne ressource, secteur et coordonnées.
2. Dans la fiche, ouvrir Historique et retrouver l’appel de premier contact ; cliquer Qualifier.
3. Essayer de qualifier avec quatre critères : refus serveur ; en compléter cinq et enregistrer : score 71 %.
4. Ajouter un contact décideur, cocher interlocuteur principal/opposition, puis actualiser. Un second principal remplace le précédent sans supprimer le contact.
5. Consulter les onglets de dossiers réellement autorisés et Documents. Revenir à Prospection, filtrer, actualiser et télécharger le CSV.

Les sept tests API P03 couvrent persistance des champs, premier contact y compris avec un nom de 200 caractères, qualification et impossibilité de la contourner, filtres/options/agrégats hors portefeuille, contact principal/opposition, droits propres aux dossiers liés et CSV sécurisé. Deux nouveaux scénarios navigateur couvrent ce parcours ordinateur et le mobile 390 × 844 : formulaire, focus, nom long, onglets, notifications, rechargement et absence de débordement. Voir [la recette globale P02/P03](VERIFICATION-P02-COMPLETE.md) pour les totaux finaux.

Captures inspectées : [prospection ordinateur](apercu-p03-prospection-desktop.png), [contacts ordinateur](apercu-p03-contacts-desktop.png), [client mobile](apercu-p03-client-mobile.png).

## Sous-lot suivant de P03

Mise à jour : la détection/justification des doublons, la fusion manuelle conservatoire et les liens projets/campagnes ERP ont depuis été ajoutés en [P03-B](VERIFICATION-P03B.md). La liste ci-dessous décrit le reste au moment de la livraison P03-A ; réattribution, décisions et parité exhaustive restent ouverts.

- Taxonomies administrables de la source : les secteurs/communes actuels proviennent des valeurs accessibles, et le formulaire accepte encore du texte.
- Détection et justification des doublons, fusion contrôlée, réattribution coordonnée, tags et estimation annuelle.
- Historique avec résultats de contact/canaux/relances complets, décisions et vue 360° exhaustive ; liens contrats/campagnes/réclamations seulement quand leurs API et règles seront réellement raccordées.
- Tris et indicateurs CA/dernière activité conformes à leur définition ; classement client après validation d’une formule explicite, sans statistiques inventées.
- Comparaison source/cible approfondie, autres profils et validation métier utilisateur.

Contrat : `C:\wamp64\www\comsig-v2\docs\CUSTOMERS-API.md`. Les données historiques ne sont pas importées et les sources ne sont pas modifiées. Aucune fusion/suppression réelle de dossiers n’a été déclenchée.
