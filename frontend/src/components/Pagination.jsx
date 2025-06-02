import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const [internalPage, setInternalPage] = React.useState(currentPage);

    React.useEffect(() => {
        setInternalPage(currentPage);
    }, [currentPage]);

    const handleClick = (page) => {
        if (page !== currentPage) {
            setInternalPage(page);
            onPageChange(page);
        }
    };

    const buttons = [];
    const isFirstHalf = internalPage <= Math.floor(totalPages / 2);

    const addPageButton = (page) => {
        buttons.push(
            <button
                key={page}
                onClick={() => handleClick(page)}
                className={`page-button ${internalPage === page ? 'active' : ''}`}
            >
                {page}
            </button>
        );
    };

    const addDots = (key) => {
        buttons.push(<span key={key} className="dots">...</span>);
    };

    buttons.push(
        <button
            key="prev"
            onClick={() => handleClick(currentPage - 1)}
            disabled={currentPage === 1}
            className="page-button nav"
        >
            &lt;
        </button>
    );

    if (totalPages <= 3) {
        for (let i = 1; i <= totalPages; i++) addPageButton(i);
    } else if (isFirstHalf) {
        addPageButton(currentPage);
        if (currentPage + 1 < totalPages) addPageButton(currentPage + 1);
        if (currentPage + 1 < totalPages - 1) addDots('dots-end');
        if (currentPage + 1 < totalPages) addPageButton(totalPages);
    } else {
        addPageButton(1);
        if (currentPage - 1 > 2) addDots('dots-start');
        addPageButton(currentPage);
        if (currentPage + 1 <= totalPages) addPageButton(currentPage + 1);
    }

    buttons.push(
        <button
            key="next"
            onClick={() => handleClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="page-button nav"
        >
            &gt;
        </button>
    );

    return <div className="pagination">{buttons}</div>;
};

export default Pagination;