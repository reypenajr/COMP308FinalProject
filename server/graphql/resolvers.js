const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Post = require('../models/Post');
const Event = require('../models/Event');
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
  console.log('Verifying token:', token ? 'Token provided' : 'No token');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully, user ID:', decoded.id);
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.error('User not found for ID:', decoded.id);
      throw new Error('User not found');
    }
    
    console.log('User authenticated:', user.firstName, user.lastName, user.role);
    return user;
  } catch (err) {
    console.error('Token verification failed:', err.message);
    throw new AuthenticationError('Invalid/Expired token');
  }
};

// Check for valid post creation role
const checkValidPostCreator = (user, category) => {
  if (category === 'Business' && user.role !== 'BusinessOwner') {
    throw new ForbiddenError('Access denied. Only Business Owners can create business posts.');
  } else if (category !== 'Business' && user.role !== 'Resident') {
    throw new ForbiddenError('Access denied. Only Residents can create community posts.');
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
    
    // Get all posts (for residents only)
    getPosts: async () => {
      try {
        const posts = await Post.find({ 
          $or: [
            { 'category': { $ne: 'Business' } }
          ]
        }).sort({ createdAt: -1 });
        
        return posts.map(post => ({
          id: post._id,
          ...post._doc,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString()
        }));
      } catch (err) {
        throw new Error('Error fetching posts');
      }
    },
    
    // Get all posts regardless of role
    getAllPosts: async (_, __, context) => {
      try {
        const user = await getAuthenticatedUser(context);
        const posts = await Post.find().sort({ createdAt: -1 });
        
        return posts.map(post => ({
          id: post._id,
          ...post._doc,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString()
        }));
      } catch (err) {
        throw new Error('Error fetching all posts');
      }
    },
    
    // Get business posts
    getBusinessPosts: async (_, __, context) => {
      try {
        const user = await getAuthenticatedUser(context);
        
        // Get business posts from the database
        const posts = await Post.find({ 
          category: 'Business',
          author: user._id 
        }).sort({ createdAt: -1 });
        
        return posts.map(post => ({
          id: post._id,
          ...post._doc,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString()
        }));
      } catch (err) {
        throw new Error('Error fetching business posts');
      }
    },
    
    // Get posts by category
    getPostsByCategory: async (_, { category }) => {
      try {
        const posts = await Post.find({ category }).sort({ createdAt: -1 });
        return posts.map(post => ({
          id: post._id,
          ...post._doc,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString()
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
          ...post._doc,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString()
        };
      } catch (err) {
        throw new Error('Error fetching post');
      }
    },

    // Get all events
    getEvents: async () => {
      try {
        const events = await Event.find().sort({ createdAt: -1 });
        return events.map(event => ({
          id: event._id,
          ...event._doc,
          createdAt: event.createdAt.toISOString()
        }));
      } catch (err) {
        throw new Error('Error fetching events');
      }
    },
    

    getOrganizerEvents: async (_, __, context) => {
      const user = await getAuthenticatedUser(context);
    
      // Only allow organizers to fetch their own events
      if (user.role !== 'CommunityOrganizer') {
        throw new ForbiddenError('Only organizers can view their events.');
      }
    
      try {
        const events = await Event.find({ createdBy: user._id }).sort({ createdAt: -1 });
        return events.map(event => ({
          id: event._id,
          ...event._doc,
          createdAt: event.createdAt.toISOString(),
        }));
      } catch (err) {
        throw new Error('Error fetching organizer events');
      }
    },

    // Fetch a single event by ID
    getEvent: async (_, { id }) => {
      try {
        const event = await Event.findById(id);
        if (!event) {
          throw new Error('Event not found');
        }
        return {
          id: event._id,
          ...event._doc,
          createdAt: event.createdAt.toISOString()
        };
      } catch (err) {
        throw new Error('Error fetching event');
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
        const { title, content, category, severity, businessName, businessDescription, businessDeals, businessImage } = input;
        
        // Check if the user role is appropriate for the post type
        if (category === 'Business' && user.role !== 'BusinessOwner') {
          throw new ForbiddenError('Only business owners can create business posts');
        } else if (category !== 'Business' && user.role === 'BusinessOwner') {
          throw new ForbiddenError('Business owners can only create business posts');
        }
        
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
        
        if (category === 'Business' && user.role === 'BusinessOwner') {
          post.businessInfo = { 
            name: businessName || title, 
            description: businessDescription || content,
            deals: businessDeals || [],
            image: businessImage || null,
            reviews: []
          };
        }
        
        await post.save();
        
        // Let the Post.author resolver handle author fetching
        return {
          id: post._id,
          ...post._doc
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
      const user = await getAuthenticatedUser(context);
      const post = await Post.findById(postId);
    
      if (!post) throw new Error('Post not found');
      if (post.category !== 'Help Request') {
        throw new UserInputError('Can only volunteer for Help Request posts');
      }
    
      if (!post.helpRequest) {
        post.helpRequest = { status: 'Open', volunteers: [] };
      }
    
      const userIdStr = user._id.toString();
      if (post.helpRequest.volunteers.includes(userIdStr)) {
        throw new UserInputError('You have already volunteered');
      }
    
      post.helpRequest.volunteers.push(userIdStr);
      await post.save();
    
      return {
        id: post._id,
        ...post._doc
      };
    },

    //Create an event
    createEvent: async (_, { input }, context) => {
      try {
        const user = await getAuthenticatedUser(context);
        const { title, description, location, date } = input;
  
        const newEvent = new Event({
          title,
          description,
          location,
          date,
          createdBy: user._id,
          createdByName: `${user.firstName} ${user.lastName}`,
        });
  
        await newEvent.save();
  
        return {
          id: newEvent._id,
          title: newEvent.title,
          description: newEvent.description,
          location: newEvent.location,
          date: newEvent.date.toISOString(),
          createdBy: newEvent.createdBy,
          createdByName: newEvent.createdByName,
          createdAt: newEvent.createdAt.toISOString(),
        };
      } catch (err) {
        throw new Error('Error creating event');
      }
    },

    // Update an existing event
    updateEvent: async (_, { id, input }, context) => {
      try {
        const user = await getAuthenticatedUser(context);
        
        const event = await Event.findById(id);
        if (!event) {
          throw new Error('Event not found');
        }

        if (event.createdBy.toString() !== user._id.toString()) {
          throw new ForbiddenError('Not authorized to update this event');
        }

        if (input.title) event.title = input.title;
        if (input.description) event.description = input.description;
        if (input.location) event.location = input.location;
        if (input.date) event.date = new Date(input.date);

        await event.save();

        return {
          id: event._id,
          ...event._doc,
          createdAt: event.createdAt.toISOString()
        };
      } catch (err) {
        throw new Error('Error updating event');
      }
    },

    // Delete an event
    deleteEvent: async (_, { id }, context) => {
      try {
        const user = await getAuthenticatedUser(context);

        const event = await Event.findById(id);
        if (!event) {
          throw new Error('Event not found');
        }

        if (event.createdBy.toString() !== user._id.toString()) {
          throw new ForbiddenError('Not authorized to delete this event');
        }

        await Event.findByIdAndDelete(id);
        return true;
      } catch (err) {
        throw new Error('Error deleting event');
      }
    },
    
    // Add sentiment analysis resolver
    analyzeSentiment: async (_, { text }) => {
      try {
        // This is a mock implementation - in a real app, you'd use a sentiment analysis API or library
        const words = text.toLowerCase().split(/\s+/);
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'best', 'wonderful', 'fantastic'];
        const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing'];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        words.forEach(word => {
          if (positiveWords.includes(word)) positiveCount++;
          if (negativeWords.includes(word)) negativeCount++;
        });
        
        if (positiveCount > negativeCount) return 'Positive';
        if (negativeCount > positiveCount) return 'Negative';
        return 'Neutral';
      } catch (err) {
        throw new Error('Error analyzing sentiment');
      }
    },
    
    // Add a review to a business post
    addReview: async (_, { input }, context) => {
      try {
        const user = await getAuthenticatedUser(context);
        const { postId, text, rating } = input;
        
        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
          throw new Error('Post not found');
        }
        
        // Check if it's a business post
        if (post.category !== 'Business') {
          throw new UserInputError('Can only review business posts');
        }
        
        // Create a random review ID (without using mongoose.Types.ObjectId)
        const reviewId = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
        
        // Create the review
        // Format date for consistency
        const now = new Date();
        const formattedDate = now.toISOString();
        
        // Create the review with a properly formatted date string
        const review = {
          reviewId,
          text,
          rating,
          authorId: user._id,
          authorName: `${user.firstName} ${user.lastName}`,
          createdAt: formattedDate
        };
        
        // Initialize reviews array if it doesn't exist
        if (!post.businessInfo.reviews) {
          post.businessInfo.reviews = [];
        }
        
        // Add the review to the post
        post.businessInfo.reviews.push(review);
        await post.save();
        
        return {
          id: post._id,
          ...post._doc,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString()
        };
      } catch (err) {
        throw new Error('Error adding review: ' + err.message);
      }
    }
  },
  
  Post: {
    // Resolve author field with full User data
    author: async (parent) => {
      try {
        // Make sure we're using a string ID
        const authorId = parent.author.toString();
        console.log('Fetching author with ID:', authorId);
        
        const user = await User.findById(authorId);
        
        if (!user) {
          console.error('User not found with ID:', authorId);
          throw new Error('Author not found');
        }
        
        return {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        };
      } catch (err) {
        console.error('Error fetching author data:', err);
        throw new Error('Error fetching author data');
      }
    }
  },
  
  Event: {
    // Resolve createdBy field to fetch the full User data
    createdBy: async (parent) => {
      try {
        const user = await User.findById(parent.createdBy);
        if (!user) {
          throw new Error('User not found');
        }
        return {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt.toISOString()
        };
      } catch (err) {
        throw new Error('Error fetching user for event');
      }
    },
    
  }
};

module.exports = resolvers;