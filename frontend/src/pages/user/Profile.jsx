import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import { changePasswordApi } from "../../api/authApi";


/* ================================================================
   PROFILE PAGE
================================================================ */

const Profile = () => {

    const navigate = useNavigate();

    const {
        user,
        setUser,
    } = useAuth();


    /* ============================================================
       STATE
    ============================================================ */

    const [showEditModal, setShowEditModal] =
        useState(false);

    const [showPasswordModal, setShowPasswordModal] =
        useState(false);

    const [copiedField, setCopiedField] =
        useState("");

    const [editLoading, setEditLoading] =
        useState(false);

    const [editMessage, setEditMessage] =
        useState("");

    const [editError, setEditError] =
        useState("");


    /* ============================================================
       EDIT PROFILE DATA
    ============================================================ */

    const [editData, setEditData] = useState({
        name: "",
        email: "",
    });


    /* ============================================================
       USER DATA
    ============================================================ */

    const displayName =
        user?.name ||
        user?.fullName ||
        user?.employeeName ||
        user?.username ||
        "User";


    const email =
        user?.email ||
        user?.emailAddress ||
        "Not available";


    const employeeId =
        user?.employeeId ||
        user?.employeeID ||
        user?.employee_id ||
        "Not available";


    const role =
        user?.role ||
        user?.roleName ||
        "USER";


    const accountStatus =
        user?.status ||
        user?.accountStatus ||
        "Active";


    const department =
        user?.department ||
        user?.departmentName ||
        "Not available";


    const phone =
        user?.phone ||
        user?.mobile ||
        user?.phoneNumber ||
        "Not available";


    /* ============================================================
       INITIALS
    ============================================================ */

    const initials = displayName
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();


    /* ============================================================
       SYNC EDIT DATA
    ============================================================ */

    useEffect(() => {

        setEditData({
            name:
                user?.name ||
                user?.fullName ||
                user?.employeeName ||
                user?.username ||
                "",

            email:
                user?.email ||
                user?.emailAddress ||
                "",
        });

    }, [user]);


    /* ============================================================
       COPY TO CLIPBOARD
    ============================================================ */

    const handleCopy = async (
        value,
        field
    ) => {

        if (
            !value ||
            value === "Not available"
        ) {
            return;
        }

        try {

            await navigator.clipboard.writeText(
                value
            );

            setCopiedField(field);

            setTimeout(() => {
                setCopiedField("");
            }, 1500);

        } catch (error) {

            console.error(
                "Copy failed:",
                error
            );
        }
    };


    /* ============================================================
       OPEN EDIT PROFILE
    ============================================================ */

    const openEditProfile = () => {

        setEditData({
            name:
                user?.name ||
                user?.fullName ||
                user?.employeeName ||
                user?.username ||
                "",

            email:
                user?.email ||
                user?.emailAddress ||
                "",
        });

        setEditMessage("");
        setEditError("");

        setShowEditModal(true);
    };


    /* ============================================================
       CLOSE EDIT PROFILE
    ============================================================ */

    const closeEditProfile = () => {

        if (editLoading) {
            return;
        }

        setShowEditModal(false);

        setEditMessage("");
        setEditError("");
    };


    /* ============================================================
       EDIT INPUT
    ============================================================ */

    const handleEditChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setEditData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setEditError("");
        setEditMessage("");
    };


    /* ============================================================
       SAVE PROFILE
       
       NOTE:
       Your current project does not have an update-profile API
       in the supplied Profile source.

       Therefore this updates the frontend/auth state only.
       Connect updateProfileApi() here when your backend endpoint
       is available.
    ============================================================ */

    const handleProfileUpdate = async (
        event
    ) => {

        event.preventDefault();

        setEditError("");
        setEditMessage("");


        const name =
            editData.name.trim();

        const newEmail =
            editData.email.trim()
                .toLowerCase();


        /* --------------------------------------------------------
           VALIDATION
        -------------------------------------------------------- */

        if (!name) {

            setEditError(
                "Full name is required."
            );

            return;
        }


        if (!newEmail) {

            setEditError(
                "Email address is required."
            );

            return;
        }


        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailRegex.test(newEmail)) {

            setEditError(
                "Please enter a valid email address."
            );

            return;
        }


        try {

            setEditLoading(true);


            /*
             * IMPORTANT:
             *
             * Add your backend update API here later:
             *
             * const response =
             *     await updateProfileApi({
             *         name,
             *         email: newEmail
             *     });
             *
             */


            /*
             * Update local AuthContext state if
             * setUser() is available.
             */

            if (typeof setUser === "function") {

                setUser((previous) => ({
                    ...previous,
                    name,
                    email: newEmail,
                }));
            }


            /*
             * Also keep localStorage synchronized.
             */

            try {

                const storedUser =
                    localStorage.getItem(
                        "darkmail_user"
                    );

                if (storedUser) {

                    const parsedUser =
                        JSON.parse(storedUser);

                    localStorage.setItem(
                        "darkmail_user",
                        JSON.stringify({
                            ...parsedUser,
                            name,
                            email: newEmail,
                        })
                    );
                }

            } catch (storageError) {

                console.warn(
                    "Unable to update local user:",
                    storageError
                );
            }


            setEditMessage(
                "Profile information updated."
            );


            setTimeout(() => {

                setShowEditModal(false);

                setEditMessage("");

            }, 1200);


        } catch (error) {

            console.error(
                "Profile update error:",
                error
            );

            setEditError(
                "Unable to update profile. Please try again."
            );

        } finally {

            setEditLoading(false);
        }
    };


    /* ============================================================
       BACK
    ============================================================ */

    const handleBack = () => {

        navigate(-1);
    };


    /* ============================================================
       MAIL NAVIGATION
       
       Current DarkMail architecture:
       /user/mail?Folder=inbox
       /user/mail?Folder=sent
       /user/mail?Folder=drafts
       /user/mail?Folder=trash
    ============================================================ */

    const goToMail = (folder) => {

        navigate(
            `/user/mail?Folder=${encodeURIComponent(folder)}`
        );
    };


    /* ============================================================
       RENDER
    ============================================================ */

    return (

        <div
            className="
                min-h-full
                w-full
                bg-gray-50
                px-3 py-4
                sm:px-5 sm:py-5
                lg:px-6
            "
        >

            <div
                className="
                    mx-auto
                    w-full
                    max-w-7xl
                "
            >


                {/* ==================================================
                    PAGE HEADER
                ================================================== */}

                <div
                    className="
                        mb-6
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        {/* BACK */}

                        <button
                            type="button"
                            onClick={handleBack}
                            title="Go back"
                            className="
                                flex
                                h-10 w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                border
                                border-gray-200
                                bg-white
                                text-gray-700
                                shadow-sm
                                transition
                                hover:bg-gray-50
                                hover:shadow-md
                                active:scale-95
                            "
                        >

                            <span
                                className="
                                    text-xl
                                    leading-none
                                "
                            >
                                ←
                            </span>

                        </button>


                        <div>

                            <h1
                                className="
                                    text-xl
                                    font-bold
                                    text-gray-900
                                    sm:text-2xl
                                "
                            >
                                My Profile
                            </h1>

                            <p
                                className="
                                    text-xs
                                    text-gray-500
                                    sm:text-sm
                                "
                            >
                                Manage your account and security
                                settings
                            </p>

                        </div>

                    </div>


                    {/* EDIT BUTTON */}

                    <button
                        type="button"
                        onClick={openEditProfile}
                        className="
                            inline-flex
                            w-full
                            items-center
                            justify-center
                            rounded-xl
                            bg-gray-900
                            px-4 py-2.5
                            text-sm
                            font-semibold
                            text-white
                            shadow-sm
                            transition
                            hover:bg-gray-800
                            active:scale-95
                            sm:w-auto
                        "
                    >

                        <span className="mr-2">
                            ✎
                        </span>

                        Edit Profile

                    </button>

                </div>


                {/* ==================================================
                    PROFILE HERO
                ================================================== */}

                <div
                    className="
                        mb-6
                        overflow-hidden
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white
                        shadow-sm
                    "
                >

                    {/* COVER */}

                    <div
                        className="
                            h-28
                            bg-gradient-to-r
                            from-gray-950
                            via-gray-800
                            to-gray-700
                            sm:h-36
                        "
                    />


                    <div
                        className="
                            px-4
                            pb-5
                            sm:px-6
                        "
                    >

                        <div
                            className="
                                -mt-12
                                flex
                                flex-col
                                gap-5
                                sm:-mt-14
                                sm:flex-row
                                sm:items-end
                                sm:justify-between
                            "
                        >

                            {/* AVATAR + DETAILS */}

                            <div
                                className="
                                    flex
                                    flex-col
                                    items-center
                                    gap-4
                                    sm:flex-row
                                    sm:items-end
                                "
                            >

                                {/* AVATAR */}

                                <div
                                    className="
                                        flex
                                        h-24 w-24
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        border-4
                                        border-white
                                        bg-gray-900
                                        text-2xl
                                        font-bold
                                        text-white
                                        shadow-lg
                                        sm:h-28
                                        sm:w-28
                                        sm:text-3xl
                                    "
                                >
                                    {initials}
                                </div>


                                {/* DETAILS */}

                                <div
                                    className="
                                        text-center
                                        sm:pb-1
                                        sm:text-left
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            flex-col
                                            items-center
                                            gap-2
                                            sm:flex-row
                                        "
                                    >

                                        <h2
                                            className="
                                                max-w-full
                                                truncate
                                                text-xl
                                                font-bold
                                                text-gray-900
                                                sm:text-2xl
                                            "
                                        >
                                            {displayName}
                                        </h2>


                                        <span
                                            className="
                                                inline-flex
                                                items-center
                                                gap-1.5
                                                rounded-full
                                                bg-green-100
                                                px-2.5 py-1
                                                text-xs
                                                font-semibold
                                                text-green-700
                                            "
                                        >

                                            <span
                                                className="
                                                    h-1.5
                                                    w-1.5
                                                    rounded-full
                                                    bg-green-500
                                                "
                                            />

                                            {accountStatus}

                                        </span>

                                    </div>


                                    <p
                                        className="
                                            mt-1
                                            max-w-md
                                            truncate
                                            text-sm
                                            text-gray-500
                                        "
                                    >
                                        {email}
                                    </p>

                                </div>

                            </div>


                            {/* ROLE */}

                            <div
                                className="
                                    flex
                                    justify-center
                                    sm:pb-2
                                "
                            >

                                <span
                                    className="
                                        rounded-full
                                        border
                                        border-gray-200
                                        bg-gray-50
                                        px-4 py-2
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-gray-700
                                    "
                                >
                                    {role}
                                </span>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    QUICK STATS
                ================================================== */}

                <div
                    className="
                        mb-6
                        grid
                        grid-cols-1
                        gap-4
                        sm:grid-cols-3
                    "
                >

                    <StatCard
                        icon="👤"
                        title="Account Type"
                        value="Employee"
                    />

                    <StatCard
                        icon="🟢"
                        title="Status"
                        value={accountStatus}
                    />

                    <StatCard
                        icon="🔐"
                        title="Security"
                        value="Protected"
                    />

                </div>


                {/* ==================================================
                    MAIN CONTENT
                ================================================== */}

                <div
                    className="
                        grid
                        grid-cols-1
                        gap-6
                        lg:grid-cols-3
                    "
                >


                    {/* =================================================
                        LEFT CONTENT
                    ================================================= */}

                    <div
                        className="
                            space-y-6
                            lg:col-span-2
                        "
                    >


                        {/* ACCOUNT INFORMATION */}

                        <SectionCard
                            title="Account Information"
                            description="
                                Basic information associated with
                                your DarkMail account.
                            "
                        >

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
                                    value={displayName}
                                />

                                <ProfileItem
                                    label="Email Address"
                                    value={email}
                                    copyable
                                    copied={
                                        copiedField === "email"
                                    }
                                    onCopy={() =>
                                        handleCopy(
                                            email,
                                            "email"
                                        )
                                    }
                                />

                                <ProfileItem
                                    label="Employee ID"
                                    value={employeeId}
                                    copyable
                                    copied={
                                        copiedField === "employeeId"
                                    }
                                    onCopy={() =>
                                        handleCopy(
                                            employeeId,
                                            "employeeId"
                                        )
                                    }
                                />

                                <ProfileItem
                                    label="Role"
                                    value={role}
                                />

                            </div>

                        </SectionCard>


                        {/* CONTACT INFORMATION */}

                        <SectionCard
                            title="Contact Information"
                            description="
                                Contact information associated
                                with your account.
                            "
                        >

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    gap-4
                                    sm:grid-cols-2
                                "
                            >

                                <ProfileItem
                                    label="Email"
                                    value={email}
                                />

                                <ProfileItem
                                    label="Phone"
                                    value={phone}
                                />

                                <ProfileItem
                                    label="Department"
                                    value={department}
                                />

                                <ProfileItem
                                    label="Employee ID"
                                    value={employeeId}
                                />

                            </div>

                        </SectionCard>


                        {/* SECURITY */}

                        <SectionCard
                            title="Security"
                            description="
                                Manage and review your account
                                security.
                            "
                        >

                            <div className="space-y-3">


                                {/* PASSWORD */}

                                <div
                                    className="
                                        flex
                                        flex-col
                                        gap-4
                                        rounded-xl
                                        border
                                        border-gray-200
                                        p-4
                                        sm:flex-row
                                        sm:items-center
                                        sm:justify-between
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                h-10 w-10
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-xl
                                                bg-gray-100
                                                text-lg
                                            "
                                        >
                                            🔒
                                        </div>


                                        <div>

                                            <h4
                                                className="
                                                    text-sm
                                                    font-semibold
                                                    text-gray-900
                                                "
                                            >
                                                Password
                                            </h4>

                                            <p
                                                className="
                                                    text-xs
                                                    text-gray-500
                                                "
                                            >
                                                Keep your password
                                                secure
                                            </p>

                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPasswordModal(
                                                true
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-gray-300
                                            px-3 py-2
                                            text-xs
                                            font-semibold
                                            text-gray-700
                                            transition
                                            hover:bg-gray-50
                                            sm:w-auto
                                        "
                                    >
                                        Change Password
                                    </button>

                                </div>


                                <SecurityRow
                                    icon="🛡️"
                                    title="Account Protection"
                                    description="
                                        Your account is protected
                                        with authentication.
                                    "
                                    status="Protected"
                                />


                                <SecurityRow
                                    icon="💻"
                                    title="Session Security"
                                    description="
                                        Your current session is
                                        authenticated.
                                    "
                                    status="Secure"
                                />

                            </div>

                        </SectionCard>

                    </div>


                    {/* =================================================
                        RIGHT SIDEBAR
                    ================================================= */}

                    <div
                        className="
                            space-y-6
                        "
                    >


                        {/* ACCOUNT STATUS */}

                        <SectionCard
                            title="Account Status"
                        >

                            <div
                                className="
                                    space-y-4
                                "
                            >

                                <StatusItem
                                    label="Account"
                                    value={accountStatus}
                                    success
                                />

                                <StatusItem
                                    label="Access"
                                    value="Allowed"
                                    success
                                />

                                <StatusItem
                                    label="Authentication"
                                    value="Verified"
                                    success
                                />

                            </div>

                        </SectionCard>


                        {/* ACCESS LEVEL */}

                        <SectionCard
                            title="Access Level"
                        >

                            <div
                                className="
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-gray-50
                                    p-4
                                "
                            >

                                <div
                                    className="
                                        mb-3
                                        flex
                                        items-center
                                        justify-between
                                        gap-3
                                    "
                                >

                                    <span
                                        className="
                                            text-sm
                                            font-medium
                                            text-gray-700
                                        "
                                    >
                                        Role
                                    </span>


                                    <span
                                        className="
                                            rounded-full
                                            bg-gray-900
                                            px-2.5 py-1
                                            text-xs
                                            font-semibold
                                            uppercase
                                            text-white
                                        "
                                    >
                                        {role}
                                    </span>

                                </div>


                                <p
                                    className="
                                        text-xs
                                        leading-5
                                        text-gray-500
                                    "
                                >
                                    Your access permissions are
                                    controlled according to your
                                    assigned role.
                                </p>

                            </div>

                        </SectionCard>


                        {/* ACCOUNT DETAILS */}

                        <SectionCard
                            title="Account Details"
                        >

                            <div
                                className="
                                    space-y-3
                                "
                            >

                                <DetailRow
                                    label="Employee ID"
                                    value={employeeId}
                                />

                                <DetailRow
                                    label="Account Role"
                                    value={role}
                                />

                                <DetailRow
                                    label="Status"
                                    value={accountStatus}
                                />

                            </div>

                        </SectionCard>


                        {/* QUICK ACTIONS */}

                        <SectionCard
                            title="Quick Actions"
                            description="
                                Quickly access common account actions.
                            "
                        >

                            <div className="space-y-2">

                                <QuickAction
                                    icon="📥"
                                    label="Go to Inbox"
                                    onClick={() =>
                                        goToMail("inbox")
                                    }
                                />

                                <QuickAction
                                    icon="📤"
                                    label="Sent Messages"
                                    onClick={() =>
                                        goToMail("sent")
                                    }
                                />

                                <QuickAction
                                    icon="⚙️"
                                    label="Account Settings"
                                    onClick={() =>
                                        navigate(
                                            "/user/settings"
                                        )
                                    }
                                />

                            </div>

                        </SectionCard>

                    </div>

                </div>

            </div>


            {/* ========================================================
                EDIT PROFILE MODAL
            ======================================================== */}

            {showEditModal && (

                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-black/60
                        p-3
                        sm:p-5
                    "
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeEditProfile();
                        }

                    }}
                >

                    <div
                        className="
                            w-full
                            max-w-lg
                            max-h-[90vh]
                            overflow-y-auto
                            rounded-2xl
                            border
                            border-gray-200
                            bg-white
                            p-5
                            shadow-2xl
                            sm:p-6
                        "
                    >

                        {/* HEADER */}

                        <div
                            className="
                                mb-6
                                flex
                                items-start
                                justify-between
                                gap-4
                            "
                        >

                            <div>

                                <h2
                                    className="
                                        text-lg
                                        font-bold
                                        text-gray-900
                                    "
                                >
                                    Edit Profile
                                </h2>

                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-gray-500
                                    "
                                >
                                    Update your profile
                                    information.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeEditProfile
                                }
                                disabled={editLoading}
                                className="
                                    flex
                                    h-9 w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    text-gray-500
                                    transition
                                    hover:bg-gray-100
                                "
                            >
                                ✕
                            </button>

                        </div>


                        {/* ERROR */}

                        {editError && (

                            <div
                                className="
                                    mb-4
                                    rounded-xl
                                    border
                                    border-red-200
                                    bg-red-50
                                    px-4 py-3
                                    text-sm
                                    text-red-700
                                "
                            >
                                {editError}
                            </div>

                        )}


                        {/* SUCCESS */}

                        {editMessage && (

                            <div
                                className="
                                    mb-4
                                    rounded-xl
                                    border
                                    border-green-200
                                    bg-green-50
                                    px-4 py-3
                                    text-sm
                                    text-green-700
                                "
                            >
                                {editMessage}
                            </div>

                        )}


                        <form
                            onSubmit={
                                handleProfileUpdate
                            }
                            className="space-y-5"
                        >

                            {/* NAME */}

                            <div>

                                <label
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-700
                                    "
                                >
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={
                                        editData.name
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                    disabled={
                                        editLoading
                                    }
                                    autoComplete="name"
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-gray-300
                                        bg-white
                                        px-4 py-3
                                        text-sm
                                        text-gray-900
                                        outline-none
                                        transition
                                        focus:border-gray-900
                                        focus:ring-2
                                        focus:ring-gray-900/10
                                    "
                                />

                            </div>


                            {/* EMAIL */}

                            <div>

                                <label
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-700
                                    "
                                >
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={
                                        editData.email
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                    disabled={
                                        editLoading
                                    }
                                    autoComplete="email"
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-gray-300
                                        bg-white
                                        px-4 py-3
                                        text-sm
                                        text-gray-900
                                        outline-none
                                        transition
                                        focus:border-gray-900
                                        focus:ring-2
                                        focus:ring-gray-900/10
                                    "
                                />

                            </div>


                            {/* EMPLOYEE ID */}

                            <div>

                                <label
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-700
                                    "
                                >
                                    Employee ID
                                </label>

                                <input
                                    type="text"
                                    value={employeeId}
                                    disabled
                                    className="
                                        w-full
                                        cursor-not-allowed
                                        rounded-xl
                                        border
                                        border-gray-200
                                        bg-gray-100
                                        px-4 py-3
                                        text-sm
                                        text-gray-500
                                    "
                                />

                            </div>


                            {/* ROLE */}

                            <div>

                                <label
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-700
                                    "
                                >
                                    Role
                                </label>

                                <input
                                    type="text"
                                    value={role}
                                    disabled
                                    className="
                                        w-full
                                        cursor-not-allowed
                                        rounded-xl
                                        border
                                        border-gray-200
                                        bg-gray-100
                                        px-4 py-3
                                        text-sm
                                        uppercase
                                        text-gray-500
                                    "
                                />

                            </div>


                            {/* BUTTONS */}

                            <div
                                className="
                                    flex
                                    flex-col-reverse
                                    gap-3
                                    pt-2
                                    sm:flex-row
                                    sm:justify-end
                                "
                            >

                                <button
                                    type="button"
                                    onClick={
                                        closeEditProfile
                                    }
                                    disabled={
                                        editLoading
                                    }
                                    className="
                                        rounded-xl
                                        border
                                        border-gray-300
                                        px-4 py-2.5
                                        text-sm
                                        font-semibold
                                        text-gray-700
                                        transition
                                        hover:bg-gray-50
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        editLoading
                                    }
                                    className="
                                        rounded-xl
                                        bg-gray-900
                                        px-4 py-2.5
                                        text-sm
                                        font-semibold
                                        text-white
                                        transition
                                        hover:bg-gray-800
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >

                                    {editLoading
                                        ? "Saving..."
                                        : "Save Changes"
                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* ========================================================
                CHANGE PASSWORD MODAL
            ======================================================== */}

            {showPasswordModal && (

                <ChangePasswordModal
                    onClose={() =>
                        setShowPasswordModal(
                            false
                        )
                    }
                />

            )}

        </div>
    );
};


