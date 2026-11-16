import { describe, expect, it } from 'vitest';
import { fileSize, validateAttachment } from './Attachments';

describe('pièces jointes', () => {
  const meta = {
    max_size_bytes: 15 * 1024 * 1024,
    allowed_extensions: ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'docx', 'xlsx', 'csv'],
  };
  it('accepte la casse et la taille exacte autorisée', () => {
    expect(validateAttachment({ name: 'DEVIS.PDF', size: meta.max_size_bytes }, meta)).toBeNull();
  });
  it('refuse les fichiers vides ou dépassant la limite réelle du serveur', () => {
    expect(validateAttachment({ name: 'vide.pdf', size: 0 }, meta)).toContain('vide');
    expect(
      validateAttachment({ name: 'photo.png', size: 2049 }, { ...meta, max_size_bytes: 2048 }),
    ).toContain('2 Ko');
  });
  it('refuse exécutables, fichiers sans extension, archives et SVG', () => {
    for (const name of ['script.php', 'photo.png.exe', 'archive.zip', 'image.svg', 'sans_extension'])
      expect(validateAttachment({ name, size: 10 }, meta)).toContain('Format non autorisé');
  });
  it('formate sans annoncer de stockage utilisé pour zéro octet', () => {
    expect(fileSize(0)).toBe('0 Ko');
    expect(fileSize(1024)).toBe('1 Ko');
    expect(fileSize(15 * 1048576)).toBe('15 Mo');
  });
});
