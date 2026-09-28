import { useEffect,useState } from "react";
import { getMessages } from "../../api";
import { auth } from "../../utils/auth";

export default function AdminSent(){

const [messages,setMessages] = useState([]);
const currentUser = auth.getCurrentUser();

useEffect(()=>{

async function load(){

const res = await getMessages();

const sent = res.data.filter(
msg=>msg.sender?._id===currentUser.id
);

setMessages(sent);

}

load();

},[]);

return(

<div className="p-6">

<h2 className="text-xl font-bold mb-4">
Sent Emails
</h2>

{messages.map(msg=>(

<div
key={msg._id}
className="border-b border-gray-800 py-3"
>

<div className="font-semibold">
{msg.subject}
</div>

<div className="text-sm text-gray-400">
To: {msg.recipients?.to?.map(u=>u.email).join(", ")}
</div>

</div>

))}

</div>

);

}