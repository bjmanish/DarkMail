import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    saveDraftApi,
    sendMessageApi,
    searchRecipientsApi
} from "../../api/messageApi";

import {
    useAuth
} from "../../context/AuthContext";


const ComposeModal = ({
    open,
    onClose,
    onSent,
    draft = null
}) => {

    const {
        user
    } = useAuth();


    /* =====================================================
       STATE
    ===================================================== */

    const [employees, setEmployees] =
        useState([]);

    const [loadingEmployees, setLoadingEmployees] =
        useState(false);

    const [sending, setSending] =
        useState(false);

    const [savingDraft, setSavingDraft] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    const [subject, setSubject] =
        useState("");

    const [body, setBody] =
        useState("");


    const [to, setTo] =
        useState([]);

    const [cc, setCc] =
        useState([]);

    const [bcc, setBcc] =
        useState([]);


    const [showCc, setShowCc] =
        useState(false);

    const [showBcc, setShowBcc] =
        useState(false);


    const [attachments, setAttachments] =
        useState([]);


    const [recipientSearch, setRecipientSearch] =
        useState("");

    const [recipientMode, setRecipientMode] =
        useState("to");


    /* =====================================================
       RESET
    ===================================================== */

    const resetForm = () => {

        setSubject("");

        setBody("");

        setTo([]);

        setCc([]);

        setBcc([]);

        setAttachments([]);

        setError("");

        setSuccess("");

        setRecipientSearch("");

        setRecipientMode("to");

        setShowCc(false);

        setShowBcc(false);
    };


    /* =====================================================
       LOAD EMPLOYEES
    ===================================================== */

    useEffect(() => {

    const search =
        recipientSearch
            .trim();


    if (!open) {

        return;
    }


    if (!search) {

        setEmployees([]);

        return;
    }


    let cancelled = false;


    const timer =
        setTimeout(
            async () => {

                try {

                    setLoadingEmployees(
                        true
                    );


                    const response =
                        await searchRecipientsApi(
                            search
                        );


                    if (
                        cancelled
                    ) {

                        return;
                    }


                    const employeeList =
                        response?.data ||
                        response?.employees ||
                        [];


                    const currentUserId =
                        String(
                            user?._id ||
                            user?.id ||
                            ""
                        );


                    const filtered =
                        employeeList.filter(
                            (employee) => {

                                const employeeId =
                                    String(
                                        employee?._id ||
                                        employee?.id ||
                                        ""
                                    );


                                return (
                                    employee.isActive !== false &&
                                    employeeId !==
                                        currentUserId
                                );

                            }
                        );


                    setEmployees(
                        filtered
                    );


                } catch (error) {

                    if (
                        cancelled
                    ) {

                        return;
                    }


                    console.error(
                        "Recipient search error:",
                        error
                    );


                    setEmployees([]);


                    /*
                     * Don't show the error as a
                     * global compose error for a
                     * simple search failure.
                     */

                } finally {

                    if (
                        !cancelled
                    ) {

                        setLoadingEmployees(
                            false
                        );
                    }
                }

            },
            300
        );


    return () => {

        cancelled = true;

        clearTimeout(
            timer
        );

    };

}, [
    open,
    recipientSearch,
    user?._id,
    user?.id
]);


    /* =====================================================
       LOAD DRAFT INTO FORM
    ===================================================== */

    useEffect(() => {

        if (!open) {
            return;
        }


        if (!draft) {

            resetForm();

            return;
        }


        setSubject(
            draft.subject || ""
        );


        setBody(
            draft.body || ""
        );


        setTo(
            Array.isArray(draft.to)
                ? draft.to
                : []
        );


        setCc(
            Array.isArray(draft.cc)
                ? draft.cc
                : []
        );


        setBcc(
            Array.isArray(draft.bcc)
                ? draft.bcc
                : []
        );


        setShowCc(
            Boolean(
                draft.cc?.length
            )
        );


        setShowBcc(
            Boolean(
                draft.bcc?.length
            )
        );


        setRecipientSearch("");

        setRecipientMode("to");


    }, [
        open,
        draft
    ]);


    /* =====================================================
       RECIPIENT HELPERS
    ===================================================== */

    const getEmployeeId = (
        employee
    ) => {

        return String(
            employee?._id ||
            employee?.id ||
            ""
        );
    };


    const getEmployeeEmail = (
        employee
    ) => {

        if (
            typeof employee ===
            "string"
        ) {

            return employee;
        }


        return (
            employee?.email ||
            ""
        );
    };


    const getEmployeeName = (
        employee
    ) => {

        if (
            typeof employee ===
            "string"
        ) {

            return employee;
        }


        return (
            employee?.name ||
            employee?.email ||
            "Unknown"
        );
    };


    /* =====================================================
       CURRENT RECIPIENT LIST
    ===================================================== */

    const currentRecipients =
        useMemo(() => {

            if (
                recipientMode ===
                "cc"
            ) {

                return cc;
            }


            if (
                recipientMode ===
                "bcc"
            ) {

                return bcc;
            }


            return to;

        }, [
            recipientMode,
            to,
            cc,
            bcc
        ]);


    /* =====================================================
       FILTER EMPLOYEES

       IMPORTANT:
       Employee list stays hidden until
       user enters a search value.
    ===================================================== */

    const filteredEmployees =
        useMemo(() => {

            const search =
                recipientSearch
                    .trim()
                    .toLowerCase();


            /*
             * Do not display employees
             * when search box is empty.
             */

            if (!search) {

                return [];
            }


            return employees
                .filter(
                    (employee) => {

                        const id =
                            getEmployeeId(
                                employee
                            );


                        const alreadySelected =
                            currentRecipients.some(
                                (selected) =>
                                    getEmployeeId(
                                        selected
                                    ) === id
                            );


                        /*
                         * Don't show an employee
                         * that is already selected.
                         */

                        if (
                            alreadySelected
                        ) {

                            return false;
                        }


                        /*
                         * Search by:
                         *
                         * Name
                         * Email
                         * Employee ID
                         */

                        return (

                            employee.name
                                ?.toLowerCase()
                                .includes(search)

                            ||

                            employee.email
                                ?.toLowerCase()
                                .includes(search)

                            ||

                            employee.employeeId
                                ?.toLowerCase()
                                .includes(search)

                        );

                    }
                );

        }, [
            employees,
            recipientSearch,
            currentRecipients
        ]);


    /* =====================================================
       ADD RECIPIENT
    ===================================================== */

    const addRecipient = (
        employee
    ) => {

        if (!employee) {
            return;
        }


        const id =
            getEmployeeId(
                employee
            );


        if (!id) {
            return;
        }


        if (
            recipientMode ===
            "cc"
        ) {

            setCc(
                (previous) => {

                    if (
                        previous.some(
                            (item) =>
                                getEmployeeId(
                                    item
                                ) === id
                        )
                    ) {

                        return previous;
                    }


                    return [
                        ...previous,
                        employee
                    ];
                }
            );


        } else if (
            recipientMode ===
            "bcc"
        ) {

            setBcc(
                (previous) => {

                    if (
                        previous.some(
                            (item) =>
                                getEmployeeId(
                                    item
                                ) === id
                        )
                    ) {

                        return previous;
                    }


                    return [
                        ...previous,
                        employee
                    ];
                }
            );


        } else {

            setTo(
                (previous) => {

                    if (
                        previous.some(
                            (item) =>
                                getEmployeeId(
                                    item
                                ) === id
                        )
                    ) {

                        return previous;
                    }


                    return [
                        ...previous,
                        employee
                    ];
                }
            );
        }


        /*
         * Clear search after selection.
         */

        setRecipientSearch("");
    };


    /* =====================================================
       REMOVE RECIPIENT
    ===================================================== */

    const removeRecipient = (
        employee,
        mode
    ) => {

        const id =
            getEmployeeId(
                employee
            );


        if (
            mode ===
            "cc"
        ) {

            setCc(
                (previous) =>
                    previous.filter(
                        (item) =>
                            getEmployeeId(
                                item
                            ) !== id
                    )
            );


        } else if (
            mode ===
            "bcc"
        ) {

            setBcc(
                (previous) =>
                    previous.filter(
                        (item) =>
                            getEmployeeId(
                                item
                            ) !== id
                    )
            );


        } else {

            setTo(
                (previous) =>
                    previous.filter(
                        (item) =>
                            getEmployeeId(
                                item
                            ) !== id
                    )
            );
        }
    };


    /* =====================================================
       CONVERT RECIPIENTS TO EMAILS
    ===================================================== */

    const getRecipientEmails =
        (list) => {

            return list
                .map(
                    (employee) =>
                        getEmployeeEmail(
                            employee
                        )
                )
                .filter(Boolean);
        };


    /* =====================================================
       ATTACHMENTS
    ===================================================== */

    const handleAttachmentChange =
        (event) => {

            const files =
                Array.from(
                    event.target.files ||
                    []
                );


            setAttachments(
                (previous) => [
                    ...previous,
                    ...files
                ]
            );


            event.target.value = "";
        };


    const removeAttachment =
        (index) => {

            setAttachments(
                (previous) =>
                    previous.filter(
                        (_, fileIndex) =>
                            fileIndex !== index
                    )
            );
        };


    /* =====================================================
       VALIDATION
    ===================================================== */

    const validate =
        () => {

            setError("");


            if (!to.length) {

                setError(
                    "Please select at least one To recipient."
                );

                return false;
            }


            if (!subject.trim()) {

                setError(
                    "Please enter a subject."
                );

                return false;
            }


            if (!body.trim()) {

                setError(
                    "Please enter a message."
                );

                return false;
            }


            return true;
        };


    /* =====================================================
       SEND MESSAGE
    ===================================================== */

    const handleSend =
        async () => {

            if (!validate()) {
                return;
            }


            try {

                setSending(true);

                setError("");

                setSuccess("");


                const formData =
                    new FormData();


                formData.append(
                    "subject",
                    subject.trim()
                );


                formData.append(
                    "body",
                    body.trim()
                );


                const toEmails =
                    getRecipientEmails(
                        to
                    );


                const ccEmails =
                    getRecipientEmails(
                        cc
                    );


                const bccEmails =
                    getRecipientEmails(
                        bcc
                    );


                console.log(
                    "================================"
                );

                console.log(
                    "COMPOSE SEND"
                );

                console.log(
                    "TO:",
                    toEmails
                );

                console.log(
                    "CC:",
                    ccEmails
                );

                console.log(
                    "BCC:",
                    bccEmails
                );

                console.log(
                    "SUBJECT:",
                    subject
                );

                console.log(
                    "================================"
                );


                toEmails.forEach(
                    (email) =>
                        formData.append(
                            "to",
                            email
                        )
                );


                ccEmails.forEach(
                    (email) =>
                        formData.append(
                            "cc",
                            email
                        )
                );


                bccEmails.forEach(
                    (email) =>
                        formData.append(
                            "bcc",
                            email
                        )
                );


                attachments.forEach(
                    (file) =>
                        formData.append(
                            "attachments",
                            file
                        )
                );


                const response =
                    await sendMessageApi(
                        formData
                    );


                if (
                    !response?.success
                ) {

                    throw new Error(
                        response?.message ||
                        "Failed to send message."
                    );
                }


                setSuccess(
                    "Message sent successfully."
                );


                if (onSent) {

                    onSent(
                        response
                    );
                }


                setTimeout(() => {

                    resetForm();

                    if (onClose) {

                        onClose();
                    }

                }, 700);


            } catch (err) {

                console.error(
                    "Send message error:",
                    err
                );


                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to send message."
                );


            } finally {

                setSending(false);
            }
        };


    /* =====================================================
       SAVE DRAFT
    ===================================================== */

    const handleSaveDraft =
        async () => {

            try {

                setSavingDraft(true);

                setError("");

                setSuccess("");


                const data = {

                    messageId:
                        draft?._id ||
                        draft?.id ||
                        undefined,

                    subject:
                        subject.trim(),

                    body:
                        body,

                    to:
                        getRecipientEmails(
                            to
                        ),

                    cc:
                        getRecipientEmails(
                            cc
                        ),

                    bcc:
                        getRecipientEmails(
                            bcc
                        )
                };


                const response =
                    await saveDraftApi(
                        data
                    );


                if (
                    !response?.success
                ) {

                    throw new Error(
                        response?.message ||
                        "Failed to save draft."
                    );
                }


                setSuccess(
                    "Draft saved successfully."
                );


                setTimeout(() => {

                    resetForm();

                    if (onClose) {

                        onClose();
                    }

                }, 700);


            } catch (err) {

                console.error(
                    "Save draft error:",
                    err
                );


                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to save draft."
                );


            } finally {

                setSavingDraft(false);
            }
        };


    /* =====================================================
       CLOSE
    ===================================================== */

    const handleClose =
        () => {

            if (
                sending ||
                savingDraft
            ) {

                return;
            }


            resetForm();


            if (onClose) {

                onClose();
            }
        };


    /* =====================================================
       DON'T RENDER
    ===================================================== */

    if (!open) {
        return null;
    }


    /* =====================================================
       UI
    ===================================================== */

    return (

        <div
            className="
                fixed
                inset-0
                z-[100]
                flex
                items-center
                justify-center
                bg-black/50
                pl-14
                ml-14
            "
        >

            <div
                className="
                    flex
                    w-full
                    max-w-3xl
                    max-h-[92vh]
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    bg-white
                    shadow-2xl
                "
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-b
                        px-5
                        py-4
                    "
                >

                    <div>

                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-gray-900
                            "
                        >
                            {
                                draft
                                    ? "Edit Draft"
                                    : "New Message"
                            }
                        </h2>

                        <p
                            className="
                                text-xs
                                text-gray-500
                            "
                        >
                            Send a message to a DarkMail employee
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={
                            handleClose
                        }
                        disabled={
                            sending ||
                            savingDraft
                        }
                        className="
                            rounded-lg
                            p-2
                            text-gray-500
                            hover:bg-gray-100
                            disabled:opacity-50
                        "
                    >
                        ✕
                    </button>

                </div>


                {/* =================================================
                    CONTENT
                ================================================= */}

                <div
                    className="
                        flex-1
                        overflow-y-auto
                        p-5
                    "
                >

                    {/* ERROR */}

                    {error && (

                        <div
                            className="
                                mb-4
                                rounded-lg
                                border
                                border-red-200
                                bg-red-50
                                px-4
                                py-3
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
                                rounded-lg
                                border
                                border-green-200
                                bg-green-50
                                px-4
                                py-3
                                text-sm
                                text-green-700
                            "
                        >
                            {success}
                        </div>
                    )}


                    {/* =================================================
                        TO
                    ================================================= */}

                    <div className="mb-3">

                        <div
                            className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                                rounded-lg
                                border
                                px-3
                                py-2
                            "
                        >

                            <span
                                className="
                                    text-sm
                                    font-medium
                                    text-gray-600
                                "
                            >
                                To:
                            </span>


                            {/* SELECTED RECIPIENTS */}

                            {to.map(
                                (employee) => (

                                    <div
                                        key={
                                            getEmployeeId(
                                                employee
                                            )
                                        }
                                        className="
                                            flex
                                            items-center
                                            gap-1
                                            rounded-full
                                            bg-gray-100
                                            px-3
                                            py-1
                                            text-sm
                                        "
                                    >

                                        <div className="flex min-w-0 flex-col leading-tight">
                                            <span className="max-w-[220px] truncate text-xs font-semibold text-gray-900">
                                                {getEmployeeName(employee)}
                                            </span>
                                            <span className="max-w-[220px] truncate text-[10px] text-gray-500">
                                                {getEmployeeEmail(employee)}
                                            </span>
                                        </div>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeRecipient(
                                                    employee,
                                                    "to"
                                                )
                                            }
                                            className="
                                                text-gray-500
                                                hover:text-red-500
                                            "
                                        >
                                            ×
                                        </button>

                                    </div>

                                )
                            )}


                            {/* SEARCH */}

                            <input
                                value={
                                    recipientMode === "to"
                                        ? recipientSearch
                                        : ""
                                }
                                onFocus={() =>
                                    setRecipientMode("to")
                                }
                                onChange={(event) =>
                                    setRecipientSearch(
                                        event.target.value
                                    )
                                }
                                placeholder={
                                    to.length
                                        ? "Search another recipient..."
                                        : "Search recipient..."
                                }
                                className="
                                    min-w-[180px]
                                    flex-1
                                    border-0
                                    outline-none
                                    text-sm
                                "
                            />

                        </div>


                        {/* TO SEARCH RESULTS */}

                        {recipientMode === "to" &&
                            recipientSearch.trim() && (

                                <RecipientDropdown
                                    loading={
                                        loadingEmployees
                                    }
                                    employees={
                                        filteredEmployees
                                    }
                                    onSelect={
                                        addRecipient
                                    }
                                />

                            )}

                    </div>


                    {/* =================================================
                        CC / BCC BUTTONS
                    ================================================= */}

                    <div
                        className="
                            mb-3
                            flex
                            gap-4
                            text-sm
                        "
                    >

                        <button
                            type="button"
                            onClick={() =>
                                setShowCc(
                                    !showCc
                                )
                            }
                            className="
                                text-gray-600
                                hover:text-gray-900
                            "
                        >
                            {
                                showCc
                                    ? "Hide CC"
                                    : "Add CC"
                            }
                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                setShowBcc(
                                    !showBcc
                                )
                            }
                            className="
                                text-gray-600
                                hover:text-gray-900
                            "
                        >
                            {
                                showBcc
                                    ? "Hide BCC"
                                    : "Add BCC"
                            }
                        </button>

                    </div>


                    {/* =================================================
                        CC
                    ================================================= */}

                    {showCc && (

                        <RecipientField
                            label="CC"
                            recipients={cc}
                            search={
                                recipientMode === "cc"
                                    ? recipientSearch
                                    : ""
                            }
                            employees={
                                recipientMode === "cc"
                                    ? filteredEmployees
                                    : []
                            }
                            loading={
                                loadingEmployees
                            }
                            onFocus={() => {

                                setRecipientMode(
                                    "cc"
                                );

                                setRecipientSearch(
                                    ""
                                );
                            }}
                            onSearch={
                                setRecipientSearch
                            }
                            onSelect={
                                addRecipient
                            }
                            onRemove={
                                (employee) =>
                                    removeRecipient(
                                        employee,
                                        "cc"
                                    )
                            }
                            getId={
                                getEmployeeId
                            }
                            getName={getEmployeeName}
                            getEmail={getEmployeeEmail}
                        />

                    )}


                    {/* =================================================
                        BCC
                    ================================================= */}

                    {showBcc && (

                        <RecipientField
                            label="BCC"
                            recipients={bcc}
                            search={
                                recipientMode === "bcc"
                                    ? recipientSearch
                                    : ""
                            }
                            employees={
                                recipientMode === "bcc"
                                    ? filteredEmployees
                                    : []
                            }
                            loading={
                                loadingEmployees
                            }
                            onFocus={() => {

                                setRecipientMode(
                                    "bcc"
                                );

                                setRecipientSearch(
                                    ""
                                );
                            }}
                            onSearch={
                                setRecipientSearch
                            }
                            onSelect={
                                addRecipient
                            }
                            onRemove={
                                (employee) =>
                                    removeRecipient(
                                        employee,
                                        "bcc"
                                    )
                            }
                            getId={
                                getEmployeeId
                            }
                            getName={getEmployeeName}
                            getEmail={getEmployeeEmail}
                        />

                    )}


                    {/* =================================================
                        SUBJECT
                    ================================================= */}

                    <input
                        type="text"
                        value={subject}
                        onChange={(event) =>
                            setSubject(
                                event.target.value
                            )
                        }
                        placeholder="Subject"
                        className="
                            mb-4
                            w-full
                            border-b
                            px-1
                            py-3
                            text-base
                            outline-none
                            focus:border-gray-500
                        "
                    />


                    {/* =================================================
                        BODY
                    ================================================= */}

                    <textarea
                        value={body}
                        onChange={(event) =>
                            setBody(
                                event.target.value
                            )
                        }
                        placeholder="Write your message..."
                        rows={12}
                        className="
                            w-full
                            resize-none
                            rounded-lg
                            border
                            p-4
                            text-sm
                            outline-none
                            focus:ring-2
                            focus:ring-gray-200
                        "
                    />


                    {/* =================================================
                        ATTACHMENTS
                    ================================================= */}

                    {attachments.length > 0 && (

                        <div
                            className="
                                mt-4
                                space-y-2
                            "
                        >

                            {attachments.map(
                                (file, index) => (

                                    <div
                                        key={`${file.name}-${index}`}
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            rounded-lg
                                            bg-gray-50
                                            px-3
                                            py-2
                                            text-sm
                                        "
                                    >

                                        <div
                                            className="
                                                min-w-0
                                            "
                                        >

                                            <p
                                                className="
                                                    truncate
                                                    font-medium
                                                "
                                            >
                                                {file.name}
                                            </p>

                                            <p
                                                className="
                                                    text-xs
                                                    text-gray-500
                                                "
                                            >
                                                {(
                                                    file.size /
                                                    1024
                                                ).toFixed(1)}
                                                {" "}KB
                                            </p>

                                        </div>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeAttachment(
                                                    index
                                                )
                                            }
                                            className="
                                                ml-3
                                                text-red-500
                                            "
                                        >
                                            Remove
                                        </button>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                    className="
                        flex
                        flex-wrap
                        items-center
                        justify-between
                        gap-3
                        border-t
                        px-5
                        py-4
                    "
                >

                    {/* ATTACH */}

                    <label
                        className="
                            cursor-pointer
                            rounded-lg
                            border
                            px-4
                            py-2
                            text-sm
                            hover:bg-gray-50
                        "
                    >

                        📎 Attach

                        <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={
                                handleAttachmentChange
                            }
                        />

                    </label>


                    {/* ACTIONS */}

                    <div
                        className="
                            flex
                            gap-2
                        "
                    >

                        <button
                            type="button"
                            onClick={
                                handleSaveDraft
                            }
                            disabled={
                                savingDraft ||
                                sending
                            }
                            className="
                                rounded-lg
                                border
                                px-4
                                py-2
                                text-sm
                                hover:bg-gray-50
                                disabled:opacity-50
                            "
                        >
                            {
                                savingDraft
                                    ? "Saving..."
                                    : "Save Draft"
                            }
                        </button>


                        <button
                            type="button"
                            onClick={
                                handleSend
                            }
                            disabled={
                                sending ||
                                savingDraft
                            }
                            className="
                                rounded-lg
                                bg-gray-900
                                px-5
                                py-2
                                text-sm
                                font-medium
                                text-white
                                hover:bg-gray-800
                                disabled:opacity-50
                            "
                        >
                            {
                                sending
                                    ? "Sending..."
                                    : "Send"
                            }
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};


/* =========================================================
   RECIPIENT DROPDOWN
========================================================= */

const RecipientDropdown = ({
    loading,
    employees,
    onSelect
}) => {

    if (loading) {

        return (

            <div
                className="
                    mt-1
                    rounded-lg
                    border
                    bg-white
                    p-3
                    text-sm
                    text-gray-500
                    shadow-lg
                "
            >
                Searching employees...
            </div>

        );
    }


    if (!employees.length) {

        return (

            <div
                className="
                    mt-1
                    rounded-lg
                    border
                    bg-white
                    p-3
                    text-sm
                    text-gray-500
                    shadow-lg
                "
            >
                No employees found.
            </div>

        );
    }


    return (

        <div
            className="
                mt-1
                max-h-56
                overflow-y-auto
                rounded-lg
                border
                bg-white
                shadow-lg
            "
        >

            {employees.map(
                (employee) => (

                    <button
                        key={
                            employee._id ||
                            employee.id
                        }
                        type="button"
                        onClick={() =>
                            onSelect(
                                employee
                            )
                        }
                        className="
                            flex
                            w-full
                            items-center
                            gap-3
                            px-4
                            py-3
                            text-left
                            hover:bg-gray-50
                        "
                    >

                        {/* AVATAR */}

                        <div
                            className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-gray-200
                                text-sm
                                font-semibold
                            "
                        >
                            {(
                                employee.name ||
                                employee.email ||
                                "U"
                            )
                                .charAt(0)
                                .toUpperCase()}
                        </div>


                        {/* EMPLOYEE INFO */}

                        <div
                            className="
                                min-w-0
                            "
                        >

                            <p
                                className="
                                    truncate
                                    text-sm
                                    font-medium
                                    text-gray-900
                                "
                            >
                                {
                                    employee.name ||
                                    employee.email
                                }
                            </p>

                            <p
                                className="
                                    truncate
                                    text-xs
                                    text-gray-500
                                "
                            >
                                {
                                    employee.email
                                }
                            </p>

                        </div>

                    </button>

                )
            )}

        </div>

    );
};


/* =========================================================
   CC / BCC FIELD
========================================================= */

const RecipientField = ({
    label,
    recipients,
    search,
    employees,
    loading,
    onFocus,
    onSearch,
    onSelect,
    onRemove,
    getId,
    getName,
    getEmail
}) => {

    return (

        <div className="mb-3">

            <div
                className="
                    flex
                    flex-wrap
                    items-center
                    gap-2
                    rounded-lg
                    border
                    px-3
                    py-2
                "
            >

                <span
                    className="
                        text-sm
                        font-medium
                        text-gray-600
                    "
                >
                    {label}:
                </span>


                {/* SELECTED */}

                {recipients.map(
                    (employee) => (

                        <div
                            key={
                                getId(
                                    employee
                                )
                            }
                            className="
                                flex
                                items-center
                                gap-1
                                rounded-full
                                bg-gray-100
                                px-3
                                py-1
                                text-sm
                            "
                        >

                            <div className="flex min-w-0 flex-col leading-tight">
                                <span className="max-w-[220px] truncate text-xs font-semibold text-gray-900">
                                    {getName(employee)}
                                </span>
                                <span className="max-w-[220px] truncate text-[10px] text-gray-500">
                                    {getEmail ? getEmail(employee) : employee?.email || ""}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    onRemove(
                                        employee
                                    )
                                }
                                className="
                                    text-gray-500
                                    hover:text-red-500
                                "
                            >
                                ×
                            </button>

                        </div>

                    )
                )}


                {/* SEARCH */}

                <input
                    value={search}
                    onFocus={onFocus}
                    onChange={(event) =>
                        onSearch(
                            event.target.value
                        )
                    }
                    placeholder={
                        `Search ${label} recipient...`
                    }
                    className="
                        min-w-[180px]
                        flex-1
                        border-0
                        outline-none
                        text-sm
                    "
                />

            </div>


            {/* SEARCH RESULTS ONLY */}

            {search.trim() && (

                <RecipientDropdown
                    loading={loading}
                    employees={employees}
                    onSelect={onSelect}
                />

            )}

        </div>
    );
};


export default ComposeModal;