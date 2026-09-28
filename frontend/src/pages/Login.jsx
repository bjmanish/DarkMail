import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/auth';
import {registerUser}  from '../api.js';

export function Login({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await auth.login(email.trim(), password);

      if (result.success) {
        onLoginSuccess?.();     // update auth state in App
        // Redirect based on user role
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await auth.register(email.trim(), password);

      if (result.success) {
        onLoginSuccess?.();     // update auth state in App
        // Redirect based on user role
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError('Self Registration feature currently off!');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-950 p-8 rounded-xl w-full max-w-md border border-gray-800"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-400">
          DarkMail Login
        </h2>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        /> 
        {/* default role employee/user*/}
        {/* <input type="role" value="user" hidden /> */}

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Login button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition-colors"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* Register text */}
        <p className="text-sm text-gray-400 text-center mt-4">
          Don&apos;t have an account?{' '}
          <span className="text-indigo-400 cursor-pointer hover:text-indigo-300 pointer-events-none" onClick={handleRegister} > 
            Register
          </span>
        </p>

        {/* Google Sign-In placeholder (React-safe) */}
        <div className="mt-4 flex justify-center">
          <div className="g_id_signin"></div>
        </div>

        {/* <p className="text-xs text-gray-500 text-center mt-2">
          Admin: admin@darkmail.com / admin
        </p> */}
      </form>
    </div>
  );
}
