/**
 * GraphQL API Route
 *
 * Uses GraphQL Yoga for the GraphQL server
 * Endpoint: /api/graphql
 */

import { createYoga, createSchema } from 'graphql-yoga';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';

const schema = createSchema({
  typeDefs,
  resolvers,
});

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  // Enable GraphiQL in development
  graphiql: process.env.NODE_ENV === 'development',
  // CORS settings
  cors: {
    origin: process.env.NODE_ENV === 'development' ? '*' : process.env.NEXT_PUBLIC_APP_URL,
    credentials: true,
    methods: ['POST', 'GET', 'OPTIONS'],
  },
  // Logging
  logging: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  // Batching for multiple queries
  batching: true,
});

// Export handlers for Next.js App Router
export const GET = yoga;
export const POST = yoga;
export const OPTIONS = yoga;
