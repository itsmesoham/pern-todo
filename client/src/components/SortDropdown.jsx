import React, { Fragment } from 'react'

const SortDropdown = ({ sortOrder, setSortOrder, options }) => {
    return (
        <Fragment>
            <div className="container d-flex justify-content-center align-items-center mb-2">
                <div className="me-2 fw-bold">Sort:</div>

                <select
                    className="form-select form-select-sm me-2"
                    style={{ width: "auto" }}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setSortOrder("default")}
                >
                    Reset
                </button>
            </div>
        </Fragment>
    );
}

export default SortDropdown