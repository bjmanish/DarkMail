import React, { useState } from "react";

import compose1 from '../user/compose/ComposeModal';


export function Home({ onOpenInbox, onCompose }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const compose = compose1;
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      
      {/* ================= Navbar ================= */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          
          <h1 className="text-xl sm:text-2xl font-bold text-indigo-400">
            DarkMail
          </h1>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6">
            <button onClick={onOpenInbox} className="text-gray-300 hover:text-white">
              Inbox
            </button>
            <button onClick={onCompose} className="text-gray-300 hover:text-white">
              Compose
            </button>
            <button className="text-gray-300 hover:text-white">
              Profile
            </button>
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            ☰
          </button>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-2 bg-gray-950 border-t border-gray-800">
            <button
              onClick={() => {
                onOpenInbox();
                setMenuOpen(false);
              }}
              className="block w-full text-left text-gray-300 hover:text-white"
            >
              Inbox
            </button>

            <button
              onClick={() => {
                onCompose();
                setMenuOpen(false);
              }}
              className="block w-full text-left text-gray-300 hover:text-white"
            >
              Compose
            </button>

            <button className="block w-full text-left text-gray-300 hover:text-white">
              Profile
            </button>
          </div>
        )}
      </header>

      {/* ================= Hero Section ================= */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
          Secure. Simple.{" "}
          <span className="text-indigo-400">DarkMail</span>
        </h2>

        <p className="text-gray-400 max-w-xl sm:max-w-2xl mb-10 text-sm sm:text-base">
          DarkMail is a modern, fast, and privacy-focused email application
          inspired by Gmail. Manage your inbox, compose messages, and stay
          connected — all in a clean dark interface.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={onOpenInbox}
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg font-semibold transition w-full sm:w-auto"
          >
            Open Inbox
          </button>

          <button
            onClick={onCompose}
            className="border border-gray-700 hover:bg-gray-800 px-6 py-3 rounded-lg font-semibold transition w-full sm:w-auto"
          >
            Compose Mail
          </button>
        </div>
      </main>

      {/* ================= Features ================= */}
      <section className="bg-gray-950 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-10 sm:mb-12">
            Why DarkMail?
          </h3>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            <FeatureCard
              title="🚀 Fast & Lightweight"
              description="Optimized performance with a smooth and responsive user experience."
            />
            <FeatureCard
              title="🔒 Secure Messaging"
              description="Built with secure APIs and modern authentication practices."
            />
            <FeatureCard
              title="🌙 Dark UI"
              description="A sleek dark theme designed for comfort and focus."
            />
          </div>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="border-t border-gray-800 py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} DarkMail. All rights reserved.
      </footer>
    </div>
  );
}

/* Feature Card Component */
function FeatureCard({ title, description }) {
  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-indigo-500 transition">
      <h4 className="text-lg sm:text-xl font-semibold mb-3">{title}</h4>
      <p className="text-gray-400 text-sm sm:text-base">{description}</p>
    </div>
  );
}
