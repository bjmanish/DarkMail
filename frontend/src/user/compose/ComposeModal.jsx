import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import EmojiPicker from "emoji-picker-react";
import "react-quill/dist/quill.snow.css";

import { sendMessage, saveDraft } from "../../api";

/* ================= UTILS ================= */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmails(input) {
  return input
    .split(/[\s,;]+/)
    .map(e => e.trim())
    .filter(Boolean);
}

/* ================= MAIN ================= */

export function ComposeModal({
  isOpen,
  onClose,
  employees = [],
  replyMessage,
  forwardMessage,
  onSent
}) {

  const modalRef = useRef(null);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const [toList, setToList] = useState([]);
  const [ccList, setCcList] = useState([]);
  const [bccList, setBccList] = useState([]);

  const [toInput, setToInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");

  const [invalidEmails, setInvalidEmails] = useState([]);

  const [attachments, setAttachments] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);

  const [draftId, setDraftId] = useState(null);

  /* ================= PREFILL ================= */

  useEffect(() => {
    if (replyMessage) {
      setSubject(`Re: ${replyMessage.subject}`);
      setToList([replyMessage.sender.email]);
      setBody(`On ${new Date(replyMessage.createdAt).toLocaleString()}
${replyMessage.sender.email} wrote:

${replyMessage.body}`);
    }

    if (forwardMessage) {
      setSubject(`Fwd: ${forwardMessage.subject}`);
      setBody(`------ Forwarded Message ------\n${forwardMessage.body}`);
    }
  }, [replyMessage, forwardMessage]);

  /* ================= CLOSE ================= */

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  useEffect(() => {
    const click = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, [onClose]);

  /* ================= ADD EMAIL ================= */

  const addEmail = (emails, field) => {

    const map = {
      to: [toList, setToList],
      cc: [ccList, setCcList],
      bcc: [bccList, setBccList],
    };

    const [list, setList] = map[field];

    const valid = [];
    const invalid = [];

    emails.forEach(email => {
      if (emailRegex.test(email)) {
        if (!list.includes(email)) valid.push(email);
      } else {
        invalid.push(email);
      }
    });

    if (valid.length) setList(prev => [...prev, ...valid]);
    if (invalid.length) setInvalidEmails(prev => [...prev, ...invalid]);
  };

  /* ================= HANDLERS ================= */

  const handleKeyDown = (e, input, setInput, field) => {

    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      addEmail(parseEmails(input), field);
      setInput("");
    }

    if (e.key === "Backspace" && !input) {
      const map = {
        to: [toList, setToList],
        cc: [ccList, setCcList],
        bcc: [bccList, setBccList],
      };
      const [list, setList] = map[field];
      setList(list.slice(0, -1));
    }
  };

  const handlePaste = (e, field) => {
    const pasted = e.clipboardData.getData("text");
    addEmail(parseEmails(pasted), field);
    e.preventDefault();
  };

  /* ================= ATTACHMENTS ================= */

  const handleFileChange = (e) => {
    setAttachments(prev => [...prev, ...Array.from(e.target.files)]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setAttachments(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  /* ================= AUTO SAVE ================= */

  useEffect(() => {
    const timer = setTimeout(async () => {

      const plain = body.replace(/<[^>]*>/g, "").trim();
      if (!subject && !plain && !toList.length) return;

      try {
        const res = await saveDraft({
          messageId: draftId,
          subject,
          body,
          toEmails: toList,
          ccEmails: ccList,
          bccEmails: bccList
        });

        if (res?.draft?._id) setDraftId(res.draft._id);

      } catch (err) {
        console.log(err);
      }

    }, 3000);

    return () => clearTimeout(timer);
  }, [subject, body, toList, ccList, bccList]);

  /* ================= SEND ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!toList.length) return alert("Add recipient");
    if (!subject.trim()) return alert("Add subject");

    setSending(true);

    try {

      const formData = new FormData();

      formData.append("subject", subject);
      formData.append("body", body);

      toList.forEach(e => formData.append("toEmails[]", e));
      ccList.forEach(e => formData.append("ccEmails[]", e));
      bccList.forEach(e => formData.append("bccEmails[]", e));

      attachments.forEach(f => formData.append("attachments", f));

      await sendMessage(formData);

      onSent && onSent();

      setSubject("");
      setBody("");
      setToList([]);
      setCcList([]);
      setBccList([]);
      setAttachments([]);
      setDraftId(null);

      onClose();

    } catch (err) {
      console.log(err);
      alert("Send failed");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

      <div
        ref={modalRef}
        className="bg-gray-900 w-full max-w-3xl rounded-lg p-6 max-h-[90vh] overflow-y-auto"
      >

        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Compose Mail</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 🔥 EMAIL FIELDS */}
          {[
            ["To", toList, setToList, toInput, setToInput],
            ["Cc", ccList, setCcList, ccInput, setCcInput],
            ["Bcc", bccList, setBccList, bccInput, setBccInput],
          ].map(([label, list, setList, input, setInput]) => (
            <EmailField
              key={label}
              label={label}
              list={list}
              setList={setList}
              input={input}
              setInput={setInput}
              addEmail={addEmail}
              employees={employees}
              invalidEmails={invalidEmails}
              handleKeyDown={handleKeyDown}
              handlePaste={handlePaste}
            />
          ))}

          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full bg-gray-800 px-4 py-2 rounded"
          />

          <ReactQuill value={body} onChange={setBody} />

          <div className="flex gap-3">
            <button type="button" onClick={() => setShowEmoji(!showEmoji)}>😊</button>
            <input type="file" multiple onChange={handleFileChange} />
          </div>

          {showEmoji && (
            <EmojiPicker onEmojiClick={(e) => setBody(prev => prev + " " + e.emoji)} />
          )}

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border border-dashed p-6 text-center"
          >
            Drag files here
          </div>

          {attachments.map((file, i) => (
            <div key={i} className="flex justify-between bg-gray-800 p-2">
              {file.name}
              <button type="button" onClick={() => removeAttachment(i)}>✕</button>
            </div>
          ))}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={sending}>
              {sending ? "Sending..." : "Send"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

/* ================= EMAIL FIELD ================= */

function EmailField({
  label,
  list,
  setList,
  input,
  setInput,
  addEmail,
  employees,
  invalidEmails,
  handleKeyDown,
  handlePaste
}) {

  const field = label.toLowerCase();
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = input.trim()
    ? employees.filter(emp =>
        (emp.email?.toLowerCase().includes(input.toLowerCase()) ||
         emp.name?.toLowerCase().includes(input.toLowerCase())) &&
        !list.includes(emp.email)
      )
    : [];

  const handleLocalKeyDown = (e) => {

    if (filtered.length > 0) {

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % filtered.length);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filtered.length) % filtered.length);
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const selected = filtered[activeIndex];
        if (selected) {
          addEmail([selected.email], field);
          setInput("");
          setActiveIndex(0);
        }
        return;
      }
    }

    handleKeyDown(e, input, setInput, field);
  };

  return (
    <div className="relative">

      <label className="text-sm text-gray-400">{label}</label>

      <div className="bg-gray-800 flex flex-wrap gap-2 p-2 rounded">

        {list.map(email => {
          const invalid = invalidEmails.includes(email);

          return (
            <div
              key={email}
              className={`px-3 py-1 rounded-full flex gap-2
              ${invalid ? "bg-red-500" : "bg-indigo-600"}`}
            >
              {email}
              <button type="button"
                onClick={() => setList(prev => prev.filter(e => e !== email))}
              >
                ✕
              </button>
            </div>
          );
        })}

        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleLocalKeyDown}
          onPaste={(e) => handlePaste(e, field)}
          className="bg-transparent flex-1 outline-none"
          placeholder="Type email..."
        />

      </div>

      {filtered.length > 0 && (
        <div className="absolute z-50 w-full bg-gray-800 mt-1 rounded border border-gray-700 shadow-lg max-h-40 overflow-y-auto">

          {filtered.slice(0, 5).map((emp, index) => (
            <div
              key={emp._id}
              onMouseDown={() => {
                addEmail([emp.email], field);
                setInput("");
                setActiveIndex(0);
              }}
              className={`px-3 py-2 cursor-pointer
              ${index === activeIndex ? "bg-gray-700" : "hover:bg-gray-700"}`}
            >
              <div className="text-white text-sm">
                {emp.name || "User"}
              </div>
              <div className="text-gray-400 text-xs">
                {emp.email}
              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}