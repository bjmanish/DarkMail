import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import {
    X,
    Paperclip,
    Send,
    Save,
    Loader2,
    Search,
    UserPlus,
    Trash2,
    FileText,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";

import {
    saveDraftApi,
    sendMessageApi,
    searchRecipientsApi,
    getDraftsApi,
} from "../../api/messageApi";

import {
    useAuth,
} from "../../context/AuthContext";


/* =========================================================
   COMPOSE MODAL
========================================================= */

const ComposeModal = ({
    open = true,
    onClose,
    onSent,
    draft = null,
}) => {

    /* =====================================================
       AUTH
    ===================================================== */

    const {
        user,
    } = useAuth();


    /* =====================================================
       ROUTER
    ===================================================== */

    const navigate =
        useNavigate();


    const [
        searchParams,
    ] = useSearchParams();


    const draftId =
        searchParams.get(
            "draftId"
        );


    const isEditingDraft =
        Boolean(draftId);


    /* =====================================================
       STATE
    ===================================================== */

    const [
        loadingDraft,
        setLoadingDraft,
    ] = useState(false);


    const [
        loadedDraft,
        setLoadedDraft,
    ] = useState(draft);


    const [
        employees,
        setEmployees,
    ] = useState([]);


    const [
        loadingEmployees,
        setLoadingEmployees,
    ] = useState(false);


    const [
        sending,
        setSending,
    ] = useState(false);


    const [
        savingDraft,
        setSavingDraft,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    const [
        success,
        setSuccess,
    ] = useState("");


    const [
        subject,
        setSubject,
    ] = useState("");


    const [
        body,
        setBody,
    ] = useState("");


    const [
        to,
        setTo,
    ] = useState([]);


    const [
        cc,
        setCc,
    ] = useState([]);


    const [
        bcc,
        setBcc,
    ] = useState([]);


    const [
        showCc,
        setShowCc,
    ] = useState(false);


    const [
        showBcc,
        setShowBcc,
    ] = useState(false);


    const [
        attachments,
        setAttachments,
    ] = useState([]);


    const [
        recipientSearch,
        setRecipientSearch,
    ] = useState("");


    const [
        recipientMode,
        setRecipientMode,
    ] = useState("to");


    /* =====================================================
       RESET FORM
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

        setLoadedDraft(null);
    };


    /* =====================================================
       CLOSE DESTINATION
       
       Draft edit -> Drafts
       New message -> Inbox
    ===================================================== */

    const getClosePath = () => {

        if (isEditingDraft) {

            return (
                "/user/mail?Folder=drafts"
            );
        }

        return (
            "/user/mail?Folder=inbox"
        );
    };


    /* =====================================================
       CLOSE
    ===================================================== */

    const handleClose = () => {

        if (
            sending ||
            savingDraft ||
            loadingDraft
        ) {
            return;
        }


        resetForm();


        if (onClose) {

            onClose();

            return;
        }


        navigate(
            getClosePath()
        );
    };


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    useEffect(() => {

        if (!open) {
            return;
        }


        const handleKeyDown = (
            event
        ) => {

            if (
                event.key ===
                "Escape"
            ) {

                handleClose();
            }
        };


        document.addEventListener(
            "keydown",
            handleKeyDown
        );


        return () => {

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };

    }, [
        open,
        sending,
        savingDraft,
        loadingDraft,
        isEditingDraft,
    ]);


    /* =====================================================
       LOAD DRAFT
       
       IMPORTANT:
       
       When URL contains:
       
       /user/compose?draftId=XXXX
       
       fetch drafts and locate that draft.
    ===================================================== */

    useEffect(() => {

        let cancelled =
            false;


        const loadDraft = async () => {

            /* ---------------------------------------------
               NOT EDITING
            --------------------------------------------- */

            if (!draftId) {

                setLoadedDraft(
                    draft || null
                );

                return;
            }


            /* ---------------------------------------------
               DRAFT ALREADY PROVIDED
            --------------------------------------------- */

            if (draft) {

                setLoadedDraft(
                    draft
                );

                return;
            }


            /* ---------------------------------------------
               LOAD FROM API
            --------------------------------------------- */

            try {

                setLoadingDraft(
                    true
                );

                setError("");


                const response =
                    await getDraftsApi();


                if (cancelled) {
                    return;
                }


                const draftList =
                    response?.data ||
                    response?.messages ||
                    response?.drafts ||
                    [];


                const foundDraft =
                    Array.isArray(
                        draftList
                    )
                        ? draftList.find(
                            (item) =>
                                String(
                                    item?._id ||
                                    item?.id
                                ) ===
                                String(
                                    draftId
                                )
                        )
                        : null;


                if (!foundDraft) {

                    setError(
                        "Draft not found or it may have been deleted."
                    );

                    setLoadedDraft(
                        null
                    );

                    return;
                }


                setLoadedDraft(
                    foundDraft
                );

            } catch (err) {

                console.error(
                    "Load draft error:",
                    err
                );


                if (!cancelled) {

                    setError(
                        err?.response?.data?.message ||
                        err?.message ||
                        "Unable to load draft."
                    );
                }

            } finally {

                if (!cancelled) {

                    setLoadingDraft(
                        false
                    );
                }
            }
        };


        loadDraft();


        return () => {

            cancelled = true;
        };

    }, [
        draftId,
        draft,
    ]);


    /* =====================================================
       LOAD DRAFT INTO FORM
    ===================================================== */

    useEffect(() => {

        if (!open) {
            return;
        }


        /* ---------------------------------------------
           WAIT FOR DRAFT
        --------------------------------------------- */

        if (
            isEditingDraft &&
            loadingDraft
        ) {
            return;
        }


        /* ---------------------------------------------
           NO DRAFT
        --------------------------------------------- */

        if (!loadedDraft) {

            if (!isEditingDraft) {

                resetForm();
            }

            return;
        }


        /* ---------------------------------------------
           SUBJECT
        --------------------------------------------- */

        setSubject(
            loadedDraft.subject ||
            ""
        );


        /* ---------------------------------------------
           BODY
        --------------------------------------------- */

        setBody(
            loadedDraft.body ||
            ""
        );


        /* ---------------------------------------------
           TO
        --------------------------------------------- */

        setTo(
            Array.isArray(
                loadedDraft.to
            )
                ? loadedDraft.to
                : []
        );


        /* ---------------------------------------------
           CC
        --------------------------------------------- */

        setCc(
            Array.isArray(
                loadedDraft.cc
            )
                ? loadedDraft.cc
                : []
        );


        /* ---------------------------------------------
           BCC
        --------------------------------------------- */

        setBcc(
            Array.isArray(
                loadedDraft.bcc
            )
                ? loadedDraft.bcc
                : []
        );


        /* ---------------------------------------------
           CC / BCC VISIBILITY
        --------------------------------------------- */

        setShowCc(
            Boolean(
                loadedDraft.cc?.length
            )
        );


        setShowBcc(
            Boolean(
                loadedDraft.bcc?.length
            )
        );


        /* ---------------------------------------------
           EXISTING ATTACHMENTS
           
           Keep them for display.
        --------------------------------------------- */

        setAttachments(
            Array.isArray(
                loadedDraft.attachments
            )
                ? loadedDraft.attachments
                : []
        );


        setRecipientSearch("");

        setRecipientMode("to");


    }, [
        open,
        loadedDraft,
        isEditingDraft,
        loadingDraft,
    ]);


    /* =====================================================
       LOAD EMPLOYEES
    ===================================================== */

    useEffect(() => {

        const search =
            recipientSearch.trim();


        if (!open) {
            return;
        }


        if (!search) {

            setEmployees([]);

            return;
        }


        let cancelled =
            false;


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


                        if (cancelled) {
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
                                (
                                    employee
                                ) => {

                                    const employeeId =
                                        String(
                                            employee?._id ||
                                            employee?.id ||
                                            ""
                                        );


                                    return (
                                        employee?.isActive !== false &&
                                        employeeId !==
                                            currentUserId
                                    );
                                }
                            );


                        setEmployees(
                            filtered
                        );

                    } catch (err) {

                        if (
                            cancelled
                        ) {
                            return;
                        }


                        console.error(
                            "Recipient search error:",
                            err
                        );


                        setEmployees([]);

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
        user?.id,
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
            employee?.emailAddress ||
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
            employee?.fullName ||
            employee?.employeeName ||
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
            bcc,
        ]);


    /* =====================================================
       FILTER EMPLOYEES
    ===================================================== */

    const filteredEmployees =
        useMemo(() => {

            const search =
                recipientSearch
                    .trim()
                    .toLowerCase();


            if (!search) {

                return [];
            }


            return employees.filter(
                (
                    employee
                ) => {

                    const id =
                        getEmployeeId(
                            employee
                        );


                    const alreadySelected =
                        currentRecipients.some(
                            (
                                selected
                            ) =>
                                getEmployeeId(
                                    selected
                                ) === id
                        );


                    if (
                        alreadySelected
                    ) {

                        return false;
                    }


                    return (
                        employee?.name
                            ?.toLowerCase()
                            .includes(search)

                        ||

                        employee?.email
                            ?.toLowerCase()
                            .includes(search)

                        ||

                        employee?.employeeId
                            ?.toLowerCase()
                            .includes(search)
                    );
                }
            );

        }, [
            employees,
            recipientSearch,
            currentRecipients,
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
                        employee,
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
                        employee,
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
                        employee,
                    ];
                }
            );
        }


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

    const getRecipientEmails = (
        list
    ) => {

        return list
            .map(
                (
                    employee
                ) =>
                    getEmployeeEmail(
                        employee
                    )
            )
            .filter(Boolean);
    };


    /* =====================================================
       ATTACHMENTS
    ===================================================== */

    const handleAttachmentChange = (
        event
    ) => {

        const files =
            Array.from(
                event.target.files ||
                []
            );


        setAttachments(
            (previous) => [
                ...previous,
                ...files,
            ]
        );


        event.target.value = "";
    };


    const removeAttachment = (
        index
    ) => {

        setAttachments(
            (previous) =>
                previous.filter(
                    (
                        _,
                        fileIndex
                    ) =>
                        fileIndex !==
                        index
                )
        );
    };


    /* =====================================================
       ATTACHMENT HELPERS
    ===================================================== */

    const isFileObject = (
        file
    ) => {

        return (
            file instanceof File
        );
    };


    const getAttachmentName = (
        file,
        index
    ) => {

        return (
            file?.name ||
            file?.filename ||
            file?.originalname ||
            `Attachment ${index + 1}`
        );
    };


    const getAttachmentSize = (
        file
    ) => {

        const size =
            Number(
                file?.size ||
                file?.fileSize ||
                0
            );


        if (!size) {
            return "";
        }


        if (
            size <
            1024
        ) {

            return `${size} B`;
        }


        if (
            size <
            1024 * 1024
        ) {

            return `${(
                size / 1024
            ).toFixed(1)} KB`;
        }


        return `${(
            size /
            (1024 * 1024)
        ).toFixed(1)} MB`;
    };


    /* =====================================================
       VALIDATION
    ===================================================== */

    const validate = () => {

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

    const handleSend = async () => {

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


            toEmails.forEach(
                (
                    email
                ) =>
                    formData.append(
                        "to",
                        email
                    )
            );


            ccEmails.forEach(
                (
                    email
                ) =>
                    formData.append(
                        "cc",
                        email
                    )
            );


            bccEmails.forEach(
                (
                    email
                ) =>
                    formData.append(
                        "bcc",
                        email
                    )
            );


            /*
             * Only append actual File objects.
             *
             * Existing draft attachment objects
             * should not be appended as files again.
             */

            attachments
                .filter(
                    isFileObject
                )
                .forEach(
                    (
                        file
                    ) =>
                        formData.append(
                            "attachments",
                            file
                        )
                );


            /*
             * If editing a draft,
             * send the draft ID so the backend
             * can update/delete the old draft
             * if your API supports it.
             */

            if (isEditingDraft) {

                formData.append(
                    "draftId",
                    draftId
                );

                formData.append(
                    "messageId",
                    draftId
                );
            }


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
                isEditingDraft
                    ? "Draft sent successfully."
                    : "Message sent successfully."
            );


            if (onSent) {

                onSent(
                    response
                );
            }


            setTimeout(
                () => {

                    resetForm();


                    if (onClose) {

                        onClose();

                    } else {

                        navigate(
                            "/user/mail?Folder=inbox"
                        );
                    }

                },
                700
            );


        } catch (err) {

            console.error(
                "Send message error:",
                err
            );


            setError(
                err?.response?.data?.message ||
                err?.message ||
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

                setSavingDraft(
                    true
                );

                setError("");

                setSuccess("");


                const data = {

                    /*
                     * Existing draft ID
                     */

                    messageId:
                        draftId ||
                        loadedDraft?._id ||
                        loadedDraft?.id ||
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
                        ),
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
                    isEditingDraft
                        ? "Draft updated successfully."
                        : "Draft saved successfully."
                );


                setTimeout(
                    () => {

                        resetForm();


                        if (onClose) {

                            onClose();

                        } else {

                            navigate(
                                "/user/mail?Folder=drafts"
                            );
                        }

                    },
                    700
                );


            } catch (err) {

                console.error(
                    "Save draft error:",
                    err
                );


                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to save draft."
                );

            } finally {

                setSavingDraft(
                    false
                );
            }
        };


    /* =====================================================
       DON'T RENDER
    ===================================================== */

    if (!open) {
        return null;
    }


    /* =====================================================
       LOADING DRAFT
    ===================================================== */

    if (
        isEditingDraft &&
        loadingDraft
    ) {

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
                    px-4
                "
            >

                <div
                    className="
                        flex
                        w-full
                        max-w-md
                        flex-col
                        items-center
                        justify-center
                        rounded-2xl
                        bg-white
                        p-8
                        shadow-2xl
                    "
                >

                    <Loader2
                        size={32}
                        className="
                            animate-spin
                            text-indigo-600
                        "
                    />

                    <p
                        className="
                            mt-4
                            text-sm
                            font-medium
                            text-gray-700
                        "
                    >
                        Loading draft...
                    </p>

                </div>

            </div>
        );
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
                px-4
                py-4
            "
            onMouseDown={(event) => {

                /*
                 * Clicking the dark background closes
                 * the compose window.
                 */

                if (
                    event.target ===
                    event.currentTarget
                ) {

                    handleClose();
                }
            }}
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
                onMouseDown={(event) => {

                    /*
                     * Prevent click inside modal
                     * from closing it.
                     */

                    event.stopPropagation();
                }}
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    className="
                        flex
                        shrink-0
                        items-center
                        justify-between
                        border-b
                        border-gray-200
                        px-5
                        py-4
                    "
                >

                    <div
                        className="
                            min-w-0
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >

                            <h2
                                className="
                                    text-lg
                                    font-semibold
                                    text-gray-900
                                "
                            >
                                {isEditingDraft
                                    ? "Edit Draft"
                                    : "New Message"}
                            </h2>


                            {isEditingDraft && (
                                <span
                                    className="
                                        rounded-full
                                        bg-yellow-100
                                        px-2
                                        py-0.5
                                        text-[10px]
                                        font-semibold
                                        text-yellow-700
                                    "
                                >
                                    DRAFT
                                </span>
                            )}

                        </div>


                        <p
                            className="
                                mt-0.5
                                text-xs
                                text-gray-500
                            "
                        >
                            Send a message to a DarkMail employee
                        </p>

                    </div>


                    {/* CLOSE */}

                    <button
                        type="button"
                        onClick={
                            handleClose
                        }
                        disabled={
                            sending ||
                            savingDraft ||
                            loadingDraft
                        }
                        className="
                            rounded-lg
                            p-2
                            text-gray-500
                            transition
                            hover:bg-gray-100
                            hover:text-gray-800
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                        title="Close"
                        aria-label="Close compose"
                    >
                        <X
                            size={21}
                        />
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

                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (
                        <div
                            className="
                                mb-4
                                flex
                                items-start
                                gap-2
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

                            <AlertCircle
                                size={18}
                                className="
                                    mt-0.5
                                    shrink-0
                                "
                            />

                            <span>
                                {error}
                            </span>

                        </div>
                    )}


                    {/* =================================================
                        SUCCESS
                    ================================================= */}

                    {success && (
                        <div
                            className="
                                mb-4
                                flex
                                items-start
                                gap-2
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

                            <CheckCircle2
                                size={18}
                                className="
                                    mt-0.5
                                    shrink-0
                                "
                            />

                            <span>
                                {success}
                            </span>

                        </div>
                    )}


                    {/* =================================================
                        TO
                    ================================================= */}

                    <div
                        className="
                            mb-3
                        "
                    >

                        <div
                            className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                                rounded-lg
                                border
                                border-gray-200
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
                                (
                                    employee
                                ) => (

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

                                        <div
                                            className="
                                                flex
                                                min-w-0
                                                flex-col
                                                leading-tight
                                            "
                                        >

                                            <span
                                                className="
                                                    max-w-[220px]
                                                    truncate
                                                    text-xs
                                                    font-semibold
                                                    text-gray-900
                                                "
                                            >
                                                {
                                                    getEmployeeName(
                                                        employee
                                                    )
                                                }
                                            </span>

                                            <span
                                                className="
                                                    max-w-[220px]
                                                    truncate
                                                    text-[10px]
                                                    text-gray-500
                                                "
                                            >
                                                {
                                                    getEmployeeEmail(
                                                        employee
                                                    )
                                                }
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
                                                ml-1
                                                rounded-full
                                                p-0.5
                                                text-gray-500
                                                hover:bg-gray-200
                                                hover:text-red-500
                                            "
                                            title="Remove recipient"
                                        >
                                            <X
                                                size={13}
                                            />
                                        </button>

                                    </div>
                                )
                            )}


                            {/* SEARCH */}

                            <div
                                className="
                                    flex
                                    min-w-[180px]
                                    flex-1
                                    items-center
                                    gap-2
                                "
                            >

                                <Search
                                    size={15}
                                    className="
                                        shrink-0
                                        text-gray-400
                                    "
                                />

                                <input
                                    value={
                                        recipientMode ===
                                        "to"
                                            ? recipientSearch
                                            : ""
                                    }
                                    onFocus={() => {

                                        setRecipientMode(
                                            "to"
                                        );

                                    }}
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
                                        min-w-0
                                        flex-1
                                        border-0
                                        bg-transparent
                                        py-1
                                        text-sm
                                        outline-none
                                    "
                                />

                            </div>

                        </div>


                        {/* TO SEARCH */}

                        {recipientMode ===
                            "to" &&
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
                            {showCc
                                ? "Hide CC"
                                : "Add CC"}
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
                            {showBcc
                                ? "Hide BCC"
                                : "Add BCC"}
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
                                recipientMode ===
                                "cc"
                                    ? recipientSearch
                                    : ""
                            }
                            employees={
                                recipientMode ===
                                "cc"
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
                            onRemove={(
                                employee
                            ) =>
                                removeRecipient(
                                    employee,
                                    "cc"
                                )
                            }
                            getId={
                                getEmployeeId
                            }
                            getName={
                                getEmployeeName
                            }
                            getEmail={
                                getEmployeeEmail
                            }
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
                                recipientMode ===
                                "bcc"
                                    ? recipientSearch
                                    : ""
                            }
                            employees={
                                recipientMode ===
                                "bcc"
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
                            onRemove={(
                                employee
                            ) =>
                                removeRecipient(
                                    employee,
                                    "bcc"
                                )
                            }
                            getId={
                                getEmployeeId
                            }
                            getName={
                                getEmployeeName
                            }
                            getEmail={
                                getEmployeeEmail
                            }
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
                            border-gray-200
                            px-1
                            py-3
                            text-base
                            outline-none
                            placeholder:text-gray-400
                            focus:border-indigo-500
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
                            border-gray-200
                            p-4
                            text-sm
                            outline-none
                            placeholder:text-gray-400
                            focus:border-indigo-500
                            focus:ring-2
                            focus:ring-indigo-100
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
                                (
                                    file,
                                    index
                                ) => (

                                    <div
                                        key={`${getAttachmentName(
                                            file,
                                            index
                                        )}-${index}`}
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            gap-3
                                            rounded-lg
                                            bg-gray-50
                                            px-3
                                            py-2
                                            text-sm
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
                                                    h-9
                                                    w-9
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-lg
                                                    bg-indigo-50
                                                    text-indigo-600
                                                "
                                            >
                                                <FileText
                                                    size={17}
                                                />
                                            </div>


                                            <div
                                                className="
                                                    min-w-0
                                                "
                                            >

                                                <p
                                                    className="
                                                        truncate
                                                        font-medium
                                                        text-gray-800
                                                    "
                                                    title={
                                                        getAttachmentName(
                                                            file,
                                                            index
                                                        )
                                                    }
                                                >
                                                    {
                                                        getAttachmentName(
                                                            file,
                                                            index
                                                        )
                                                    }
                                                </p>


                                                <p
                                                    className="
                                                        text-xs
                                                        text-gray-500
                                                    "
                                                >
                                                    {
                                                        getAttachmentSize(
                                                            file
                                                        ) ||
                                                        "Attachment"
                                                    }
                                                </p>

                                            </div>

                                        </div>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeAttachment(
                                                    index
                                                )
                                            }
                                            className="
                                                shrink-0
                                                rounded-lg
                                                p-1.5
                                                text-gray-400
                                                hover:bg-red-50
                                                hover:text-red-500
                                            "
                                            title="Remove attachment"
                                        >
                                            <Trash2
                                                size={16}
                                            />
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
                        shrink-0
                        flex-wrap
                        items-center
                        justify-between
                        gap-3
                        border-t
                        border-gray-200
                        px-5
                        py-4
                    "
                >

                    {/* ATTACH */}

                    <label
                        className="
                            inline-flex
                            cursor-pointer
                            items-center
                            gap-2
                            rounded-lg
                            border
                            border-gray-200
                            px-4
                            py-2
                            text-sm
                            text-gray-700
                            transition
                            hover:bg-gray-50
                        "
                    >

                        <Paperclip
                            size={16}
                        />

                        Attach

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
                            items-center
                            gap-2
                        "
                    >

                        {/* CLOSE */}

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
                                flex
                                items-center
                                gap-2
                                rounded-lg
                                border
                                border-gray-200
                                px-4
                                py-2
                                text-sm
                                text-gray-600
                                transition
                                hover:bg-gray-50
                                disabled:opacity-50
                            "
                        >
                            <X
                                size={15}
                            />

                            Close
                        </button>


                        {/* SAVE DRAFT */}

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
                                flex
                                items-center
                                gap-2
                                rounded-lg
                                border
                                border-gray-200
                                px-4
                                py-2
                                text-sm
                                text-gray-700
                                transition
                                hover:bg-gray-50
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            {savingDraft ? (
                                <Loader2
                                    size={15}
                                    className="animate-spin"
                                />
                            ) : (
                                <Save
                                    size={15}
                                />
                            )}

                            {savingDraft
                                ? "Saving..."
                                : isEditingDraft
                                    ? "Update Draft"
                                    : "Save Draft"}

                        </button>


                        {/* SEND */}

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
                                flex
                                items-center
                                gap-2
                                rounded-lg
                                bg-indigo-600
                                px-5
                                py-2
                                text-sm
                                font-medium
                                text-white
                                transition
                                hover:bg-indigo-700
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            {sending ? (
                                <Loader2
                                    size={15}
                                    className="animate-spin"
                                />
                            ) : (
                                <Send
                                    size={15}
                                />
                            )}

                            {sending
                                ? "Sending..."
                                : isEditingDraft
                                    ? "Send"
                                    : "Send"}

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
    onSelect,
}) => {

    if (loading) {

        return (
            <div
                className="
                    mt-1
                    rounded-lg
                    border
                    border-gray-200
                    bg-white
                    p-3
                    text-sm
                    text-gray-500
                    shadow-lg
                "
            >
                <div
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >
                    <Loader2
                        size={15}
                        className="animate-spin"
                    />

                    Searching employees...
                </div>
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
                    border-gray-200
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
                border-gray-200
                bg-white
                shadow-lg
            "
        >

            {employees.map(
                (
                    employee
                ) => (

                    <button
                        key={
                            employee?._id ||
                            employee?.id
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
                            transition
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
                                bg-indigo-100
                                text-sm
                                font-semibold
                                text-indigo-700
                            "
                        >
                            {(
                                employee?.name ||
                                employee?.email ||
                                "U"
                            )
                                .charAt(0)
                                .toUpperCase()}
                        </div>


                        {/* EMPLOYEE */}

                        <div
                            className="
                                min-w-0
                                flex-1
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
                                    employee?.name ||
                                    employee?.email
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
                                    employee?.email
                                }
                            </p>

                        </div>


                        <UserPlus
                            size={16}
                            className="
                                shrink-0
                                text-gray-400
                            "
                        />

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
    getEmail,
}) => {

    return (

        <div
            className="
                mb-3
            "
        >

            <div
                className="
                    flex
                    flex-wrap
                    items-center
                    gap-2
                    rounded-lg
                    border
                    border-gray-200
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
                    (
                        employee
                    ) => (

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

                            <div
                                className="
                                    flex
                                    min-w-0
                                    flex-col
                                    leading-tight
                                "
                            >

                                <span
                                    className="
                                        max-w-[220px]
                                        truncate
                                        text-xs
                                        font-semibold
                                        text-gray-900
                                    "
                                >
                                    {
                                        getName(
                                            employee
                                        )
                                    }
                                </span>


                                <span
                                    className="
                                        max-w-[220px]
                                        truncate
                                        text-[10px]
                                        text-gray-500
                                    "
                                >
                                    {
                                        getEmail(
                                            employee
                                        )
                                    }
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
                                    ml-1
                                    rounded-full
                                    p-0.5
                                    text-gray-500
                                    hover:bg-gray-200
                                    hover:text-red-500
                                "
                                title={`Remove from ${label}`}
                            >
                                <X
                                    size={13}
                                />
                            </button>

                        </div>
                    )
                )}


                {/* SEARCH */}

                <div
                    className="
                        flex
                        min-w-[180px]
                        flex-1
                        items-center
                        gap-2
                    "
                >

                    <Search
                        size={15}
                        className="
                            shrink-0
                            text-gray-400
                        "
                    />

                    <input
                        value={search}
                        onFocus={
                            onFocus
                        }
                        onChange={(
                            event
                        ) =>
                            onSearch(
                                event.target.value
                            )
                        }
                        placeholder={
                            `Search ${label} recipient...`
                        }
                        className="
                            min-w-0
                            flex-1
                            border-0
                            bg-transparent
                            py-1
                            text-sm
                            outline-none
                        "
                    />

                </div>

            </div>


            {/* SEARCH RESULTS */}

            {search.trim() && (

                <RecipientDropdown
                    loading={
                        loading
                    }
                    employees={
                        employees
                    }
                    onSelect={
                        onSelect
                    }
                />
            )}

        </div>
    );
};


export default ComposeModal;