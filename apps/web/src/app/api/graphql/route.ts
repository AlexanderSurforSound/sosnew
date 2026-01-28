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

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  graphiql: process.env.NODE_ENV === 'development',
  fetchAPI: globalThis,
});

export async function GET(request: Request) {
  return handleRequest(request, {});
}

export async function POST(request: Request) {
  return handleRequest(request, {});
}

export async function OPTIONS(request: Request) {
  return handleRequest(request, {});
}
