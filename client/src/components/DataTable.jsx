import React, { useState } from "react";

export default function DataTable({
    data = [],
    columns = [],
    actions = [],
    enableCheckbox = false,
    onSelectionChange = () => {},
}) {
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const handleSelectAll = (checked) => {
        setSelectAll(checked);

        if (checked) {
            const allIds = data.map((row) => row.id || row.todo_id || row.user_id);
            setSelectedRows(allIds);
            onSelectionChange(allIds);
        } else {
            setSelectedRows([]);
            onSelectionChange([]);
        }
    };

    const handleRowSelect = (checked, rowId) => {
        let updated;

        if (checked) {
            updated = [...selectedRows, rowId];
        } else {
            updated = selectedRows.filter((id) => id !== rowId);
            setSelectAll(false);
        }

        setSelectedRows(updated);
        onSelectionChange(updated);
    };

    return (
        <table className="table table-bordered text-center mt-3">
            <thead>
                <tr>
                    {enableCheckbox && (
                        <th>
                            <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                            />
                        </th>
                    )}

                    {columns.map((col) => (
                        <th key={col.key}>{col.label}</th>
                    ))}

                    {actions.length > 0 && <th>Actions</th>}
                </tr>
            </thead>

            <tbody>
                {data.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length + (enableCheckbox ? 1 : 0) + 1}>
                            No records found.
                        </td>
                    </tr>
                ) : (
                    data.map((row) => {
                        const rowId = row.id || row.todo_id || row.user_id;

                        return (
                            <tr key={rowId}>
                                {enableCheckbox && (
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(rowId)}
                                            onChange={(e) =>
                                                handleRowSelect(e.target.checked, rowId)
                                            }
                                        />
                                    </td>
                                )}

                                {columns.map((col) => (
                                    <td key={col.key}>
                                        {col.format
                                            ? col.format(row[col.key], row)
                                            : row[col.key]}
                                    </td>
                                ))}

                                {actions.length > 0 && (
                                    <td>
                                        {actions.map((action, idx) => {
                                            const disabled =
                                                action.disabled?.(row) ?? false;

                                            return (
                                                <button
                                                    key={idx}
                                                    className={`btn btn-sm mx-1 ${action.className || "btn-primary"}`}
                                                    onClick={() => action.onClick(row)}
                                                    disabled={disabled}
                                                >
                                                    {action.label}
                                                </button>
                                            );
                                        })}
                                    </td>
                                )}
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>
    );
}
