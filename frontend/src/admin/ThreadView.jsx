export default function ThreadView({messages}){

return(

<div className="space-y-6">

{messages.map(msg=>(

<div
key={msg._id}
className="bg-gray-900 border border-gray-800 rounded p-4"
>

<div className="flex justify-between mb-2">

<span className="font-semibold">

{msg.sender.email}

</span>

<span className="text-xs text-gray-400">

{new Date(msg.createdAt).toLocaleString()}

</span>

</div>

<div className="text-gray-300 whitespace-pre-wrap">

{msg.body}

</div>

</div>

))}

</div>

);

}