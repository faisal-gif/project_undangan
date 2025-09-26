import { Link } from "@inertiajs/react";

function Pagination({ tamus }) {
  const current = tamus.current_page;
  const last = tamus.last_page;
  const path = tamus.path;

  // fungsi bantu buat array range
  const range = (start, end) => {
    let arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  };

  // tentukan halaman yang ditampilkan
  let pages = [];
  if (last <= 7) {
    // kalau total halaman sedikit, tampilkan semua
    pages = range(1, last);
  } else if (current <= 4) {
    pages = [1, 2, 3, 4, 5, "...", last];
  } else if (current >= last - 3) {
    pages = [1, "...", last - 4, last - 3, last - 2, last - 1, last];
  } else {
    pages = [1, "...", current - 1, current, current + 1, "...", last];
  }

  return (
    <div className="mt-8 join">
      {/* Previous */}
      {tamus.prev_page_url && (
        <Link href={tamus.prev_page_url} className="join-item btn btn-sm">
          « Previous
        </Link>
      )}

      {/* Numbered pages */}
      {pages.map((page, index) =>
        page === "..." ? (
          <span key={index} className="join-item btn btn-sm btn-disabled">
            ...
          </span>
        ) : (
          <Link
            key={index}
            href={`${path}?page=${page}`}
            className={`join-item btn btn-sm ${
              current === page ? "btn-active" : ""
            }`}
          >
            {page}
          </Link>
        )
      )}

      {/* Next */}
      {tamus.next_page_url && (
        <Link href={tamus.next_page_url} className="join-item btn btn-sm">
          Next »
        </Link>
      )}
    </div>
  );
}

export default Pagination;
