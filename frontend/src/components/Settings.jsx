import { useEffect, useState } from "react";
import { auth } from "../utils/auth";
import { ThemeManager } from "../utils/theme";
import { useNavigate } from "react-router-dom";
export function Settings() {

  const navigate = useNavigate();
  const currentUser = auth.getCurrentUser();

  const onBack = () => {
    if(!auth.isAdmin()){
      return navigate('/user');
    }
    return navigate('/admin');
  }

  const handleLogout = () => {
      auth.logout();
      navigate("/login");
    };
  // console.log("Current User data: ",currentUser);

  /* ================= STATE ================= */

  const [displayName,setDisplayName] =
  useState(currentUser?.name || "");


  const [theme,setTheme] =
  useState(ThemeManager.getTheme());


  const [compact,setCompact] =
  useState(
   localStorage.getItem("darkmail_compact")==="true"
  );


  const [notifications,setNotifications]=
  useState(true);


  const [sound,setSound]=
  useState(false);



  /* ================= APPLY THEME LIVE ================= */

  useEffect(()=>{

   ThemeManager.applyTheme(theme);

  },[theme]);



  /* ================= SAVE ================= */

  const saveSettings = ()=>{

   ThemeManager.setTheme(theme);

   localStorage.setItem(
     "darkmail_compact",
     compact
   );

   alert("Settings Saved");

  };



  /* ================= RESET ================= */

  const resetSettings = ()=>{

   setTheme("dark");

   setCompact(false);

   ThemeManager.setTheme("dark");

   localStorage.removeItem(
     "darkmail_compact"
   );

   alert("Reset Complete");

  };



  return(

<div className="min-h-screen bg-gray-900 text-gray-100">

<div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">


{/* HEADER */}

<div className="flex flex-col md:flex-row justify-between gap-4 mb-6">


<h1 className="text-2xl md:text-3xl font-bold">

Settings

</h1>


<button
onClick={onBack}
className="bg-gray-800 px-4 py-2 rounded"
>

← Back

</button>


</div>



<div className="space-y-6">



{/* ACCOUNT */}

<section className="bg-gray-950 border border-gray-800 rounded-xl p-6">


<h2 className="text-xl mb-4">

Account

</h2>


<div className="space-y-4">


<div>

<label>Email</label>

<input
value={currentUser?.email}
disabled
className="w-full mt-1 bg-gray-900 p-2 rounded border border-gray-800"
/>

</div>



<div>

<label>Name</label>

<input
value={displayName}
onChange={e=>setDisplayName(e.target.value)}
className="w-full mt-1 bg-gray-900 p-2 rounded border border-gray-800"
/>

</div>


</div>

</section>



{/* APPEARANCE */}

<section className="bg-gray-950 border border-gray-800 rounded-xl p-6">


<h2 className="text-xl mb-4">

Appearance

</h2>


<label>Theme</label>


<select
value={theme}
onChange={e=>setTheme(e.target.value)}
className="w-full mt-2 bg-gray-900 p-2 rounded border border-gray-800"
>

<option value="dark">

Dark

</option>


<option value="light">

Light

</option>


<option value="auto">

Auto

</option>

</select>



<div className="flex justify-between mt-6">

<span>Compact View</span>

<input
type="checkbox"
checked={compact}
onChange={()=>setCompact(!compact)}
/>

</div>


</section>



{/* NOTIFICATIONS */}

<section className="bg-gray-950 border border-gray-800 rounded-xl p-6">


<h2 className="text-xl mb-4">

Notifications

</h2>


<div className="flex justify-between">

<span>Email Notifications</span>

<input
type="checkbox"
checked={notifications}
onChange={()=>setNotifications(!notifications)}
/>

</div>



<div className="flex justify-between mt-4">

<span>Sound Alerts</span>

<input
type="checkbox"
checked={sound}
onChange={()=>setSound(!sound)}
/>

</div>


</section>



{/* ACTIONS */}

<section className="bg-gray-950 border border-gray-800 rounded-xl p-6">


<button
onClick={saveSettings}
className="w-full bg-indigo-600 py-2 rounded mb-3"
>

Save Settings

</button>



<button
onClick={resetSettings}
className="w-full bg-gray-800 py-2 rounded"
>

Reset

</button>


</section>



{/* ACCOUNT INFO */}

<section className="bg-gray-950 border border-gray-800 rounded-xl p-6">


<div className="flex justify-between mb-4">

<span>

Logged in as

</span>

<span>

{currentUser?.email}

</span>

</div>



<button
onClick={handleLogout}
className="w-full bg-red-600 py-2 rounded"
>

Logout

</button>


</section>


</div>

</div>

</div>

);

}