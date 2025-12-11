import React, { Fragment } from 'react'
import SearchBar from '../components/SearchBar';
import SortDropdown from '../components/SortDropdown';
import DataTable from '../components/DataTable';

const Permissions = () => {
    return (
        <Fragment>
            {/* Search Input */}
            <SearchBar
            
            />

            {/* Sorting Dropdown */}
            <SortDropdown 
            
            />

            {/* Permissions Table */}
            <DataTable 
            // data={}
            enableCheckbox={true}
            columns={[
                { key: "permissions" , label: "Permissions" },
                {
                    key: "isActive",
                    label: "Status",
                }
            ]}
            />
        </Fragment>
    );
}

export default Permissions