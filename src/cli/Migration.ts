export abstract class Migration {
    /**
     * Método chamado para aplicar a migração.
     */
    abstract up(): Promise<void>;
  
    /**
     * Método chamado para reverter a migração.
     */
    abstract down(): Promise<void>;
  }