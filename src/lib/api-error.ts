// Erreur d'API typée (partagée par le client HTTP et le mode démonstration)
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public fields?: Record<string, string>, public details?: any) {
    super(message);
  }
}

