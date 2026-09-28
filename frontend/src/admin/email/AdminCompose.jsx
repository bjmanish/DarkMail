import { useState } from "react";
import ReactQuill from "react-quill";
import EmojiPicker from "emoji-picker-react";
import "react-quill/dist/quill.snow.css";

import { sendMessage } from "../../api";

export default function AdminCompose({ employees = [], onSent }) {

  const [subject,setSubject] = useState("");
  const [body,setBody] = useState("");
  const [sending,setSending] = useState(false);

  const [toList,setToList] = useState([]);
  const [ccList,setCcList] = useState([]);
  const [bccList,setBccList] = useState([]);

  const [inputValue,setInputValue] = useState("");
  const [activeField,setActiveField] = useState("to");

  const [attachments,setAttachments] = useState([]);
  const [showEmoji,setShowEmoji] = useState(false);

  /* ================= ADD EMAIL ================= */

  const addEmail = (email)=>{

    if(activeField==="to" && !toList.includes(email)){
      setToList([...toList,email]);
    }

    if(activeField==="cc" && !ccList.includes(email)){
      setCcList([...ccList,email]);
    }

    if(activeField==="bcc" && !bccList.includes(email)){
      setBccList([...bccList,email]);
    }

    setInputValue("");

  };


  /* ================= REMOVE EMAIL ================= */

  const removeEmail = (email,field)=>{

    if(field==="to"){
      setToList(toList.filter(e=>e!==email));
    }

    if(field==="cc"){
      setCcList(ccList.filter(e=>e!==email));
    }

    if(field==="bcc"){
      setBccList(bccList.filter(e=>e!==email));
    }

  };


  /* ================= FILTER EMPLOYEES ================= */

  const filteredEmployees =
    inputValue.trim().length>0
      ? employees.filter(emp =>
          emp.email
          .toLowerCase()
          .includes(inputValue.toLowerCase()) &&
          ![...toList,...ccList,...bccList].includes(emp.email)
        )
      : [];


  /* ================= FILE SELECT ================= */

  const handleFileChange = (e)=>{

    const files = Array.from(e.target.files);

    setAttachments(prev=>[...prev,...files]);

  };


  /* ================= REMOVE ATTACHMENT ================= */

  const removeAttachment = (index)=>{

    setAttachments(prev =>
      prev.filter((_,i)=> i!==index)
    );

  };


  /* ================= SEND MESSAGE ================= */

  const handleSubmit = async(e)=>{

    e.preventDefault();

    const plainText = body.replace(/<[^>]*>/g,"").trim();

    if(!toList.length){
      alert("Select at least one recipient");
      return;
    }

    if(!subject.trim()){
      alert("Subject is required");
      return;
    }

    if(!plainText){
      alert("Message body cannot be empty");
      return;
    }

    setSending(true);

    try{

      const formData = new FormData();

      formData.append("subject",subject);
      formData.append("body",body);

      toList.forEach(e=>formData.append("toEmails[]",e));
      ccList.forEach(e=>formData.append("ccEmails[]",e));
      bccList.forEach(e=>formData.append("bccEmails[]",e));

      attachments.forEach(file =>
        formData.append("attachments",file)
      );
      console.log("frontend send payload",formData);
      await sendMessage(formData);

      setSubject("");
      setBody("");
      setToList([]);
      setCcList([]);
      setBccList([]);
      setAttachments([]);

      if(onSent) await onSent();

      alert("Email sent successfully");

    }
    catch(err){

      console.log(err);
      alert(err.message || "Send failed");

    }
    finally{

      setSending(false);

    }

  };


  return(

  <div className="max-w-3xl">

  <h2 className="text-2xl font-bold mb-6">
  Compose Email
  </h2>


  <form onSubmit={handleSubmit} className="space-y-4">


  {/* TO */}

  <EmailField
  label="To"
  list={toList}
  removeEmail={removeEmail}
  inputValue={inputValue}
  setInputValue={setInputValue}
  setActiveField={setActiveField}
  activeField={activeField}
  filteredEmployees={filteredEmployees}
  addEmail={addEmail}
  />


  {/* CC */}

  <EmailField
  label="Cc"
  list={ccList}
  removeEmail={removeEmail}
  inputValue={inputValue}
  setInputValue={setInputValue}
  setActiveField={setActiveField}
  activeField={activeField}
  filteredEmployees={filteredEmployees}
  addEmail={addEmail}
  />


  {/* BCC */}

  <EmailField
  label="Bcc"
  list={bccList}
  removeEmail={removeEmail}
  inputValue={inputValue}
  setInputValue={setInputValue}
  setActiveField={setActiveField}
  activeField={activeField}
  filteredEmployees={filteredEmployees}
  addEmail={addEmail}
  />


  {/* SUBJECT */}

  <input
  value={subject}
  onChange={e=>setSubject(e.target.value)}
  placeholder="Subject"
  className="w-full bg-gray-800 px-4 py-3 rounded"
  />


  {/* BODY */}

  <ReactQuill
  theme="snow"
  value={body}
  onChange={setBody}
  />


  {/* TOOLBAR */}

  <div className="flex gap-4 items-center">

  <button
  type="button"
  onClick={()=>setShowEmoji(!showEmoji)}
  className="text-xl"
  >
  😊
  </button>

  <input
  type="file"
  multiple
  onChange={handleFileChange}
  />

  </div>


  {/* EMOJI PICKER */}

  {showEmoji &&(

  <EmojiPicker
  onEmojiClick={(emoji)=>
  setBody(prev => prev + " " + emoji.emoji)
  }
  />

  )}


  {/* ATTACHMENT LIST */}

  {attachments.map((file,i)=>(

  <div
  key={i}
  className="flex justify-between items-center bg-gray-800 px-3 py-2 rounded text-sm"
  >

  <span>📎 {file.name}</span>

  <button
  type="button"
  className="text-red-400"
  onClick={()=>removeAttachment(i)}
  >
  ✕
  </button>

  </div>

  ))}


  <button
  type="submit"
  disabled={sending}
  className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded"
  >

  {sending ? "Sending..." : "Send"}

  </button>

  </form>

  </div>

  );

}


