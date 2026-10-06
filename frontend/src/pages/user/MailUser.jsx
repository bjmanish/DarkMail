import React from "react";

import {
    useSearchParams,
} from "react-router-dom";



const MailUser = () => {

    const [searchParams] =
        useSearchParams();

    const folder =
        (
            searchParams.get("Folder") ||
            searchParams.get("folder") ||
            "inbox"
        ).toLowerCase();

    /* =========================================================
       FOLDER
    ========================================================== */

    switch (folder) {

        case "inbox":

            return <Inbox />;

        case "sent":

            return <Sent />;

        case "drafts":

            return <Drafts />;

        case "trash":

            return <Trash />;

        default:

            return <Inbox />;
    }
};

export default MailUser;