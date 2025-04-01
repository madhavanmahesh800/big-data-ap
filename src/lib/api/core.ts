
import { toast } from "../ui/use-toast";

// Backend URL
export const API_URL = "http://localhost:4000/graphql";
export const UPLOAD_URL = "http://localhost:4000/upload";

// Local storage keys
export const TOKEN_KEY = 'social_app_token';
export const USERNAME_KEY = 'social_app_username';

// Token management functions
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

export const getUsername = (): string | null => localStorage.getItem(USERNAME_KEY);
export const setUsername = (username: string): void => localStorage.setItem(USERNAME_KEY, username);
export const removeUsername = (): void => localStorage.removeItem(USERNAME_KEY);

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Base GraphQL request function
export const gqlRequest = async <T>(
  query: string, 
  variables: Record<string, any> = {}, 
  requireAuth = true
): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      // Handle HTTP errors (e.g., 401 Unauthorized, 500 Server Error)
      const errorText = await response.text();
      console.error(`HTTP Error: ${response.status} - ${errorText}`);
      
      // If token is invalid, clear auth data
      if (response.status === 401) {
        removeToken();
        removeUsername();
        throw new Error('Session expired. Please log in again.');
      }
      
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      
      // Check for authentication errors in GraphQL response
      const authError = result.errors.find((e: any) => 
        e.message.includes('Unauthorized') || 
        e.message.includes('authentication') ||
        e.message.includes('token')
      );
      
      if (authError) {
        // If there's an auth error, clear credentials
        removeToken();
        removeUsername();
        throw new Error('Session expired. Please log in again.');
      }
      
      throw new Error(result.errors[0].message);
    }

    return result.data as T;
  } catch (error) {
    console.error('API Error:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive",
    });
    throw error;
  }
};

// File upload function
export const uploadFile = async (file: File): Promise<string> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'File upload failed');
    }

    return result.filePath;
  } catch (error) {
    console.error('Upload Error:', error);
    toast({
      title: "Upload Failed",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive",
    });
    throw error;
  }
};
