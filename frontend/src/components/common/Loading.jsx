const Loading = ({ text = "Loading..." }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>

                <p className="text-sm text-gray-600">
                    {text}
                </p>
            </div>
        </div>
    );
};

export default Loading;