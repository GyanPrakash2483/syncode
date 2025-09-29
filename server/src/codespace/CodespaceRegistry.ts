import Codespace from "./Codespace";

class CodespaceRegistryTemplate {
  private codespaces:Record<string, Codespace> = {};

  /**
   * Creates a new codespace
   * @returns ID of newly generated codespace.
   */
  createNewCodespace(): string {
    const newcodespace = new Codespace();
    this.codespaces[newcodespace.codespaceId] = newcodespace;
    return newcodespace.codespaceId
  }

  codespaceExists(codespaceId: string): boolean {
    return Boolean(this.codespaces[codespaceId])
  }

  getCodespace(codespaceId: string): Codespace | null {
    if(this.codespaceExists(codespaceId)) {
      return this.codespaces[codespaceId];
    } else {
      return null;
    }
  }

}

/**
 * Codespace Registry
 */
const CodespaceRegistry = new CodespaceRegistryTemplate();

export default CodespaceRegistry;