import React, { Fragment } from 'react'

const Pagination = ({
    currentPage,
    totalPages,
    startPage,
    endPage,
    setCurrentPage
}) => {
    if (totalPages < 1) return null;
    return (
        <Fragment>
            <div className="d-flex justify-content-center mt-3">

                {/* FIRST */}
                <button
                    className="btn btn-secondary mx-1"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                >
                    First
                </button>

                {/* PREVIOUS */}
                <button
                    className="btn btn-secondary mx-1"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                    Previous
                </button>

                {/* PAGE NUMBERS */}
                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
                    .map((page) => (
                        <button
                            key={page}
                            className={`btn btn-sm mx-1 ${currentPage === page ? "btn-primary" : "btn-outline-primary"
                                }`}
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </button>
                    ))}

                {/* NEXT */}
                <button
                    className="btn btn-secondary mx-1"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                >
                    Next
                </button>

                {/* LAST */}
                <button
                    className="btn btn-secondary mx-1"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                >
                    Last
                </button>
            </div>
        </Fragment>
    );
}

export default Pagination