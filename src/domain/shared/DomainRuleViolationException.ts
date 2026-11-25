/**
 * Excepción lanzada cuando una operación intenta vulnerar una invariante
 * de negocio (RN-01 a RN-10) definida en el modelo de dominio de ESPACIO.
 */
export class DomainRuleViolationException extends Error {
  public readonly codigoRegla: string;

  constructor(codigoRegla: string, mensaje: string) {
    super(`[${codigoRegla}] ${mensaje}`);
    this.name = "DomainRuleViolationException";
    this.codigoRegla = codigoRegla;
  }
}
