import React from "react";

export default function DataTable({
    data = [],
    columns = [],
    actions = [],
    enableCheckbox = false,
    selectedRows = [],
    onSelectionChange = () => { },
}) {

    const handleSelectAll = (checked) => {
        const currentPageIds = data.map(r => r.todo_id || r.user_id);

        if (checked) {
            const merged = Array.from(new Set([...selectedRows, ...currentPageIds]));
            onSelectionChange(merged);
        } else {
            const remaining = selectedRows.filter(id => !currentPageIds.includes(id));
            onSelectionChange(remaining);
        }
    };

    const handleRowSelect = (checked, rowId) => {
        let updated;

        if (checked) {
            updated = [...selectedRows, rowId];
        } else {
            updated = selectedRows.filter((id) => id !== rowId);
        }

        onSelectionChange(updated);
    };

    const currentPageIds = data.map(r => r.todo_id || r.user_id);
    const allSelectedThisPage = currentPageIds.every(id => selectedRows.includes(id));

    return (
        <table className="table table-bordered text-center mt-3">
            <thead>
                <tr>
                    {enableCheckbox && (
                        <th>
                            <input
                                type="checkbox"
                                checked={allSelectedThisPage}
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
                                            const disabled = action.disabled?.(row) ?? false;
                                            if (action.customElement == "button") {
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
                                            }

                                            else if (action.customElement === "checkbox") {
                                                return (
                                                    <input
                                                        key={idx}
                                                        type="checkbox"
                                                        className="form-check-input mx-2"
                                                        disabled={disabled}
                                                        checked={action.checked?.(row) ?? false}
                                                        onChange={(e) => action.onClick(row, e.target.checked)}
                                                    />
                                                );
                                            }
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
