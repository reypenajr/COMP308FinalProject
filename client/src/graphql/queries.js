import { gql } from '@apollo/client';

// Current user query
export const CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      firstName
      lastName
      email
      role
      createdAt
    }
  }
`;

// All posts query
export const GET_POSTS = gql`
  query GetPosts {
    getPosts {
      id
      title
      content
      category
      authorName
      createdAt
      updatedAt
      emergency {
        severity
        resolved
      }
      helpRequest {
        status
        volunteers
      }
      author {
        id
        firstName
        lastName
        role
      }
    }
  }
`;

// Posts by category query
export const GET_POSTS_BY_CATEGORY = gql`
  query GetPostsByCategory($category: String!) {
    getPostsByCategory(category: $category) {
      id
      title
      content
      category
      authorName
      createdAt
      updatedAt
      emergency {
        severity
        resolved
      }
      helpRequest {
        status
        volunteers
      }
      author {
        id
        firstName
        lastName
        role
      }
    }
  }
`;

// Single post query
export const GET_POST = gql`
  query GetPost($id: ID!) {
    getPost(id: $id) {
      id
      title
      content
      category
      authorName
      createdAt
      updatedAt
      emergency {
        severity
        resolved
      }
      helpRequest {
        status
        volunteers
      }
      author {
        id
        firstName
        lastName
        role
      }
    }
  }
`;