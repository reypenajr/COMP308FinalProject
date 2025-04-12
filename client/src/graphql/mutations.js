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
      businessInfo {
        name
        description
        deals
        image
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
      businessInfo {
        name
        description
        deals
        image
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

//business post(new)
export const ANALYZE_SENTIMENT = gql`
  mutation AnalyzeSentiment($text: String!) {
    analyzeSentiment(text: $text)
  }
`;

export const ADD_REVIEW = gql`
  mutation AddReview($input: ReviewInput!) {
    addReview(input: $input) {
      id
      title
      category
      businessInfo {
        name
        reviews {
          reviewId
          text
          rating
          authorId
          authorName
          createdAt
        }
      }
    }
  }
`;

export const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
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

export const PREDICT_EVENT_TIMING = gql`
  mutation PredictEventTiming($eventId: ID!) {
    predictEventTiming(eventId: $eventId) {
      eventId
      predictedTiming
    }
  }
`;