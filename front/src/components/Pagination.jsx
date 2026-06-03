import React, { useMemo } from 'react'

const getPageItems = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = [1]
  const left = Math.max(2, currentPage - 1)
  const right = Math.min(totalPages - 1, currentPage + 1)

  if (left > 2) {
    pages.push('left-ellipsis')
  }

  for (let page = left; page <= right; page += 1) {
    pages.push(page)
  }

  if (right < totalPages - 1) {
    pages.push('right-ellipsis')
  }

  pages.push(totalPages)
  return pages
}

export default function Pagination({ pagination = {}, currentPage: currentPageProp, totalPages: totalPagesProp, onPageChange, loading = false }) {
const rawPage = Number(currentPageProp ?? pagination.current_page ?? pagination.page)
const rawTotalPages = Number(totalPagesProp ?? pagination.last_page ?? pagination.totalPages ?? pagination.total_pages)
  const total = Number(pagination.total || 0)
  const limit = Number(pagination.limit || 0)
  let totalPages = Number.isFinite(rawTotalPages) && rawTotalPages > 0 ? rawTotalPages : 0

  if (!totalPages && limit > 0) {
    totalPages = Math.max(1, Math.ceil(total / limit))
  }

  if (!totalPages) {
    totalPages = 1
  }

  const currentPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.min(rawPage, totalPages) : 1

  const pageItems = useMemo(() => getPageItems(currentPage, totalPages), [currentPage, totalPages])

  const handlePageChange = (nextPage) => {
    const pageNumber = Number(nextPage)
    if (loading || !Number.isFinite(pageNumber) || pageNumber === currentPage) return
    onPageChange?.(pageNumber)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-border bg-surface-secondary/40 text-sm">
      <span className="text-text-secondary">
        Page {currentPage} of {totalPages} {total ? `(${total} total)` : ''}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={loading || currentPage <= 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className="cursor-pointer px-3 py-2 rounded-lg border border-border bg-card text-text disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {pageItems.map((item) => {
          if (item === 'left-ellipsis' || item === 'right-ellipsis') {
            return (
              <span key={item} className="px-3 py-2 text-text-secondary">
                …
              </span>
            )
          }

          const pageNumber = Number(item)

          return (
            <button
              key={item}
              type="button"
              disabled={loading || pageNumber === currentPage}
              onClick={() => handlePageChange(pageNumber)}
              className={`cursor-pointer px-3 py-2 rounded-lg border ${pageNumber === currentPage ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-text'} ${loading ? 'opacity-60' : ''}`}
              aria-current={pageNumber === currentPage ? 'page' : undefined}
            >
              {item}
            </button>
          )
        })}
        <button
          type="button"
          disabled={loading || currentPage >= totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className="cursor-pointer px-3 py-2 rounded-lg border border-border bg-card text-text disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
}
