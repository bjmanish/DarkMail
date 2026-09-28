import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMessagesByUserId } from "../api";
import { auth } from "../utils/auth";

import { Dashboard } from "./Dashboard";
import InboxList from "../user/inbox/InboxList";
import { ComposeModal } from "../user/compose/ComposeModal";

export function InboxLayout() {

  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeView, setActiveView] = useState("inbox");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCompose, setShowCompose] = useState(false);
  const [replyMessage, setReplyMessage] = useState(null);

  const menuRef = useRef(null);

  const currentUser = auth.getCurrentUser();

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  /* ================= FETCH MESSAGES ================= */

  const loadMessages = async () => {
    try {
      const res = await getMessagesByUserId(currentUser);
      setMessages(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  /* ================= REPLY ================= */

  const onReply = (message) => {
    setReplyMessage(message);
    setShowCompose(true);
  };

  /* ================= COMPOSE ================= */

  const openCompose = () => {
    setReplyMessage(null);
    setShowCompose(true);
  };

  /* ================= CLOSE USER MENU ================= */

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= FILTER ================= */

  const getFilteredMessages = () => {
    switch (activeView) {
      case "sent":
        return messages.filter(
          (m) => m.sender?.email === currentUser?.email
        );

      case "drafts":
        return messages.filter((m) => m.status === "draft");

      case "trash":
        return messages.filter((m) => m.deletedBy?.length);

      case "inbox":
        return messages.filter(
          (m) => m.sender?.email !== currentUser?.email
        );

      default:
        return messages;
    }
  };

  return (
    <div className="h-screen flex bg-gray-900 text-gray-100 overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-950 border-r border-gray-800 hidden md:flex flex-col">
        <SidebarContent
          activeView={activeView}
          setActiveView={setActiveView}
          onComposeClick={openCompose}
          navigate={navigate}
        />
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold capitalize">
            {activeView}
          </h2>

          {/* USER MENU */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold"
            >
              {currentUser?.email?.[0]?.toUpperCase()}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-gray-950 border border-gray-800 rounded-lg shadow-lg">

                <div className="px-4 py-3 border-b border-gray-800 text-sm text-gray-300">
                  {currentUser?.email}
                </div>

                <button
                  onClick={() => navigate("/settings")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-800"
                >
                  Settings
                </button>

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-800"
                >
                  Logout
                </button>

              </div>
            )}
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto">

          {loading ? (
            <div className="text-center mt-20 text-gray-500">
              Loading messages...
            </div>
          ) : activeView === "dashboard" ? (
            <Dashboard messages={messages} currentUser={currentUser} />
          ) : (
            <InboxList
              messages={getFilteredMessages()}
              onReply={onReply}
              currentUser={currentUser}
            />
          )}

        </main>
      </div>

      {/* COMPOSE MODAL */}
      <ComposeModal
        isOpen={showCompose}
        replyMessage={replyMessage}
        onClose={() => {
          setShowCompose(false);
          setReplyMessage(null);
        }}
        onSent={loadMessages}
      />

    </div>
  );
}

/* ================= SIDEBAR ================= */

function SidebarContent({
  activeView,
  setActiveView,
  onComposeClick,
  navigate,
}) {
  return (
    <div className="flex flex-col h-full p-4">

      <div
        className="text-2xl font-bold text-indigo-400 mb-6 cursor-pointer"
        onClick={() => setActiveView("inbox")}
      >
        DarkMail
      </div>

      <button
        onClick={onComposeClick}
        className="bg-indigo-600 hover:bg-indigo-700 py-2 rounded mb-6"
      >
        + Compose
      </button>

      <Item label="Dashboard" active={activeView === "dashboard"} click={() => setActiveView("dashboard")} />
      <Item label="Inbox" active={activeView === "inbox"} click={() => setActiveView("inbox")} />
      <Item label="Sent" active={activeView === "sent"} click={() => setActiveView("sent")} />
      <Item label="Drafts" active={activeView === "drafts"} click={() => setActiveView("drafts")} />
      <Item label="Trash" active={activeView === "trash"} click={() => setActiveView("trash")} />

      <div className="mt-auto border-t border-gray-800 pt-4">
        <Item label="Settings" click={() => navigate("/settings")} />
      </div>

    </div>
  );
}

/* ================= ITEM ================= */

function Item({ label, active, click }) {
  return (
    <div
      onClick={click}
      className={`px-4 py-2 rounded cursor-pointer mb-1
        ${active ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800"}
      `}
    >
      {label}
    </div>
  );
}