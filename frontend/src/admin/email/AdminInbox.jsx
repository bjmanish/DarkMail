import { useEffect, useState } from "react";
import { getMessages, moveToTrash } from "../../api";
import { useNavigate } from "react-router-dom";
import { auth } from "../../utils/auth";

export default function AdminInbox({ onReply }) {

  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  const [leftWidth, setLeftWidth] = useState(40);
  const [dragging, setDragging] = useState(false);

  const currUser = auth.getCurrentUser();
  const navigate = useNavigate();

  /* ================= LABEL FUNCTION ================= */

  function getMessageLabel(msg) {
    if (msg.status === "draft") {
      return { text: "Draft", color: "bg-yellow-500" };
    }

    if (msg.deletedBy?.length) {
      return { text: "Trash", color: "bg-red-500" };
    }

    if (msg.sender?.email === currUser?.email) {
      return { text: "Sent", color: "bg-green-500" };
    }

    return { text: "Inbox", color: "bg-blue-500" };
  }

  /* ================= LOAD MESSAGES ================= */

  const loadMessages = async () => {

    if (!currUser) {
      navigate("/login");
      return;
    }

    try {
      const res = await getMessages();
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

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    try {
      await moveToTrash(id);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      setSelectedMessage(null);
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= SEARCH ================= */

  const filteredMessages = messages.filter((msg) =>
    msg.subject?.toLowerCase().includes(search.toLowerCase()) ||
    msg.body?.toLowerCase().includes(search.toLowerCase()) ||
    msg.sender?.email?.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= RESIZE ================= */

  const handleMouseMove = (e) => {
    if (!dragging) return;

    const newWidth = (e.clientX / window.innerWidth) * 100;

    if (newWidth > 20 && newWidth < 70) {
      setLeftWidth(newWidth);
    }
  };

  const stopDragging = () => setDragging(false);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [dragging]);

  if (loading) {
    return <div className="p-6 text-gray-400">Loading messages...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">

      {/* MESSAGE LIST */}
      <div
        style={{ width: `${leftWidth}%` }}
        className="border-r border-gray-800 flex flex-col"
      >

        <div className="p-4 border-b border-gray-800">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email..."
            className="w-full bg-gray-900 border border-gray-800 px-3 py-2 rounded text-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto">

          {filteredMessages.map((msg) => {

            const label = getMessageLabel(msg);

            return (
              <div
                key={msg._id}
                onClick={() => setSelectedMessage(msg)}
                className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-900
                ${selectedMessage?._id === msg._id ? "bg-gray-900" : ""}
                ${!msg.readBy?.length ? "bg-gray-800 font-semibold" : ""}
                `}
              >

                <div className="flex justify-between items-center">

                  <span className="text-blue-400 text-sm">
                    {msg.sender?.email}
                  </span>

                  <div className="flex items-center gap-2">

                    {/* LABEL */}
                    <span
                      className={`text-xs px-2 py-1 rounded text-white ${label.color}`}
                    >
                      {label.text}
                    </span>

                    <span className="text-xs text-gray-500">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>

                  </div>

                </div>

                <div className="font-medium truncate mt-1">
                  {msg.subject || "(No Subject)"}
                </div>

                <div className="text-gray-400 text-sm">
                  {msg.body
                    ?.replace(/<[^>]*>/g, "")
                    .split(" ")
                    .slice(0, 10)
                    .join(" ")}
                  {msg.body?.split(" ").length > 10 && "..."}
                </div>

              </div>
            );
          })}

        </div>
      </div>

      {/* DRAG BAR */}
      <div
        onMouseDown={() => setDragging(true)}
        className="w-1 bg-gray-700 hover:bg-indigo-500 cursor-col-resize"
      />

      {/* MESSAGE VIEW */}
      <div className="flex-1 overflow-y-auto flex justify-center">

        {selectedMessage ? (
          <MessageView
            message={selectedMessage}
            handleDelete={handleDelete}
            onReply={onReply}
            setShowDetails={setShowDetails}
            getMessageLabel={getMessageLabel}
          />
        ) : (
          <div className="flex items-center justify-center text-gray-500">
            Select a Message to View
          </div>
        )}

      </div>

      {/* DETAILS MODAL */}
      {showDetails && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-80">

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Message Details</h3>
              <button onClick={() => setShowDetails(false)}>✕</button>
            </div>

            <div className="text-sm text-gray-300 space-y-2">
              <p><b>Thread ID:</b> {selectedMessage.threadId}</p>
              <p><b>Date:</b> {new Date(selectedMessage.createdAt).toLocaleDateString()}</p>
              <p><b>Time:</b> {new Date(selectedMessage.createdAt).toLocaleTimeString()}</p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/* ================= MESSAGE VIEW ================= */

function MessageView({
  message,
  handleDelete,
  onReply,
  setShowDetails,
  getMessageLabel,
}) {

  const label = getMessageLabel(message);

  return (
    <div className="w-full max-w-3xl p-6">

      <div className="flex justify-between items-center mb-4">

        <h2 className="text-2xl font-bold">
          {message.subject}
        </h2>

        <span className={`text-xs px-2 py-1 rounded text-white ${label.color}`}>
          {label.text}
        </span>

      </div>

      <div className="flex justify-end gap-3 mb-6">

        <button
          onClick={() => onReply(message)}
          className="bg-indigo-600 px-4 py-1 rounded text-sm"
        >
          Reply
        </button>

        <button
          onClick={() => handleDelete(message._id)}
          className="bg-red-600 px-4 py-1 rounded text-sm"
        >
          Trash
        </button>

      </div>

      <div className="text-sm text-gray-400 space-y-2 mb-6">

        <p><b>From:</b> {message.sender?.email}</p>

        <p>
          <b>To:</b>{" "}
          {message.recipients?.to?.map((u, i) => (
            <span key={i} className="mr-2 text-blue-400">
              {u.email}
            </span>
          ))}
        </p>

        <p><b>Date:</b> {new Date(message.createdAt).toLocaleString()}</p>

        <button
          onClick={() => setShowDetails(true)}
          className="bg-gray-700 px-3 py-1 rounded text-sm"
        >
          Message Details
        </button>

      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
        {message.body}
      </div>

    </div>
  );
}