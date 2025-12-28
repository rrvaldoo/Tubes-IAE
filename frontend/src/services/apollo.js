import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import storage from '../utils/storage';

// Base URLs for microservices
const USER_SERVICE_URL = 'http://localhost:5001/graphql';
const WALLET_SERVICE_URL = 'http://localhost:5002/graphql';
const TRANSACTION_SERVICE_URL = 'http://localhost:5003/graphql';
const NOTIFICATION_SERVICE_URL = 'http://localhost:5004/graphql';

// Create HTTP links for each service
const userLink = createHttpLink({ uri: USER_SERVICE_URL });
const walletLink = createHttpLink({ uri: WALLET_SERVICE_URL });
const transactionLink = createHttpLink({ uri: TRANSACTION_SERVICE_URL });
const notificationLink = createHttpLink({ uri: NOTIFICATION_SERVICE_URL });

// Auth link to add token to headers
const authLink = setContext(async (_, { headers }) => {
  const token = await storage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create Apollo Client with default service (User Service)
export const client = new ApolloClient({
  link: authLink.concat(userLink),
  cache: new InMemoryCache(),
});

// Create separate clients for each service
export const walletClient = new ApolloClient({
  link: authLink.concat(walletLink),
  cache: new InMemoryCache(),
});

export const transactionClient = new ApolloClient({
  link: authLink.concat(transactionLink),
  cache: new InMemoryCache(),
});

export const notificationClient = new ApolloClient({
  link: authLink.concat(notificationLink),
  cache: new InMemoryCache(),
});

