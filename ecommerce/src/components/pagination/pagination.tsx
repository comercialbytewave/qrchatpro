import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function PaginationComponent({ currentPage, totalPages, onPageChange }: Props) {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        const halfVisible = Math.floor(maxVisiblePages / 2);

        let startPage = Math.max(1, currentPage - halfVisible);
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    return (
        <Pagination>
            <PaginationContent>
                {getPageNumbers().map((page) => (
                    <PaginationItem key={page}>
                        <PaginationLink
                            data-active={currentPage === page}
                            className="data-[active=true]:bg-primary/80 data-[active=true]:text-white font-bold" href="#" isActive={page === currentPage} onClick={() => onPageChange(page)}>
                            {page}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                {totalPages > getPageNumbers().slice(-1)[0] && (
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    );
}
