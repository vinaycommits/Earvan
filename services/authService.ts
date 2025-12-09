
// src/services/authService.ts
import { User, HearingProfile } from '../types';

const API_URL = 'http://localhost:5000/api';

interface AuthResponse {
  token: string;
  user: User;
}

const TOKEN_KEY = 'earvan_token';
const USER_KEY = 'earvan_user';

const saveSession = (data: AuthResponse) => {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
};

export const authService = {
  // LOGIN -> POST /api/auth/login
  login: async (username: string, password: string): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Invalid username or password');
    }

    const data: AuthResponse = await res.json();
    saveSession(data);
    return data.user;
  },

  // SIGNUP -> POST /api/auth/signup
  signup: async (
    name: string,
    email: string,
    username: string,
    password: string
  ): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, username, password })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Signup failed');
    }

    const data: AuthResponse = await res.json();
    saveSession(data);
    return data.user;
  },

  // UPDATE PROFILE -> PUT /api/profile
  updateProfile: async (userId: string, profile: HearingProfile): Promise<User> => {
    // userId not needed by API because JWT has it, but keep signature same as old code
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ eqBands: profile.eqBands })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Profile update failed');
    }

    const updatedUser: User = await res.json();
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  // LOGOUT -> clear local session only
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // SESSION: same idea as previous getCurrentUser
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  }
};
