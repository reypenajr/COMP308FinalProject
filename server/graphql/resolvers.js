const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Post = require('../models/Post');
const { AuthenticationError, UserInputError, ForbiddenError } = require('apollo-server-express');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Context helper to get authenticated user
const getAuthenticatedUser = async (context) => {
  const authHeader = context.req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Authentication token must be provided');
  }

  const token = authHeader.split('Bearer ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (err) {
    throw new AuthenticationError('Invalid/Expired token');
  }
};

// Check if user is a resident
const checkIsResident = (user) => {
  if (user.role !== 'Resident') {
    throw new ForbiddenError('Access denied. Only Residents can perform this action.');
  }
};

const resolvers = {
  Query: {
    // Get current user
    me: async (_, __, context) => {
      const user = await getAuthenticatedUser(context);
      return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      };
    },
    
    // Get all posts
    getPosts: async () => {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts.map(post => ({
          id: post._id,
          ...post._doc
        }));
      } catch (err) {
        throw new Error('Error fetching posts');
      }
    },
    
    // Get posts by category
    getPostsByCategory: async (_, { category }) => {
      try {
        const posts = await Post.find({ category }).sort({ createdAt: -1 });
        return posts.map(post => ({
          id: post._id,
          ...post._doc
        }));
      } catch (err) {
        throw new Error('Error fetching posts by category');
      }
    },
    
    // Get single post
    getPost: async (_, { id }) => {
      try {
        const post = await Post.findById(id);
        if (!post) {
          throw new Error('Post not found');
        }
        return {
          id: post._id,
          ...post._doc
        };
      } catch (err) {
        throw new Error('Error fetching post');
      }
    }
  },
  
  Mutation: {
    // Register a new user
    register: async (_, { input: { firstName, lastName, email, password, role } }) => {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new UserInputError('Email already taken');
        }
        
        // Create new user
        const user = new User({
          firstName,
          lastName,
          email,
          password,
          role
        });
        
        await user.save();
        
        return {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        };
      } catch (err) {
        throw new Error('Error creating user');
      }
    },
    
    // Login user
    login: async (_, { input: { email, password } }) => {
      try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
          throw new UserInputError('Invalid credentials');
        }
        
        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
          throw new UserInputError('Invalid credentials');
        }
        
        // Generate token
        const token = generateToken(user);
        
        return {
          token,
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
          }
        };
      } catch (err) {
        throw new Error('Login failed');
      }
    },
    
    // Create a new post
    createPost: async (_, { input }, context) => {
      try {
        const user = await getAuthenticatedUser(context);
        checkIsResident(user);
        
        const { title, content, category, severity } = input;
        
        const post = new Post({
          title,
          content,
          category,
          author: user._id,
          authorName: `${user.firstName} ${user.lastName}`
        });
        
        if (category === 'Emergency Alert' && severity) {
          post.emergency = { severity, resolved: false };
        }
        
        if (category === 'Help Request') {
          post.helpRequest = { status: 'Open', volunteers: [] };
        }
        
        await post.save();
        
        return {
          id: post._id,
          ...post._doc,
          author: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
          }
        };
      } catch (err) {
        throw new Error('Error creating post: ' + err.message);
      }
    },
    
    // Update an existing post
    updatePost: async (_, { id, input }, context) => {
      try {
        const user = await getAuthenticatedUser(context);
        
        const post = await Post.findById(id);
        if (!post) {
          throw new Error('Post not found');
        }
        
        // Check if user is the author
        if (post.author.toString() !== user._id.toString()) {
          throw new ForbiddenError('Not authorized to update this post');
        }
        
        const { title, content, category, severity, resolved, status } = input;
        
        if (title) post.title = title;
        if (content) post.content = content;
        if (category) post.category = category;
        post.updatedAt = Date.now();
        
        if (category === 'Emergency Alert' || post.category === 'Emergency Alert') {
          if (!post.emergency) {
            post.emergency = { severity: 'Medium', resolved: false };
          }
          
          if (severity) post.emergency.severity = severity;
          if (resolved !== undefined) post.emergency.resolved = resolved;
        }
        
        if (category === 'Help Request' || post.category === 'Help Request') {
          if (!post.helpRequest) {
            post.helpRequest = { status: 'Open', volunteers: [] };
          }
          
          if (status) post.helpRequest.status = status;
        }
        
        await post.save();
        
        return {
          id: post._id,
          ...post._doc,
          author: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
          }
        };
      } catch (err) {
        throw new Error('Error updating post: ' + err.message);
      }
    },
    
    // Delete a post
    deletePost: async (_, { id }, context) => {
      try {
        const user = await getAuthenticatedUser(context);
        
        const post = await Post.findById(id);
        if (!post) {
          throw new Error('Post not found');
        }
        
        // Check if user is the author
        if (post.author.toString() !== user._id.toString()) {
          throw new ForbiddenError('Not authorized to delete this post');
        }
        
        await Post.findByIdAndDelete(id);
        return true;
      } catch (err) {
        throw new Error('Error deleting post');
        return false;
      }
    },
    
    // Volunteer for a help request
    volunteerForHelpRequest: async (_, { postId }, context) => {
      try {
        const user = await getAuthenticatedUser(context);
        
        const post = await Post.findById(postId);
        if (!post) {
          throw new Error('Post not found');
        }
        
        if (post.category !== 'Help Request') {
          throw new UserInputError('Can only volunteer for Help Request posts');
        }
        
        if (post.helpRequest.volunteers.includes(user._id)) {
          throw new UserInputError('You have already volunteered for this request');
        }
        
        post.helpRequest.volunteers.push(user._id);
        
        if (post.helpRequest.status === 'Open') {
          post.helpRequest.status = 'In Progress';
        }
        
        await post.save();
        
        return {
          id: post._id,
          ...post._doc,
          author: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
          }
        };
      } catch (err) {
        throw new Error('Error volunteering for help request: ' + err.message);
      }
    }
  },
  
  Post: {
    // Resolve author field with full User data
    author: async (parent) => {
      try {
        const user = await User.findById(parent.author);
        return {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        };
      } catch (err) {
        throw new Error('Error fetching author data');
      }
    }
  }
};

module.exports = resolvers;