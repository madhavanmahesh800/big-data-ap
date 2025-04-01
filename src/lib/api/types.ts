
// Common types used across the API modules
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
