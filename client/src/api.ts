const api_endpoint = "http://localhost:8080/api"

export interface CreateCodespaceResponse {
  success: boolean,
  codespaceId: string | null
}

const api = {

  /**
   * Checks wether a codespace exists or not
   * @param codespaceId ID of the codespace
   * @returns Boolean indicating wether the codespace exists or not
   */
  codespaceExist: async (codespaceId: string): Promise<boolean> => {
    const response = await fetch(`${api_endpoint}/existcodespace?codespaceId=${codespaceId}`);
    const data = await response.json();
    return Boolean(data.exists);
  },

  /**
   * Creates a new codespace
   * @param username Username to join the newly created codespace as
   * @returns ID of the newly created codespace
   */
  createCodespace: async (username: string): Promise<CreateCodespaceResponse> => {
    const response = await fetch(`${api_endpoint}/createcodespace`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username
      })
    });
    const data = await response.json();

    return data
  }
}

export default api;