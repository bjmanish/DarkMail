import {
    useSearchParams
} from "react-router-dom";

const MailUser = () => {

    const [searchParams] = useSearchParams();

    const folder =
        searchParams
            .get("Folder")
            ?.toLowerCase() || "inbox";

    console.log("Current folder:", folder);

    return (
        <div>

            {folder === "inbox" && (
                <Inbox />
            )}

            {folder === "sent" && (
                <Sent />
            )}

            {folder === "drafts" && (
                <Drafts />
            )}

            {folder === "trash" && (
                <Trash />
            )}

        </div>
    );
};

export default MailUser;