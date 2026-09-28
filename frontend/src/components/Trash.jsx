import { useEffect, useState } from "react";
import { getTrash, deleteMessagePermanent } from "../api";

export default function Trash() {

  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [leftWidth, setLeftWidth] = useState(40);
  const [dragging, setDragging] = useState(false);

  /* LOAD TRASH */
  const loadTrash = async () => {
    try {
      const res = await getTrash();
      setMessages(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTrash(); }, []);

  /* TOGGLE SELECT */
  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  /* SELECT ALL */
  const handleSelectAll = () => {
    if (selectedIds.length === messages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(messages.map(m => m._id));
    }
  };

  /* DELETE SINGLE (NO CONFIRM) */
  const handleDeletePermanent = async (id) => {

    try {

      await deleteMessagePermanent(id);

      setMessages(prev => prev.filter(m => m._id !== id));

      setSelectedMessage(null);
      setSelectedIds(prev => prev.filter(i => i !== id));

    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  /* DELETE MULTIPLE */
  const handleDeleteSelected = async () => {

    if (selectedIds.length === 0) return;

    try {

      await Promise.all(
        selectedIds.map(id => deleteMessagePermanent(id))
      );

      setMessages(prev =>
        prev.filter(m => !selectedIds.includes(m._id))
      );

      setSelectedIds([]);
      setSelectedMessage(null);

    } catch (err) {
      console.log("Bulk delete error:", err);
    }
  };

  /* RESIZE PANEL */
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
    return <div className="p-6 text-gray-400">Loading Trash...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">

      {/* ================= LEFT PANEL ================= */}
      <div
        style={{ width: `${leftWidth}%` }}
        className="border-r border-gray-800 flex flex-col"
      >

        {/* HEADER */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              onChange={handleSelectAll}
              checked={selectedIds.length === messages.length && messages.length > 0}
            />
            <span className="text-lg font-semibold">Trash</span>
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="bg-red-600 px-3 py-1 text-sm rounded"
            >
              Delete ({selectedIds.length})
            </button>
          )}
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto">

          {messages.length === 0 && (
            <div className="p-6 text-gray-500">Trash is Empty</div>
          )}

          {messages.map(msg => (

            <div
              key={msg._id}
              className={`p-4 border-b border-gray-800 flex gap-3 cursor-pointer hover:bg-gray-900
              ${selectedMessage?._id === msg._id ? "bg-gray-900" : ""}`}
            >

              {/* CHECKBOX */}
              <input
                type="checkbox"
                checked={selectedIds.includes(msg._id)}
                onChange={() => toggleSelect(msg._id)}
                onClick={(e) => e.stopPropagation()}
              />

              {/* MESSAGE CONTENT */}
              <div
                className="flex-1"
                onClick={() => setSelectedMessage(msg)}
              >

                <div className="flex justify-between">
                  <span className="text-red-400 text-sm">
                    {msg.sender?.email}
                  </span>

                  <span className="text-xs text-gray-500">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
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

            </div>

          ))}

        </div>

      </div>

      {/* RESIZER */}
      <div
        onMouseDown={() => setDragging(true)}
        className="w-1 bg-gray-700 hover:bg-red-500 cursor-col-resize"
      />

      {/* RIGHT PANEL */}
      <div className="flex-1 overflow-y-auto flex justify-center">

        {selectedMessage ? (
          <TrashMessageView
            message={selectedMessage}
            handleDeletePermanent={handleDeletePermanent}
          />
        ) : (
          <div className="flex items-center justify-center text-gray-500">
            Select Trash Message
          </div>
        )}

      </div>

    </div>
  );
}


/* ================= MESSAGE VIEW ================= */

function TrashMessageView({ message, handleDeletePermanent }) {

  return (
    <div className="w-full max-w-3xl p-6">

      <div className="flex justify-end mb-6">

        <button
          onClick={() => handleDeletePermanent(message._id)}
          className="bg-red-600 px-4 py-1 rounded text-sm"
        >
          Delete Permanently
        </button>

      </div>

      <h2 className="text-2xl font-bold mb-4">
        {message.subject || "(No Subject)"}
      </h2>

      <div className="text-sm text-gray-400 space-y-2 mb-6">
        <p><b>From:</b> {message.sender?.email}</p>
        <p><b>Date:</b> {new Date(message.createdAt).toLocaleString()}</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
        {message.body}
      </div>

    </div>
  );
}