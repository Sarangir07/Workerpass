"use client";

import { useMemo, useState } from "react";

export default function AdminDataTable({ columns, rows, emptyText = "No records found" }) {
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [page, rows]);

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] shadow-xl shadow-black/20 backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-white/[0.07] text-xs uppercase text-slate-400">
            <tr>
              {columns.map((column) => (
                <th className="px-5 py-4 font-black" key={column.key}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {visibleRows.map((row, index) => (
              <tr className="text-sm text-slate-200 transition hover:bg-white/[0.05]" key={row.id || row._id || index}>
                {columns.map((column) => (
                  <td className="px-5 py-4 align-middle" key={column.key}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && <div className="px-5 py-12 text-center text-sm font-bold text-slate-400">{emptyText}</div>}

      <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 text-sm font-bold text-slate-300 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing {rows.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, rows.length)} of {rows.length}
        </span>
        <div className="flex gap-2">
          <button
            className="rounded-lg border border-white/10 px-3 py-2 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page === 1}
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>
          <button
            className="rounded-lg border border-white/10 px-3 py-2 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page === totalPages}
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
