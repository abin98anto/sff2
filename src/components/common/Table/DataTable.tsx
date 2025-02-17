"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./DataTable.scss";

export interface Column<T = any> {
  key: string;
  label: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface SortConfig {
  field: string;
  order: "asc" | "desc";
}

interface QueryParams {
  page: number;
  limit: number;
  search: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, string>;
}

interface TableData<T = any> {
  data: T[];
  total: number;
}

interface ReusableTableProps<T extends Record<string, any>> {
  columns: Column<T>[]; // Ensuring T is applied correctly
  fetchData: (params: QueryParams) => Promise<TableData<T>>;
  pageSize?: number;
  initialSort?: SortConfig | null;
  initialFilters?: Record<string, string>;
  refetchRef?: React.MutableRefObject<(() => void) | undefined>;
}

const DataTable = <T extends Record<string, any>>({
  columns,
  fetchData,
  pageSize = 10,
  initialSort = null,
  initialFilters = {},
  refetchRef,
}: ReusableTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(initialSort);
  const [filters] = useState<Record<string, string>>(initialFilters);
  const [data, setData] = useState<T[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = useCallback(
    async (params: Partial<QueryParams>): Promise<void> => {
      setLoading(true);
      try {
        const queryParams: QueryParams = {
          page: params.page || currentPage,
          limit: pageSize,
          search: params.search || searchTerm,
          sortField: params.sortField || sortConfig?.field,
          sortOrder: params.sortOrder || sortConfig?.order,
          filters: params.filters || filters,
        };

        const response = await fetchData(queryParams);
        setData(response.data);
        setTotalPages(Math.ceil(response.total / pageSize));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, searchTerm, sortConfig, filters, fetchData]
  );

  useEffect(() => {
    loadData({});
  }, [loadData]);

  const handlePageChange = async (newPage: number): Promise<void> => {
    setCurrentPage(newPage);
    await loadData({ page: newPage });
  };

  const handleSort = async (field: string): Promise<void> => {
    const newSortConfig: SortConfig = {
      field,
      order:
        sortConfig?.field === field && sortConfig?.order === "asc"
          ? "desc"
          : "asc",
    };
    setSortConfig(newSortConfig);
    setCurrentPage(1);
    await loadData({
      page: 1,
      sortField: newSortConfig.field,
      sortOrder: newSortConfig.order,
    });
  };

  const refetchFunction = useMemo(() => () => loadData({}), [loadData]);

  if (refetchRef) {
    refetchRef.current = refetchFunction;
  }

  return (
    <div className="table-container">
      <div className="table-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            onKeyPress={(e: React.KeyboardEvent) => {
              if (e.key === "Enter") {
                loadData({ search: searchTerm, page: 1 });
              }
            }}
            className="search-input"
          />
          <button
            onClick={() => loadData({ search: searchTerm, page: 1 })}
            className="search-button"
          >
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>
                    <div className="column-header">
                      {column.label}
                      <button
                        onClick={() => handleSort(column.key)}
                        className="sort-button"
                      >
                        {sortConfig?.field === column.key
                          ? sortConfig.order === "asc"
                            ? "↑"
                            : "↓"
                          : "↕"}
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.key === "slNo"
                        ? index + 1
                        : column.render
                        ? column.render(row, index)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`pagination-button ${
                  currentPage === index + 1 ? "active" : ""
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(DataTable);