/* ================================================================
   STAT CARD
================================================================ */

const StatCard = ({
    icon,
    title,
    value,
}) => {

    return (

        <div
            className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-5
                shadow-sm
            "
        >

            <div
                className="
                    flex
                    items-center
                    justify-between
                    gap-4
                "
            >

                <div className="min-w-0">

                    <p
                        className="
                            text-xs
                            font-medium
                            text-gray-500
                        "
                    >
                        {title}
                    </p>

                    <p
                        className="
                            mt-1
                            truncate
                            text-lg
                            font-bold
                            text-gray-900
                        "
                    >
                        {value}
                    </p>

                </div>


                <div
                    className="
                        flex
                        h-11 w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-gray-100
                        text-xl
                    "
                >
                    {icon}
                </div>

            </div>

        </div>

    );
};


/* ================================================================
   SECTION CARD
================================================================ */

const SectionCard = ({
    title,
    description,
    children,
}) => {

    return (

        <div
            className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-4
                shadow-sm
                sm:p-6
            "
        >

            <div className="mb-5">

                <h3
                    className="
                        text-base
                        font-bold
                        text-gray-900
                    "
                >
                    {title}
                </h3>

                {description && (

                    <p
                        className="
                            mt-1
                            text-xs
                            leading-5
                            text-gray-500
                        "
                    >
                        {description}
                    </p>

                )}

            </div>

            {children}

        </div>

    );
};


