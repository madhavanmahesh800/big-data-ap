
import { gqlRequest } from './core';
import { Message } from './types';

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
