import React from "react";
import {
    useSearchParams,
} from "react-router-dom";

import {
    Inbox,
    Sent,
    Drafts,
    Trash,
} from "../../pages/user/MailFolders";


const MailUser = () => {

    const [
        searchParams,
        setSearchParams
    ] = useSearchParams();


    const folder =
        (
            searchParams.get(
                "Folder"
            ) ||
            "inbox"
        ).toLowerCase();


    /* =====================================================
       CHANGE FOLDER
    ===================================================== */

    const changeFolder = (
        nextFolder
    ) => {

        setSearchParams({
            Folder: nextFolder,
        });

    };


    /* =====================================================
       RENDER FOLDER
    ===================================================== */

    switch (folder) {

        case "sent":

            return (
                <Sent
                    onChangeFolder={
                        changeFolder
                    }
                />
            );


        case "drafts":

            return (
                <Drafts
                    onChangeFolder={
                        changeFolder
                    }
                />
            );


        case "trash":

            return (
                <Trash
                    onChangeFolder={
                        changeFolder
                    }
                />
            );


        case "inbox":

        default:

            return (
                <Inbox
                    onChangeFolder={
                        changeFolder
                    }
                />
            );

    }

};


export default MailUser;