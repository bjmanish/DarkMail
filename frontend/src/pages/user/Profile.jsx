import { useAuth } from "../../context/AuthContext";

const Profile = () => {

    const { user } = useAuth();

    const profileInitial =
        user?.name?.charAt(0)?.toUpperCase() ||
        user?.email?.charAt(0)?.toUpperCase() ||
        "U";

    return (

        <div
            className="
                min-h-full
                bg-gray-50
                p-4
                sm:p-6
                lg:p-8
            "
        >

            {/* PAGE HEADER */}

            <div className="mb-6">

                <h1
                    className="
                        text-2xl
                        font-bold
                        text-gray-900
                    "
                >
                    My Profile
                </h1>

                <p
                    className="
                        mt-1
                        text-sm
                        text-gray-500
                    "
                >
                    View and manage your DarkMail account
                </p>

            </div>


            {/* PROFILE CARD */}

            <div
                className="
                    mx-auto
                    max-w-3xl
                    overflow-hidden
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    shadow-sm
                "
            >

                {/* PROFILE HEADER */}

                <div
                    className="
                        border-b
                        border-gray-200
                        bg-gray-900
                        px-6
                        py-8
                        sm:px-8
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            items-center
                            sm:flex-row
                            sm:items-center
                            sm:gap-5
                        "
                    >

                        {/* AVATAR */}

                        <div
                            className="
                                flex
                                h-24
                                w-24
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-blue-600
                                text-3xl
                                font-bold
                                text-white
                                ring-4
                                ring-white/20
                            "
                        >
                            {profileInitial}
                        </div>


                        {/* NAME */}

                        <div
                            className="
                                mt-4
                                text-center
                                sm:mt-0
                                sm:text-left
                            "
                        >

                            <h2
                                className="
                                    text-2xl
                                    font-bold
                                    text-white
                                "
                            >
                                {user?.name || "User"}
                            </h2>

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-gray-300
                                "
                            >
                                {user?.email || "No email"}
                            </p>

                            <span
                                className="
                                    mt-3
                                    inline-flex
                                    rounded-full
                                    bg-white/10
                                    px-3
                                    py-1
                                    text-xs
                                    font-medium
                                    text-gray-200
                                "
                            >
                                {user?.role || "USER"}
                            </span>

                        </div>

                    </div>

                </div>


                {/* PROFILE DETAILS */}

                <div className="p-6 sm:p-8">

                    <h3
                        className="
                            mb-5
                            text-lg
                            font-semibold
                            text-gray-900
                        "
                    >
                        Account Information
                    </h3>


                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-2
                        "
                    >

                        <ProfileItem
                            label="Full Name"
                            value={
                                user?.name ||
                                "Not available"
                            }
                        />

                        <ProfileItem
                            label="Email"
                            value={
                                user?.email ||
                                "Not available"
                            }
                        />

                        <ProfileItem
                            label="Employee ID"
                            value={
                                user?.employeeId ||
                                user?.employeeID ||
                                "Not available"
                            }
                        />

                        <ProfileItem
                            label="Role"
                            value={
                                user?.role ||
                                "USER"
                            }
                        />

                    </div>


                    {/* EDIT PROFILE */}

                    <div
                        className="
                            mt-8
                            border-t
                            border-gray-200
                            pt-6
                        "
                    >

                        <button
                            type="button"
                            className="
                                rounded-xl
                                bg-gray-900
                                px-5
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-gray-800
                            "
                        >
                            Edit Profile
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );
};


/* =========================================================
   PROFILE ITEM
========================================================= */

const ProfileItem = ({
    label,
    value
}) => {

    return (

        <div
            className="
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                p-4
            "
        >

            <p
                className="
                    text-xs
                    font-medium
                    uppercase
                    tracking-wide
                    text-gray-500
                "
            >
                {label}
            </p>

            <p
                className="
                    mt-2
                    truncate
                    text-sm
                    font-semibold
                    text-gray-900
                "
            >
                {value}
            </p>

        </div>

    );
};


export default Profile;