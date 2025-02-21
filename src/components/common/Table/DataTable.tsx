import React, { useState, useEffect, useCallback, useMemo } from "react";

import "./DataTable.scss";
import { comments } from "../../../shared/constants/comments";
import Pagination from "../Pagination/Pagination";
import Loading from "../Loading/Loading";

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
  columns: Column<T>[];
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
  const [searchInput, setSearchInput] = useState<string>("");
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
        console.error(comments.DATA_FETCH_ERR, error);
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

  const handleSearch = async () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
    await loadData({ search: searchInput, page: 1 });
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
            value={searchInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchInput(e.target.value)
            }
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
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

                      {column.key === "status" &&
                        typeof row[column.key] === "boolean" && (
                          <span
                            className={`status ${
                              row[column.key] ? "active" : "inactive"
                            }`}
                          >
                            {row[column.key] ? "Active" : "Inactive"}
                          </span>
                        )}
                      {column.key === "actions" && (
                        <div className="actions">
                          <button className="edit"></button>
                          <button className="delete"></button>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default React.memo(DataTable);
