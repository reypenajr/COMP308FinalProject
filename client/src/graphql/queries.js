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

// All posts query (for residents)
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
      businessInfo {
        name
        description
        deals
        image
        reviews {
          reviewId
          text
          rating
          authorId
          authorName
          createdAt
        }
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

// Get all posts regardless of role
export const GET_ALL_POSTS = gql`
  query GetAllPosts {
    getAllPosts {
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
      businessInfo {
        name
        description
        deals
        image
        reviews {
          reviewId
          text
          rating
          authorId
          authorName
          createdAt
        }
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
      businessInfo {
        name
        description
        deals
        image
        reviews {
          reviewId
          text
          rating
          authorId
          authorName
          createdAt
        }
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
      businessInfo {
        name
        description
        deals
        image
        reviews {
          reviewId
          text
          rating
          authorId
          authorName
          createdAt
        }
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

//get businessposts (new)
export const GET_BUSINESS_POSTS = gql`
  query GetBusinessPosts {
    getBusinessPosts {
      id
      title
      content
      category
      authorName
      createdAt
      updatedAt
      businessInfo {
        name
        description
        deals
        image
        reviews {
          reviewId
          text
          rating
          authorId
          authorName
          createdAt
        }
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


// Get All Events Query
export const GET_EVENTS = gql`
  query GetEvents {
    getEvents {
      id
      title
      description
      location
      date
      createdBy {
        id
        firstName
        lastName
      }
      createdByName
      createdAt
    }
  }
`;

// Get Single Event Query
export const GET_EVENT = gql`
  query GetEvent($id: ID!) {
    getEvent(id: $id) {
      id
      title
      description
      location
      date
      createdBy {
        id
        firstName
        lastName
      }
      createdByName
      createdAt
    }
  }
`;

export const GET_ORGANIZER_EVENTS = gql`
  query GetOrganizerEvents {
    getOrganizerEvents{
      id
      title
      description
      location
      date
      createdBy {
        id
        firstName
        lastName
      }
      createdByName
      createdAt
    }
  }
`;
export const GET_VOLUNTEERS = gql`
  query GetVolunteers {
    getVolunteers {
      id
      firstName
      lastName
      email
      role
      createdAt
    }
  }
`;
