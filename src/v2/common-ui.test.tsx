import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ErrorBox } from './ui';
import { HttpError } from './api';

describe('erreurs communes', () => {
  it('ne répète pas le message de validation retourné aussi dans errors', () => {
    const html = renderToStaticMarkup(
      <ErrorBox error={new HttpError(422, 'Code incorrect', { code: ['Code incorrect'] })} />,
    );
    expect(html.match(/Code incorrect/g)).toHaveLength(1);
    expect(html).toContain('Vérifiez les champs indiqués.');
  });
  it('conserve une erreur réseau exploitable sans erreur de champ', () => {
    const html = renderToStaticMarkup(<ErrorBox error={new HttpError(0, 'API inaccessible')} />);
    expect(html).toContain('API inaccessible');
    expect(html).toContain('role="alert"');
  });
  it('ne produit pas une fausse alerte quand aucune erreur ne reste', () => {
    expect(renderToStaticMarkup(<ErrorBox error={null} />)).toBe('');
  });
});
