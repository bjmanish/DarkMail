import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatTimestamp } from "../utils/dateUtils.js";


export function Dashboard({ messages = [], currentUser }) {

  const totalMessages = messages.length;
  const recentMessages = messages.slice(0, 5);
  const unreadCount = messages.filter(msg =>
    !msg.readBy?.includes(currentUser?.id)
  ).length;

  /** Storage Dynamic */
  const MAX_STORAGE = 1024 * 1024 * 1024; // 1GB in bytes
  const usedStorage = messages.reduce((total, msg) => {
    const size =
      (msg.subject?.length || 0) +
      (msg.body?.length || 0);
    return total + size;
  }, 0);

  const storagePercent = ((usedStorage / MAX_STORAGE) * 100).toFixed(2);

  const navigate = useNavigate();
  const [selectedMessage, setSelectedMessage] = useState(null);

  /* MESSAGE LABEL FUNCTION */
  function getMessageLabel(msg) {

    if (msg.status === "draft") {
      return { text: "Draft", color: "bg-yellow-500" };
    }

    if (msg.deletedBy?.includes(currentUser?.id)) {
      return { text: "Trash", color: "bg-red-500" };
    }

    if (msg.sender?.email === currentUser?.email) {
      return { text: "Sent", color: "bg-green-500" };
    }

    return { text: "Inbox", color: "bg-blue-500" };
  }

  return (
    <div className="bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Total Messages */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Total Messages</p>
            <p className="text-3xl font-bold text-white">{totalMessages}</p>
          </div>

          {/* Unread */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Unread</p>
            <p className="text-3xl font-bold text-white">{unreadCount}</p>
          </div>

          {/* Storage */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
            <p className="text-3xl font-bold text-white">
              {storagePercent}%
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {(usedStorage / (1024 * 1024)).toFixed(2)} MB of 1024 MB used
            </p>
          </div>

        </div>

        {/* Recent Messages */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Messages</h2>
          </div>

          {selectedMessage ? (

            <MessageReadingView
              message={selectedMessage}
              onBack={() => setSelectedMessage(null)}
              getMessageLabel={getMessageLabel}
            />

          ) : (

            <>
              {recentMessages.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No messages yet</p>
              ) : (

                <div className="space-y-4">

                  {recentMessages.map((message) => {

                    const label = getMessageLabel(message);

                    return (
                      <div
                        key={message.id || message._id}
                        className="border-b border-gray-800 pb-4 hover:bg-gray-900/50 rounded-lg p-3 transition cursor-pointer"
                        onClick={() => setSelectedMessage(message)}
                      >

                        <div className="flex justify-between items-center mb-2">

                          <h3 className="font-semibold text-white">
                            {message.subject}
                          </h3>

                          <span
                            className={`text-xs px-2 py-1 rounded text-white ${label.color}`}
                          >
                            {label.text}
                          </span>

                        </div>

                        <p className="text-gray-400 text-sm line-clamp-2">
                          {message.body}
                        </p>

                        <p className="text-xs text-gray-500 mt-2">
                          {formatTimestamp(message.createdAt)}
                        </p>

                      </div>
                    );
                  })}

                </div>

              )}
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-gray-950 border border-gray-800 rounded-xl p-6">

          <h2 className="text-xl font-semibold text-white mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">

            {/* Compose */}
            <button
              onClick={() => navigate("/compose")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg flex flex-col items-center gap-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Compose
            </button>

            {/* Inbox */}
            <button
              onClick={() => navigate("/inbox")}
              className="bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex flex-col items-center gap-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Inbox
            </button>

            {/* Sent */}
            <button
              onClick={() => navigate("/sent")}
              className="bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex flex-col items-center gap-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L11 13" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L15 22l-4-9-9-4 20-7z" />
              </svg>
              Sent
            </button>

            {/* Drafts */}
            <button
              onClick={() => navigate("/draft")}
              className="bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex flex-col items-center gap-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2M12 7v12m8-10l-8-6-8 6" />
              </svg>
              Drafts
            </button>

            {/* Trash */}
            <button
              onClick={() => navigate("/trash")}
              className="bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex flex-col items-center gap-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-1 14H6L5 7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 11v6M14 11v6M9 7V4h6v3" />
              </svg>
              Trash
            </button>

            {/* Settings */}
            <button
              onClick={() => navigate("/settings")}
              className="bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex flex-col items-center gap-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

/* MESSAGE VIEW */
function MessageReadingView({ message, onBack, getMessageLabel }) {

  const label = getMessageLabel(message);

  return (
    <div className="max-w-4xl mx-auto">

      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
      >
        ← Back
      </button>

      <div className="bg-gray-800 rounded-lg p-6">

        <div className="flex justify-between items-center mb-3">

          <h1 className="text-2xl font-bold text-white">
            {message.subject}
          </h1>

          <span
            className={`text-xs px-2 py-1 rounded text-white ${label.color}`}
          >
            {label.text}
          </span>

        </div>

        <p className="text-sm text-gray-400 mb-4">
          {formatTimestamp(message.createdAt)}
        </p>

        <div className="text-gray-300 whitespace-pre-wrap">
          {message.body}
        </div>

      </div>

    </div>
  );
}