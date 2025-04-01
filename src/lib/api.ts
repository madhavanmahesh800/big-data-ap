import { toast } from "../components/ui/use-toast";

// Backend URL
const API_URL = "http://localhost:4000/graphql";
const UPLOAD_URL = "http://localhost:4000/upload";

export interface AuthResponse {
  data?: {
    login?: string;
    register?: string;
  };
  errors?: Array<{ message: string }>;
}

export interface Profile {
  _id: string;
  username: string;
  profile_photo?: string;
  description?: string;
}

export interface Post {
  _id: string;
  owner: Profile;
  imagePath: string;
  description?: string;
  timestamp: string;
}

export interface Message {
  _id: string;
  owner: Profile;
  message: string;
  timestamp: string;
}

// Local storage keys
const TOKEN_KEY = 'social_app_token';
const USERNAME_KEY = 'social_app_username';

// Authentication Functions
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

export const getUsername = (): string | null => localStorage.getItem(USERNAME_KEY);
export const setUsername = (username: string): void => localStorage.setItem(USERNAME_KEY, username);
export const removeUsername = (): void => localStorage.removeItem(USERNAME_KEY);

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// GraphQL API Functions
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

// File Upload Function
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

// Profile API Functions
export const getUserProfile = async (username: string): Promise<Profile> => {
  const query = `
    query GetUserProfile($username: String!) {
      getUserProfile(username: $username) {
        _id
        username
        profile_photo
        description
      }
    }
  `;
  
  const response = await gqlRequest<{ getUserProfile: Profile }>(
    query, 
    { username }
  );
  
  return response.getUserProfile;
};

export const updateProfile = async (profile_photo?: string, description?: string): Promise<Profile> => {
  const query = `
    mutation UpdateProfile($profile_photo: String, $description: String) {
      updateProfile(profile_photo: $profile_photo, description: $description) {
        _id
        username
        profile_photo
        description
      }
    }
  `;
  
  const response = await gqlRequest<{ updateProfile: Profile }>(
    query, 
    { profile_photo, description }
  );
  
  return response.updateProfile;
};

// Social API Functions
export const getFollowers = async (): Promise<string[]> => {
  const query = `
    query GetFollowers {
      getFollowers
    }
  `;
  
  const response = await gqlRequest<{ getFollowers: string[] }>(query);
  
  return response.getFollowers;
};

export const getFollowing = async (): Promise<string[]> => {
  const query = `
    query GetFollowing {
      getFollowing
    }
  `;
  
  const response = await gqlRequest<{ getFollowing: string[] }>(query);
  
  return response.getFollowing;
};

export const followUser = async (target: string): Promise<string> => {
  const query = `
    mutation FollowUser($target: String!) {
      followUser(target: $target)
    }
  `;
  
  const response = await gqlRequest<{ followUser: string }>(
    query, 
    { target }
  );
  
  return response.followUser;
};

export const unfollowUser = async (target: string): Promise<string> => {
  const query = `
    mutation UnfollowUser($target: String!) {
      unfollowUser(target: $target)
    }
  `;
  
  const response = await gqlRequest<{ unfollowUser: string }>(
    query, 
    { target }
  );
  
  return response.unfollowUser;
};

// Post API Functions
export const getPostsForFollowers = async (): Promise<Post[]> => {
  const query = `
    query GetPostsForFollowers {
      getPostsForFollowers {
        _id
        owner {
          _id
          username
          profile_photo
        }
        imagePath
        description
        timestamp
      }
    }
  `;
  
  const response = await gqlRequest<{ getPostsForFollowers: Post[] }>(query);
  
  return response.getPostsForFollowers;
};

export const createPost = async (imagePath: string, description?: string): Promise<Post> => {
  const query = `
    mutation CreatePost($imagePath: String!, $description: String) {
      createPost(imagePath: $imagePath, description: $description) {
        _id
        imagePath
        description
        timestamp
        owner {
          _id
          username
          profile_photo
        }
      }
    }
  `;
  
  const response = await gqlRequest<{ createPost: Post }>(
    query, 
    { imagePath, description }
  );
  
  return response.createPost;
};

// Messages API Functions
export const getMessages = async (): Promise<Message[]> => {
  const query = `
    query GetMessages {
      getMessages {
        _id
        owner {
          _id
          username
          profile_photo
        }
        message
        timestamp
      }
    }
  `;
  
  const response = await gqlRequest<{ getMessages: Message[] }>(query);
  
  return response.getMessages;
};

export const sendMessage = async (message: string): Promise<Message> => {
  const query = `
    mutation SendMessage($message: String!) {
      sendMessage(message: $message) {
        _id
        message
        timestamp
        owner {
          _id
          username
          profile_photo
        }
      }
    }
  `;
  
  const response = await gqlRequest<{ sendMessage: Message }>(
    query, 
    { message }
  );
  
  return response.sendMessage;
};

export const deleteMessage = async (messageId: string): Promise<string> => {
  const query = `
    mutation DeleteMessage($messageId: ID!) {
      deleteMessage(messageId: $messageId)
    }
  `;
  
  const response = await gqlRequest<{ deleteMessage: string }>(
    query, 
    { messageId }
  );
  
  return response.deleteMessage;
};

// Recommendations
export const getRecommendations = async (): Promise<Profile[]> => {
  const query = `
    query GetRecommendations {
      getRecommendations {
        _id
        username
        profile_photo
        description
      }
    }
  `;
  
  const response = await gqlRequest<{ getRecommendations: Profile[] }>(query);
  
  return response.getRecommendations;
};
