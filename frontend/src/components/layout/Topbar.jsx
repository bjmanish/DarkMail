import { useState } from "react";
import {
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../../context/AuthContext";


const Topbar = ({
    onMenuClick
}) => {

    const {
        user
    } = useAuth();

    const navigate =
        useNavigate();

    const [search, setSearch] =
        useState("");


    const profileInitial =
        user?.name?.charAt(0)?.toUpperCase() ||
        user?.email?.charAt(0)?.toUpperCase() ||
        "U";


    /* =========================================================
       PROFILE
    ========================================================= */

    const handleProfileClick = () => {

        console.log(
            "Opening user profile"
        );

        navigate(
            "/user/profile"
        );
    };


    return (

        <header
            className="
                sticky
                top-0
                z-40
                flex
                h-16
                items-center
                border-b
                border-gray-200
                bg-white
                px-4
                md:px-6
            "
        >

            {/* MOBILE MENU */}

            <button
                type="button"
                onClick={onMenuClick}
                className="
                    mr-3
                    rounded-lg
                    p-2
                    text-gray-600
                    hover:bg-gray-100
                    lg:hidden
                "
            >
                ☰
            </button>


            {/* SEARCH */}

            <div
                className="
                    relative
                    max-w-xl
                    flex-1
                "
            >

                <span
                    className="
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-gray-400
                    "
                >
                    🔍
                </span>

                <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                    placeholder="Search mail..."
                    className="
                        w-full
                        rounded-xl
                        bg-gray-100
                        py-2.5
                        pl-10
                        pr-4
                        text-sm
                        outline-none
                        transition
                        focus:bg-white
                        focus:ring-2
                        focus:ring-blue-100
                    "
                />

            </div>


            {/* RIGHT */}

            <div
                className="
                    ml-3
                    flex
                    items-center
                    gap-2
                    sm:ml-4
                    sm:gap-3
                "
            >

                {/* NOTIFICATION */}

                <button
                    type="button"
                    title="Notifications"
                    className="
                        rounded-lg
                        p-2
                        text-gray-500
                        hover:bg-gray-100
                    "
                >
                    🔔
                </button>


                {/* USER DETAILS */}

                <div
                    className="
                        hidden
                        text-right
                        sm:block
                    "
                >

                    <p
                        className="
                            text-sm
                            font-semibold
                            text-gray-800
                        "
                    >
                        {user?.name || "User"}
                    </p>

                    <p
                        className="
                            text-xs
                            text-gray-500
                        "
                    >
                        {user?.role || "USER"}
                    </p>

                </div>


                {/* PROFILE */}

                <button
                    type="button"
                    onClick={
                        handleProfileClick
                    }
                    title="My Profile"
                    aria-label="Open My Profile"
                    className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        cursor-pointer
                        items-center
                        justify-center
                        rounded-full
                        bg-blue-600
                        text-sm
                        font-bold
                        text-white
                        shadow-sm
                        transition
                        hover:bg-blue-700
                        hover:shadow-md
                        active:scale-95
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-300
                        focus:ring-offset-2
                    "
                >
                    {profileInitial}
                </button>

            </div>

        </header>

    );
};


export default Topbar;