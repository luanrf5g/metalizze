import {
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
  Pagination as ShadcnPagination,
} from "@/components/ui/pagination"

interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
}

function createPageRange(currentPage: number, totalPages: number): (number | "dots")[] {
  const pages: (number | "dots")[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
    return pages
  }

  if (currentPage <= 3) {
    pages.push(1, 2, 3, 4, "dots", totalPages - 1, totalPages)
    return pages
  }

  if (currentPage >= totalPages - 2) {
    pages.push(1, 2, "dots", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    return pages
  }

  pages.push(1, "dots", currentPage - 1, currentPage, currentPage + 1, "dots", totalPages)
  return pages
}

export function Pagination({ currentPage, totalPages, hasMore, onPageChange }: PaginationProps) {
  const isFirstPage = currentPage <= 1
  const isLastPage = totalPages ? currentPage >= totalPages : !hasMore

  const pages = totalPages && totalPages > 0
    ? createPageRange(currentPage, totalPages)
    : null

  return (
    <ShadcnPagination className="mt-4 justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (!isFirstPage) onPageChange(currentPage - 1);
            }}
            className={isFirstPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
        {pages ? (
          pages.map((item, index) => (
            item === "dots" ? (
              <PaginationItem key={`dots-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink
                  href="#"
                  isActive={item === currentPage}
                  onClick={(e) => {
                    e.preventDefault()
                    if (item !== currentPage) onPageChange(item)
                  }}
                  className="size-9 rounded-full"
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            )
          ))
        ) : (
          <PaginationItem>
            <PaginationLink href="#" isActive className="size-9 rounded-full">
              {currentPage}
            </PaginationLink>
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (!isLastPage) onPageChange(currentPage + 1);
            }}
            className={isLastPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </ShadcnPagination>
  )
}
