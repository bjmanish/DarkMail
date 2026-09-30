import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";


const MainLayout = () => {

    const [
        sidebarOpen,
        setSidebarOpen
    ] = useState(false);


    return (

        <div
            className="
                flex
                h-screen
                overflow-hidden
                bg-gray-100
            "
        >

            {/* DESKTOP SIDEBAR */}

            <div className="hidden lg:block">

                <Sidebar />

            </div>


            {/* MOBILE SIDEBAR */}

            {sidebarOpen && (

                <>

                    <div
                        className="
                            fixed
                            inset-0
                            z-40
                            bg-black/50
                            lg:hidden
                        "
                        onClick={() =>
                            setSidebarOpen(false)
                        }
                    />

                    <div
                        className="
                            fixed
                            inset-y-0
                            left-0
                            z-50
                            lg:hidden
                        "
                    >

                        <Sidebar
                            mobile
                            onClose={() =>
                                setSidebarOpen(false)
                            }
                        />

                    </div>

                </>

            )}


            {/* MAIN */}

            <div
                className="
                    flex
                    min-w-0
                    flex-1
                    flex-col
                "
            >

                <Topbar
                    onMenuClick={() =>
                        setSidebarOpen(true)
                    }
                />

                <main
                    className="
                        min-h-0
                        flex-1
                        overflow-auto
                    "
                >
                    <Outlet />
                </main>

            </div>

        </div>

    );
};


export default MainLayout;