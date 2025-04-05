import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./DataTable.scss";
import comments from "../../../shared/constants/comments";
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(initialSort);
  const [filters] = useState<Record<string, string>>(initialFilters);
  const [data, setData] = useState<T[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = useCallback(
    async (params: Partial<QueryParams>): Promise<void> => {
      setLoading(true);
      try {
        const queryParams: QueryParams = {
          page: params.page || currentPage,
          limit: pageSize,
          sortField: params.sortField || sortConfig?.field,
          sortOrder: params.sortOrder || sortConfig?.order,
          filters: params.filters || filters,
        };

        const response = await fetchData(queryParams);
        setData(response.data);
        setTotalItems(response.total);
      } catch (error) {
        console.error(comments.DATA_FETCH_ERR, error);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, sortConfig, filters, fetchData]
  );

  const totalPages = useMemo(
    () => Math.ceil(totalItems / pageSize),
    [totalItems, pageSize]
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
      </div>

      {loading ? (
        <Loading />
      ) : data.length === 0 ? (
        <p>No data available</p>
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
                <tr key={row._id || index}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.render
                        ? column.render(
                            row,
                            (currentPage - 1) * pageSize + index
                          )
                        : row[column.key]}
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
