const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    role: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Emergency {
    severity: String
    resolved: Boolean
  }

  type HelpRequest {
    status: String
    volunteers: [ID]
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    category: String!
    author: User!
    authorName: String!
    createdAt: String!
    updatedAt: String!
    emergency: Emergency
    helpRequest: HelpRequest
  }

  input RegisterInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    role: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input PostInput {
    title: String!
    content: String!
    category: String!
    severity: String
  }

  input UpdatePostInput {
    title: String
    content: String
    category: String
    severity: String
    resolved: Boolean
    status: String
  }

  type Query {
    # User Queries
    me: User

    # Post Queries
    getPosts: [Post!]!
    getPostsByCategory(category: String!): [Post!]!
    getPost(id: ID!): Post
    getEvents: [Event!]!
    getEvent(id: ID!): Event
    events: [Event]
    getOrganizerEvents: [Event]
    getVolunteers: [User]
  }

  type Mutation {
    # Auth Mutations
    register(input: RegisterInput!): User!
    login(input: LoginInput!): AuthPayload!

    # Post Mutations
    createPost(input: PostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): Boolean!
    volunteerForHelpRequest(postId: ID!): Post!
    createEvent(input: CreateEventInput!): Event!
    updateEvent(id: ID!, input: CreateEventInput!): Event!
    deleteEvent(id: ID!): Boolean!

  }

  type Event {
    id: ID!
    title: String!
    description: String!
    location: String!
    date: String!
    createdBy: User!
    createdByName: String!
    createdAt: String!
  }

  input CreateEventInput {
    title: String!
    description: String!
    location: String!
    date: String!
    createdBy: String
  }


`;

module.exports = typeDefs;
