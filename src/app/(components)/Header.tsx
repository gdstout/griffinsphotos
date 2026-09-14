"use client";

import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <div className="flex border-b border-b-taupe-300 border-dotted">
      <div className="px-4 py-1 font-bold border-r border-b-taupe-300 border-dotted">
        Griffin Stout Photography
      </div>
      {/* <div className="px-4 py-1 italic border-r border-b-taupe-300 border-dotted">
        Click anywhere to see a new photo...
      </div>
      <div className="px-4 py-1 border-r border-b-taupe-300 border-dotted cursor-pointer">
        {pathname.includes("all") ? "Back to single view" : "See all"}
      </div> */}
    </div>
  );
}
