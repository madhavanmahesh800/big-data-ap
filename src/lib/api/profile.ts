
import { gqlRequest } from './core';
import { Profile } from './types';

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
