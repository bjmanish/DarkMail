import { useState } from 'react';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    console.log({ email, password });
    // call register API here
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-950 p-8 rounded-xl w-full max-w-md border border-gray-800"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-400">
          Create DarkMail Account
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg"
          required
        />

        <button className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg font-semibold">
          Register
        </button>
      </form>
    </div>
  );
}
