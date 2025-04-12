import { gql } from '@apollo/client';

// Register mutation
export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterInput!) {
    register(input: $input) {
      id
      firstName
      lastName
      email
      role
      createdAt
    }
  }
`;

// Login mutation
export const LOGIN_USER = gql`
  mutation LoginUser($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        firstName
        lastName
        email
        role
        createdAt
      }
    }
  }
`;

// Create post mutation
export const CREATE_POST = gql`
  mutation CreatePost($input: PostInput!) {
    createPost(input: $input) {
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

// Update post mutation
export const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
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

// Delete post mutation
export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;

// Volunteer for help request mutation
export const VOLUNTEER_FOR_HELP_REQUEST = gql`
  mutation VolunteerForHelpRequest($postId: ID!) {
    volunteerForHelpRequest(postId: $postId) {
      id
      title
      helpRequest {
        status
        volunteers
      }
    }
  }
`;