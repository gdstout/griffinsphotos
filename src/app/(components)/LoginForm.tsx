"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setError("Incorrect password");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Unable to log in");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-row gap-4 border-taupe-300"
      >
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
          className={`flex-1 border bg-transparent px-2 py-0 outline-none focus:border-solid ${error ? "border-red-400" : "border-taupe-300"}`}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="border border-taupe-300 p-1 transition hover:bg-taupe-300 hover:text-taupe-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Loading" : "Submit"}
        </button>
      </form>
    </main>
  );
}
