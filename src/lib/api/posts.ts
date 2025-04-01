
import { gqlRequest } from './core';
import { Post } from './types';

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
