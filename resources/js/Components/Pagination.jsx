import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    // Filter untuk hanya menampilkan link "Previous" dan "Next"
    const filteredLinks = links.filter((l) =>
        l.label.includes("Previous") || l.label.includes("Next")
    );

    return (
        <div className="mt-8 join">
            {filteredLinks.map((l, index) => (
                <Link
                    key={index}
                    href={l.url ?? "#"}
                    className={`join-item btn btn-sm ${!l.url ? "btn-disabled" : ""}`}
                    dangerouslySetInnerHTML={{ __html: l.label }}
                />
            ))}
        </div>
    );
}