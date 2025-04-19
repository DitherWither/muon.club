import { redirect } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { env } from '@/env';

/**
 * Registers a new user with the backend.
 * @param username - The username of the user.
 * @param password - The password of the user.
 * @returns The JWT token if registration is successful.
 * @throws An error if the registration fails.
 */
export async function registerToBackend(user: {
  username: string;
  password: string;
  displayName?: string;
  email: string;
  pronouns?: string;
  bio?: string;
}): Promise<string> {
  const response = await fetch(`${env.VITE_BACKEND_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to register user');
  }

  const data = (await response.json()) as {
    message: string;
    token: string;
  };

  // Store the token in local storage
  localStorage.setItem('token', data.token);

  return data.token; // Return the JWT token
}

/**
 * Logs into the backend and retrieves a JWT token.
 * @param username - The username of the user.
 * @param password - The password of the user.
 * @returns The JWT token if login is successful.
 * @throws An error if the login fails.
 */
export async function loginToBackend(
  username: string,
  password: string,
): Promise<string> {
  const response = await fetch(`${env.VITE_BACKEND_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to log in');
  }

  const data = (await response.json()) as {
    message: string;
    token: string;
    user: { id: string; username: string };
  };

  // Store the token in local storage
  localStorage.setItem('token', data.token);

  return data.token; // Return the JWT token
}

/**
 * Logs out of the backend and clears the stored token.
 */
export function logoutFromBackend(queryClient: QueryClient) {
  localStorage.removeItem('token');

  // Clear any auth tokens from localStorage
  queryClient.removeQueries();

  // Refresh the page to return to login screen
  window.location.reload();
}

/**
 * Fetches data from the backend with the provided options.
 * @param url - The URL to fetch data from.
 * @param options - Additional options for the fetch request.
 * @returns The response data.
 * @throws An error if the fetch fails.
 */
export async function fetchBackendData<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found. Please log in.');
  }

  const response = await fetch(`${env.VITE_BACKEND_URL}${url}`, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch data');
  }

  return response.json() as Promise<T>;
}

export function requireAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw redirect({ to: '/auth/login' });
  }
}

/**
 * Represents a user in the system
 */
interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  pronouns?: string;
  bio?: string;
}

/**
 * Fetches the currently logged in user's information
 * Uses the authentication token to identify the user
 *
 * @returns The current user's details
 * @throws Error if user is not authenticated or request fails
 */
export async function getCurrentUser(): Promise<User> {
  // Use the fetchBackendData utility which already handles auth tokens
  return await fetchBackendData<User>('/api/v1/auth/me');
}

/**
 * Checks if the current user is authenticated
 * @returns boolean indicating if user has a token
 */
export function isAuthenticated(): boolean {
  return localStorage.getItem('token') !== null;
}