/* ================================================================
   PROFILE ITEM
================================================================ */

const ProfileItem = ({
    label,
    value,
    copyable = false,
    copied = false,
    onCopy,
}) => {

    return (

        <div
            className="
                rounded-xl
                border
                border-gray-200
                p-4
            "
        >

            <p
                className="
                    mb-1
                    text-xs
                    font-medium
                    text-gray-500
                "
            >
                {label}
            </p>


            <div
                className="
                    flex
                    min-w-0
                    items-center
                    justify-between
                    gap-3
                "
            >

                <p
                    className="
                        min-w-0
                        flex-1
                        truncate
                        text-sm
                        font-semibold
                        text-gray-900
                    "
                    title={value}
                >
                    {value}
                </p>


                {copyable && (

                    <button
                        type="button"
                        onClick={onCopy}
                        className="
                            shrink-0
                            rounded-lg
                            border
                            border-gray-200
                            px-2.5 py-1.5
                            text-xs
                            font-medium
                            text-gray-600
                            transition
                            hover:bg-gray-50
                        "
                    >
                        {copied
                            ? "Copied"
                            : "Copy"
                        }
                    </button>

                )}

            </div>

        </div>

    );
};


/* ================================================================
   SECURITY ROW
================================================================ */

const SecurityRow = ({
    icon,
    title,
    description,
    status,
}) => {

    return (

        <div
            className="
                flex
                flex-col
                gap-3
                rounded-xl
                border
                border-gray-200
                p-4
                sm:flex-row
                sm:items-center
                sm:justify-between
            "
        >

            <div
                className="
                    flex
                    min-w-0
                    items-center
                    gap-3
                "
            >

                <div
                    className="
                        flex
                        h-10 w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-gray-100
                        text-lg
                    "
                >
                    {icon}
                </div>


                <div className="min-w-0">

                    <h4
                        className="
                            text-sm
                            font-semibold
                            text-gray-900
                        "
                    >
                        {title}
                    </h4>

                    <p
                        className="
                            mt-0.5
                            text-xs
                            text-gray-500
                        "
                    >
                        {description}
                    </p>

                </div>

            </div>


            <span
                className="
                    w-fit
                    shrink-0
                    rounded-full
                    bg-green-100
                    px-3 py-1
                    text-xs
                    font-semibold
                    text-green-700
                "
            >
                {status}
            </span>

        </div>

    );
};


