import React from 'react'

const SearchBar = ({
    searchTerm,
    setSearchTerm,
    placeholder,
    width = "50%",
}) => {
    return (
        <div className="container mt-2 d-flex justify-content-center">
            <div className="input-group mb-2" style={{ width }}>
                <input
                    type="text"
                    className="form-control me-2"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {searchTerm && (
                    <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setSearchTerm("")}
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}

export default SearchBar