# P05-B — État au passage à P06

04/11/2026. Développement : trois exports commerciaux PDF/DOCX/XLSX, papier en-tête source conservé, courrier EML privé sans SMTP ni changement de statut, tarifs par catégorie explicites, coûts CUMP/dernière entrée/fournisseur/nomenclature. Les coûts et notes internes sont exclus des exports.

PDF : fixtures de 3 et 24 lignes rendues et inspectées sur toutes leurs pages ; conditions/signature regroupées. XLSX : import et rendu de contrôle, valeurs monétaires numériques figées, chaînes non interprétées comme formules. DOCX : package, XML et papier en-tête contrôlés ; **validation visuelle Word non effectuée**, le runtime de rendu ne contient pas LibreOffice (`soffice.exe` absent). Les guides PDF/Word/tableur ont imposé ces contrôles ; aucun fichier non rendu n’est annoncé visuellement conforme.

Dernière suite complète API : 198 tests réussis et un échec de fixture (import DB manquant, corrigé sans nouvelle relance exhaustive). Suite frontend : 53 tests réussis, compilation réussie. Passe navigateur complète : 48 réussites, un nouveau scénario mail à reprendre, trois comparaisons source non exécutées. Reprise ciblée interrompue à la demande utilisateur de privilégier P06 : scénario tarification réussi ; contrôles mail/fournisseur restant à terminer, dont appel GET de recette sans en-tête Origin corrigé. Ne pas présenter cette reprise comme validée.

Limites maintenues : aucun e-mail réel, déploiement, réservation de stock ou comptabilisation implicite. Nomenclature = coût matière seulement, sans coût de main-d’œuvre inventé ; rapprochement régie/stock complet en P08. Les seuils de validation existants n’ont pas été modifiés. P05-B reste en réception technique/visuelle, pas clôturée.

## Reprise P05-C du 06/11/2026

- Recette regroupée sur SQLite isolée : 39 tests serveur, 446 assertions ; six scénarios navigateur réussis après reprise ciblée, couvrant création et versions, validation DG, PDF/Word/Excel, courrier EML privé, catégorie tarifaire et tarif fournisseur de la production au devis commercial.
- Le contrôle mobile du courrier a révélé un débordement horizontal ; les éléments de la liste se replient désormais dans la largeur disponible. Les sélecteurs et l'origine de la requête de vérification du scénario fournisseur ont été corrigés.
- Le moteur de rendu Word `render_docx.py` a été lancé sur un document généré : il échoue car `soffice.exe` de LibreOffice n'est pas disponible dans le runtime. La structure DOCX et le papier en-tête sont testés, mais cela ne remplace pas l'inspection visuelle de toutes les pages. Le rendu Word et l'acceptation utilisateur restent ouverts.
- Les nomenclatures P08 sont raccordées aux articles de stock ; leur valorisation dans le devis comprend les matières, pas une main-d'œuvre supposée. Les anciens snapshots restent inchangés. Aucun envoi réel ou mouvement de stock n'a été effectué.
