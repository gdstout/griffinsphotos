"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <div className="flex border-b border-dotted border-b-taupe-300">
      <Link
        href="/"
        className={`border-r ${pathname.includes("all") && "border-none"} [@media(max-aspect-ratio:3/4)]:text-s border-dotted border-b-taupe-300 px-4 py-1 font-bold transition duration-1000 hover:bg-taupe-300 hover:text-taupe-950 hover:duration-150 [@media(max-aspect-ratio:3/4)]:border-none`}
      >
        Griffin Stout Photography {pathname.includes("admin") && "Admin"}
        {pathname.includes("login") && "Login"}
      </Link>
      {!pathname.includes("all") && (
        <Link
          href="/all"
          className="flex-1 cursor-pointer px-4 py-1 transition duration-1000 hover:bg-taupe-300 hover:text-taupe-950 hover:duration-150 [@media(max-aspect-ratio:3/4)]:flex [@media(max-aspect-ratio:3/4)]:justify-end"
        >
          See All
        </Link>
      )}
    </div>
  );
}
