
import { gqlRequest, getToken, setToken, setUsername, removeToken, removeUsername } from './core';

// Auth API Functions
export const register = async (username: string, password: string): Promise<string> => {
  const query = `
    mutation Register($username: String!, $password: String!) {
      register(username: $username, password: $password)
    }
  `;
  
  const response = await gqlRequest<{ register: string }>(
    query, 
    { username, password },
    false
  );
  
  return response.register;
};

export const login = async (username: string, password: string): Promise<string> => {
  const query = `
    mutation Login($username: String!, $password: String!) {
      login(username: $username, password: $password)
    }
  `;
  
  const response = await gqlRequest<{ login: string }>(
    query, 
    { username, password },
    false
  );
  
  // Save the token and username
  const token = response.login;
  setToken(token);
  setUsername(username);
  
  return token;
};

export const logout = async (): Promise<string> => {
  const query = `
    mutation Logout {
      logout
    }
  `;
  
  const response = await gqlRequest<{ logout: string }>(query);
  
  // Clear local storage
  removeToken();
  removeUsername();
  
  return response.logout;
};
