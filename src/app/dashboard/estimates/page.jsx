"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchProducts, 
  fetchSuppliers,
  updateProductStatus,
  bulkUpdateProductStatus,
  deleteProduct
} from "@/store/productSlice";
import DataTable from "@/components/ui/DataTable";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

export default function EstimatesPage() {
  const dispatch = useDispatch();
  const { products, suppliers, pagination, loading } = useSelector((state) => state.product);

  const [selectedRows, setSelectedRows] = useState([]);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ field: 'createdAt', order: 'desc' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts({ page, limit: 10, filters, sort }));
  }, [dispatch, page, filters, sort]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
  };

  const handleBulkApprove = async () => {
    if (selectedRows.length === 0) return;
    await dispatch(bulkUpdateProductStatus({ productIds: selectedRows, status: 'approved' }));
    setSelectedRows([]);
  };

  const handleBulkReject = async () => {
    if (selectedRows.length === 0) return;
    await dispatch(bulkUpdateProductStatus({ productIds: selectedRows, status: 'rejected' }));
    setSelectedRows([]);
  };

  const handleSingleApprove = (id) => {
    dispatch(updateProductStatus({ id, status: 'approved' }));
  };

  const handleSingleReject = (id) => {
    dispatch(updateProductStatus({ id, status: 'rejected' }));
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await dispatch(deleteProduct(id));
      // Refresh page if needed, deleteProduct removes from state automatically
    }
  };

  const columns = useMemo(() => [
    {
      key: "productName",
      label: "Product Name / SKU",
      filterType: "text",
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-800">{row.productName}</div>
          <div className="text-xs text-gray-400">{row.sku || 'No SKU'}</div>
        </div>
      )
    },
    {
      key: "productCode",
      label: "Product Code",
      filterType: "text",
      render: (row) => <span className="font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">{row.productCode || 'N/A'}</span>
    },
    {
      key: "supplier",
      label: "Supplier",
      filterType: "select",
      filterOptions: suppliers.map(s => ({ value: s._id, label: s.name })),
      render: (row) => (
        <span>{row.supplier?.name || row.supplierName || 'N/A'}</span>
      )
    },
    {
      key: "status",
      label: "Status",
      filterType: "select",
      filterOptions: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' }
      ],
      render: (row) => {
        let colors = "bg-gray-100 text-gray-600";
        if (row.status === 'approved') colors = "bg-green-100 text-green-700";
        if (row.status === 'rejected') colors = "bg-red-100 text-red-700";
        if (row.status === 'pending') colors = "bg-amber-100 text-amber-700";

        return (
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${colors}`}>
            {row.status || 'pending'}
          </span>
        );
      }
    },
    {
      key: "actions",
      label: "Actions",
      filterType: "none",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status !== 'approved' && (
            <button onClick={() => handleSingleApprove(row.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition" title="Approve">
              <Icon icon="solar:check-circle-bold" className="text-lg" />
            </button>
          )}
          {row.status !== 'rejected' && (
            <button onClick={() => handleSingleReject(row.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="Reject">
              <Icon icon="solar:close-circle-bold" className="text-lg" />
            </button>
          )}
          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View">
            <Icon icon="solar:eye-bold" className="text-lg" />
          </button>
          <button className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition" title="Edit">
            <Icon icon="solar:pen-bold" className="text-lg" />
          </button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
            <Icon icon="solar:trash-bin-trash-bold" className="text-lg" />
          </button>
        </div>
      )
    }
  ], [suppliers]);

  // Map products to include a standardized `id` for the DataTable
  const tableData = products.map(p => ({ ...p, id: p._id }));

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pb-10 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-primary-600">Estimates</h1>
            <p className="text-sm mt-0.5 text-primary-400">Review and approve products</p>
          </div>

          {/* Bulk Actions Bar */}
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-3 bg-secondary-50 border border-secondary-100 px-4 py-2 rounded-xl animate-fadeIn">
              <span className="text-sm font-semibold text-secondary-600 mr-2">
                {selectedRows.length} selected
              </span>
              <button 
                onClick={handleBulkApprove}
                className="flex items-center gap-1.5 text-sm font-semibold bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition"
              >
                <Icon icon="solar:check-circle-bold" />
                Approve
              </button>
              <button 
                onClick={handleBulkReject}
                className="flex items-center gap-1.5 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition"
              >
                <Icon icon="solar:close-circle-bold" />
                Reject
              </button>
            </div>
          )}
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={tableData}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          sortConfig={sort}
          onSortChange={handleSortChange}
          filterConfig={filters}
          onFilterChange={handleFilterChange}
          loading={loading && tableData.length === 0}
        />

        {/* Pagination Controls */}
        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-6 py-4 shadow-sm">
            <span className="text-sm text-gray-500">
              Showing page <span className="font-semibold text-gray-800">{pagination.page}</span> of <span className="font-semibold text-gray-800">{pagination.pages}</span> 
              {" "}({pagination.total} total)
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                disabled={page === pagination.pages}
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
