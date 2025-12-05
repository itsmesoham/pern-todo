import React from 'react'

const PageLayout = ({ user, handleLogout, title, children }) => {
    return (
        <div className="container">

            {/* TOP BAR */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h2>Welcome, {user.username}</h2>

                <button className="btn btn-danger" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            {/* Optional Page Title */}
            {title && <h1 className="text-center mt-2">{title}</h1>}

            {/* Page content goes here */}
            <div className="mt-3">
                {children}
            </div>
        </div>
    );
}

export default PageLayout