/* ===================================================== */
/* ================= EMAIL FIELD ======================= */
/* ===================================================== */

function EmailField({
  label,
  list,
  removeEmail,
  inputValue,
  setInputValue,
  setActiveField,
  activeField,
  filteredEmployees,
  addEmail
}){

return(

<div>

<label className="block text-sm text-gray-400 mb-1">
{label}
</label>


<div
onClick={()=>setActiveField(label.toLowerCase())}
className="bg-gray-800 rounded px-3 py-2 flex flex-wrap gap-2 relative"
>


{/* SELECTED EMAILS */}

{list.map(email => (

<div
key={email}
className="bg-indigo-600 px-3 py-1 rounded-full text-sm flex items-center gap-2"
>

{email}

<button
type="button"
onClick={()=>removeEmail(email,label.toLowerCase())}
className="text-xs"
>
✕
</button>

</div>

))}


{/* INPUT */}

{activeField === label.toLowerCase() && (

<input
value={inputValue}
onChange={(e)=>setInputValue(e.target.value)}
onKeyDown={(e)=>{

if(e.key==="Enter" && filteredEmployees.length>0){

e.preventDefault();
addEmail(filteredEmployees[0].email);

}

}}
className="bg-transparent outline-none text-white flex-1 min-w-[150px]"
placeholder="Type email"
/>

)}

</div>


{/* SUGGESTIONS */}

{activeField===label.toLowerCase() &&
inputValue &&
filteredEmployees.length>0 &&(

<div className="bg-gray-800 border border-gray-700 rounded mt-1 max-h-40 overflow-y-auto">

{filteredEmployees.map(emp => (

<div
key={emp._id}
onClick={()=>addEmail(emp.email)}
className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
>

{emp.email}

</div>

))}

</div>

)}

</div>

);

}