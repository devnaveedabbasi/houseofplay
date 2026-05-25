"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";

export default function DataTable({
  columns,
  data,
  selectedRows,
  onSelectionChange,
  sortConfig,
  onSortChange,
  filterConfig,
  onFilterChange,
  loading,
}) {
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);
  const filterRef = useRef(null);

  // Close filter popover on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setActiveFilterColumn(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectionChange(data.map((row) => row.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      onSelectionChange([...selectedRows, id]);
    } else {
      onSelectionChange(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const handleSortClick = (key) => {
    if (sortConfig.field === key) {
      onSortChange({ field: key, order: sortConfig.order === "asc" ? "desc" : "asc" });
    } else {
      onSortChange({ field: key, order: "asc" });
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              {/* Checkbox Column */}
              <th className="p-4 w-12 text-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-secondary-500 focus:ring-secondary-500 cursor-pointer"
                  checked={data.length > 0 && selectedRows.length === data.length}
                  onChange={handleSelectAll}
                />
              </th>

              {/* Dynamic Columns */}
              {columns.map((col) => (
                <th key={col.key} className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider relative group">
                  <div className="flex items-center gap-2">
                    <span 
                      className={`cursor-pointer hover:text-gray-800 transition-colors ${sortConfig.field === col.key ? 'text-gray-800' : ''}`}
                      onClick={() => handleSortClick(col.key)}
                    >
                      {col.label}
                    </span>
                    
                    {/* Sort Icon */}
                    <div className="flex flex-col opacity-50 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => handleSortClick(col.key)}>
                      <Icon 
                        icon="solar:alt-arrow-up-bold" 
                        className={`text-[10px] -mb-1 ${sortConfig.field === col.key && sortConfig.order === 'asc' ? 'text-secondary-500' : ''}`} 
                      />
                      <Icon 
                        icon="solar:alt-arrow-down-bold" 
                        className={`text-[10px] ${sortConfig.field === col.key && sortConfig.order === 'desc' ? 'text-secondary-500' : ''}`} 
                      />
                    </div>

                    {/* Filter Icon */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFilterColumn(activeFilterColumn === col.key ? null : col.key);
                      }}
                      className={`p-1 rounded-md hover:bg-gray-200 transition-colors ml-auto ${filterConfig[col.key] ? 'text-secondary-500 bg-secondary-50' : 'text-gray-400'}`}
                    >
                      <Icon icon="solar:filter-bold" className="text-sm" />
                    </button>
                  </div>

                  {/* Filter Popover */}
                  {activeFilterColumn === col.key && (
                    <div 
                      ref={filterRef}
                      className="absolute z-20 top-full left-4 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="mb-2 text-[11px] text-gray-400 normal-case">Filter {col.label}</div>
                      
                      {col.filterType === 'select' ? (
                        <select
                          className="w-full text-sm rounded-lg border border-gray-200 p-2 focus:ring-2 focus:ring-secondary-500 outline-none normal-case font-normal"
                          value={filterConfig[col.key] || ''}
                          onChange={(e) => onFilterChange(col.key, e.target.value)}
                        >
                          <option value="">All</option>
                          {col.filterOptions?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder={`Search ${col.label}...`}
                          className="w-full text-sm rounded-lg border border-gray-200 p-2 focus:ring-2 focus:ring-secondary-500 outline-none normal-case font-normal"
                          value={filterConfig[col.key] || ''}
                          onChange={(e) => onFilterChange(col.key, e.target.value)}
                        />
                      )}
                      
                      <div className="mt-3 flex justify-end gap-2">
                        <button 
                          className="text-xs text-gray-500 hover:text-gray-800"
                          onClick={() => {
                            onFilterChange(col.key, '');
                            setActiveFilterColumn(null);
                          }}
                        >
                          Clear
                        </button>
                        <button 
                          className="text-xs bg-secondary-500 text-white px-3 py-1.5 rounded-md hover:bg-secondary-600 font-medium"
                          onClick={() => setActiveFilterColumn(null)}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-8 text-center">
                  <div className="flex justify-center items-center gap-2 text-gray-400">
                    <Icon icon="solar:spinner-bold" className="animate-spin text-xl" />
                    <span className="text-sm font-medium">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Icon icon="solar:box-minimalistic-broken" className="text-4xl mb-2 text-gray-300" />
                    <span className="text-sm font-medium">No results found</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-secondary-500 focus:ring-secondary-500 cursor-pointer"
                      checked={selectedRows.includes(row.id)}
                      onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                    />
                  </td>
                  {columns.map((col) => (
                    <td key={col.key} className="p-4 text-sm text-gray-600">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
