
import { gqlRequest } from './core';
import { Profile } from './types';

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
