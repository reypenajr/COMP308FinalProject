// server.js
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const dotenv = require('dotenv');
const cors = require('cors');
const configureMongoose = require('./config/mongoose');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

dotenv.config(); // Load environment variables from .env file

async function startServer() {
  // Initialize Express
  const app = express();
  app.use(express.json()); // Parse JSON bodies
  app.use(cors()); // Enable CORS

  // MongoDB connection using the function from configureMongoose.js
  configureMongoose();

  // Create Apollo Server
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req }),
    formatError: (err) => {
      // Log error for server-side debugging
      console.error(err);
      
      // Return a simplified error for clients
      return {
        message: err.message,
        code: err.extensions?.code || 'SERVER_ERROR',
      };
    },
  });

  // Start Apollo Server
  await apolloServer.start();

  // Apply Apollo middleware to Express
  apolloServer.applyMiddleware({ app, path: '/graphql' });

  // Start Express server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}${apolloServer.graphqlPath}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});