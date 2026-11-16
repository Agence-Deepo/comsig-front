// Tuiles du modèle COM&SIG fourni pour le portail des départements : chaque tuile est l'image du modèle,
// découpée telle quelle (cadre doré, photo, bandeau, pictogramme et nom), sans aucune retouche.
// Source : docs/modeles/portail-departements.webp (découpe : docs/modeles/decouper-tuiles.py).
import direction from '../assets/portail/direction.webp';
import commercial from '../assets/portail/commercial.webp';
import production from '../assets/portail/production.webp';
import comptabilite from '../assets/portail/comptabilite.webp';
import regie from '../assets/portail/regie.webp';
import assistanat from '../assets/portail/assistanat_dg.webp';
import imprimerie from '../assets/portail/imprimerie.webp';
import terrain from '../assets/portail/terrain.webp';
import rh from '../assets/portail/rh.webp';

export interface ModelTile { src: string; label: string; width: number; height: number }

/** Code de la tuile → image du modèle et nom inscrit sur l'image. */
export const MODEL_TILES: Record<string, ModelTile> = {
  direction: { src: direction, label: 'Direction générale', width: 460, height: 324 },
  commercial: { src: commercial, label: 'Commerciale', width: 454, height: 325 },
  production: { src: production, label: 'Production', width: 458, height: 324 },
  comptabilite: { src: comptabilite, label: 'Comptabilité', width: 459, height: 307 },
  regie: { src: regie, label: 'Régie publicitaire et médias', width: 453, height: 307 },
  assistanat_dg: { src: assistanat, label: 'Assistante de direction', width: 458, height: 310 },
  imprimerie: { src: imprimerie, label: 'Imprimerie', width: 460, height: 322 },
  terrain: { src: terrain, label: 'Technicien terrain', width: 454, height: 321 },
  rh: { src: rh, label: 'Ressources humaines', width: 458, height: 322 },
};

/** La tuile garde l'image du modèle tant qu'elle porte le nom du modèle et qu'aucune photo ne la remplace. */
export const modelTileOf = (t: { code: string; label: string; photo?: string | null }) => {
  const m = MODEL_TILES[t.code];
  return m && m.label === t.label && !t.photo ? m : null;
};