/* ================================================================
   STATUS ITEM
================================================================ */

const StatusItem = ({
    label,
    value,
    success = false,
}) => {

    return (

        <div
            className="
                flex
                items-center
                justify-between
                gap-3
            "
        >

            <span
                className="
                    text-sm
                    text-gray-600
                "
            >
                {label}
            </span>


            <span
                className={`
                    rounded-full
                    px-2.5 py-1
                    text-xs
                    font-semibold
                    ${
                        success
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                    }
                `}
            >
                {value}
            </span>

        </div>

    );
};


/* ================================================================
   DETAIL ROW
================================================================ */

const DetailRow = ({
    label,
    value,
}) => {

    return (

        <div
            className="
                flex
                items-center
                justify-between
                gap-4
                border-b
                border-gray-100
                pb-3
                last:border-0
                last:pb-0
            "
        >

            <span
                className="
                    text-sm
                    text-gray-500
                "
            >
                {label}
            </span>


            <span
                className="
                    max-w-[60%]
                    truncate
                    text-right
                    text-sm
                    font-semibold
                    text-gray-900
                "
                title={value}
            >
                {value}
            </span>

        </div>

    );
};


/* ================================================================
   QUICK ACTION
================================================================ */

const QuickAction = ({
    icon,
    label,
    onClick,
}) => {

    return (

        <button
            type="button"
            onClick={onClick}
            className="
                group
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                border
                border-gray-200
                bg-white
                px-4 py-3
                text-left
                transition
                duration-200
                hover:border-gray-300
                hover:bg-gray-50
                hover:shadow-sm
                active:scale-[0.99]
            "
        >

            <span
                className="
                    flex
                    h-9 w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-gray-100
                    text-lg
                    transition
                    group-hover:bg-gray-200
                "
            >
                {icon}
            </span>


            <span
                className="
                    min-w-0
                    flex-1
                    truncate
                    text-sm
                    font-medium
                    text-gray-700
                    transition
                    group-hover:text-gray-900
                "
            >
                {label}
            </span>


            <span
                className="
                    shrink-0
                    text-lg
                    text-gray-400
                    transition
                    duration-200
                    group-hover:translate-x-1
                    group-hover:text-gray-700
                "
            >
                →
            </span>

        </button>

    );
};


