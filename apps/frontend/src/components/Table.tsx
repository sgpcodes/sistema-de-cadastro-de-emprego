import { ReactNode, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import Card from './Card';

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (row: T) => ReactNode;
}

interface TableProps<T extends Record<string, ReactNode>> {
  columns: Array<Column<T>>;
  data: T[];
  emptyMessage: string;
  searchPlaceholder?: string;
}

export default function Table<T extends Record<string, ReactNode>>({
  columns,
  data,
  emptyMessage,
  searchPlaceholder = 'Buscar rapidamente'
}: TableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof T>(columns[0]?.key);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const pageSize = 5;

  const filteredData = useMemo(() => {
    const query = search.toLowerCase().trim();
    const visibleRows = query
      ? data.filter((row) =>
          Object.values(row).some((value) =>
            String(value ?? '').toLowerCase().includes(query)
          )
        )
      : data;

    return [...visibleRows].sort((a, b) => {
      const left = String(a[sortKey] ?? '');
      const right = String(b[sortKey] ?? '');
      return sortDirection === 'asc'
        ? left.localeCompare(right)
        : right.localeCompare(left);
    });
  }, [data, search, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  };

  return (
    <Card className="table-card">
      <div className="table-toolbar">
        <label className="search-box">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
          />
        </label>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)}>
                  <button type="button" onClick={() => handleSort(column.key)}>
                    <span>{column.label}</span>
                    {sortKey === column.key && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr key={String(row.id ?? rowIndex)}>
                  {columns.map((column) => (
                    <td key={String(column.key)} data-label={column.label}>
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="empty-table">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <div>
          <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))}>
            Anterior
          </button>
          <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
            Próxima
          </button>
        </div>
      </div>
    </Card>
  );
}