/* ================================================================
   CHANGE PASSWORD MODAL
================================================================ */

const ChangePasswordModal = ({
    onClose,
}) => {

    const [formData, setFormData] =
        useState({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });


    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false);

    const [showNewPassword, setShowNewPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);


    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    /* ============================================================
       INPUT
    ============================================================ */

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };


    /* ============================================================
       SUBMIT
    ============================================================ */

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError("");
        setSuccess("");


        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = formData;


        /* --------------------------------------------------------
           REQUIRED
        -------------------------------------------------------- */

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {

            setError(
                "Please fill all password fields."
            );

            return;
        }


        /* --------------------------------------------------------
           LENGTH
        -------------------------------------------------------- */

        if (
            newPassword.length < 8
        ) {

            setError(
                "New password must be at least 8 characters."
            );

            return;
        }


        /* --------------------------------------------------------
           SAME PASSWORD
        -------------------------------------------------------- */

        if (
            currentPassword ===
            newPassword
        ) {

            setError(
                "New password must be different from your current password."
            );

            return;
        }


        /* --------------------------------------------------------
           CONFIRM
        -------------------------------------------------------- */

        if (
            newPassword !==
            confirmPassword
        ) {

            setError(
                "New password and confirmation password do not match."
            );

            return;
        }


        try {

            setLoading(true);


            const response =
                await changePasswordApi({
                    currentPassword,
                    newPassword,
                    confirmPassword,
                });


            if (response?.success) {

                setSuccess(
                    response?.message ||
                    "Password changed successfully."
                );


                setFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });


                setTimeout(() => {

                    onClose();

                }, 1500);


            } else {

                setError(
                    response?.message ||
                    "Unable to change password."
                );
            }


        } catch (error) {

            console.error(
                "Change password error:",
                error
            );


            setError(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Unable to change password. Please try again."
            );


        } finally {

            setLoading(false);
        }
    };


    /* ============================================================
       PASSWORD INPUT COMPONENT
    ============================================================ */

    const PasswordInput = ({
        label,
        name,
        value,
        show,
        onToggle,
        placeholder,
    }) => {

        return (

            <div>

                <label
                    className="
                        mb-2
                        block
                        text-sm
                        font-medium
                        text-gray-700
                    "
                >
                    {label}
                </label>


                <div className="relative">

                    <input
                        type={
                            show
                                ? "text"
                                : "password"
                        }
                        name={name}
                        value={value}
                        onChange={
                            handleChange
                        }
                        placeholder={
                            placeholder
                        }
                        disabled={loading}
                        autoComplete="off"
                        className="
                            w-full
                            rounded-xl
                            border
                            border-gray-300
                            bg-white
                            px-4
                            py-3
                            pr-12
                            text-sm
                            text-gray-900
                            outline-none
                            transition
                            focus:border-gray-900
                            focus:ring-2
                            focus:ring-gray-900/10
                        "
                    />


                    <button
                        type="button"
                        onClick={onToggle}
                        disabled={loading}
                        className="
                            absolute
                            right-2
                            top-1/2
                            flex
                            h-9 w-9
                            -translate-y-1/2
                            items-center
                            justify-center
                            rounded-lg
                            text-gray-500
                            transition
                            hover:bg-gray-100
                        "
                    >
                        {show
                            ? "🙈"
                            : "👁️"
                        }
                    </button>

                </div>

            </div>
        );
    };


    /* ============================================================
       RENDER
    ============================================================ */

    return (

        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/60
                p-3
                sm:p-5
            "
        >

            <div
                className="
                    w-full
                    max-w-md
                    max-h-[92vh]
                    overflow-y-auto
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    p-5
                    shadow-2xl
                    sm:p-6
                "
            >

                {/* HEADER */}

                <div
                    className="
                        mb-6
                        flex
                        items-start
                        justify-between
                        gap-4
                    "
                >

                    <div>

                        <h2
                            className="
                                text-lg
                                font-bold
                                text-gray-900
                            "
                        >
                            Change Password
                        </h2>

                        <p
                            className="
                                mt-1
                                text-xs
                                text-gray-500
                            "
                        >
                            Update your DarkMail
                            account password.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="
                            flex
                            h-9 w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            text-gray-500
                            transition
                            hover:bg-gray-100
                            disabled:opacity-50
                        "
                    >
                        ✕
                    </button>

                </div>


                {/* ERROR */}

                {error && (

                    <div
                        className="
                            mb-4
                            rounded-xl
                            border
                            border-red-200
                            bg-red-50
                            px-4 py-3
                            text-sm
                            text-red-700
                        "
                    >
                        {error}
                    </div>

                )}


                {/* SUCCESS */}

                {success && (

                    <div
                        className="
                            mb-4
                            rounded-xl
                            border
                            border-green-200
                            bg-green-50
                            px-4 py-3
                            text-sm
                            text-green-700
                        "
                    >
                        {success}
                    </div>

                )}


                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <PasswordInput
                        label="Current Password"
                        name="currentPassword"
                        value={
                            formData.currentPassword
                        }
                        show={
                            showCurrentPassword
                        }
                        onToggle={() =>
                            setShowCurrentPassword(
                                (previous) =>
                                    !previous
                            )
                        }
                        placeholder="Enter current password"
                    />


                    <PasswordInput
                        label="New Password"
                        name="newPassword"
                        value={
                            formData.newPassword
                        }
                        show={
                            showNewPassword
                        }
                        onToggle={() =>
                            setShowNewPassword(
                                (previous) =>
                                    !previous
                            )
                        }
                        placeholder="Enter new password"
                    />


                    <PasswordInput
                        label="Confirm New Password"
                        name="confirmPassword"
                        value={
                            formData.confirmPassword
                        }
                        show={
                            showConfirmPassword
                        }
                        onToggle={() =>
                            setShowConfirmPassword(
                                (previous) =>
                                    !previous
                            )
                        }
                        placeholder="Confirm new password"
                    />


                    {/* PASSWORD RULES */}

                    <div
                        className="
                            rounded-xl
                            border
                            border-gray-200
                            bg-gray-50
                            p-3
                        "
                    >

                        <p
                            className="
                                mb-2
                                text-xs
                                font-semibold
                                text-gray-700
                            "
                        >
                            Password requirements
                        </p>

                        <ul
                            className="
                                space-y-1
                                text-xs
                                text-gray-500
                            "
                        >

                            <li>
                                • At least 8 characters
                            </li>

                            <li>
                                • New password must be
                                different from current password
                            </li>

                            <li>
                                • Confirmation must match
                            </li>

                        </ul>

                    </div>


                    {/* BUTTONS */}

                    <div
                        className="
                            flex
                            flex-col-reverse
                            gap-3
                            pt-2
                            sm:flex-row
                            sm:justify-end
                        "
                    >

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="
                                rounded-xl
                                border
                                border-gray-300
                                px-4 py-2.5
                                text-sm
                                font-semibold
                                text-gray-700
                                transition
                                hover:bg-gray-50
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                rounded-xl
                                bg-gray-900
                                px-4 py-2.5
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-gray-800
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            {loading
                                ? "Updating..."
                                : "Update Password"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};


export default Profile;