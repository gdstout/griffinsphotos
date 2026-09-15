import { isValidAuthToken } from "@/src/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "../(components)/LoginForm";

export default async function LoginPage() {
  const token = (await cookies()).get("admin_token")?.value;

  if (isValidAuthToken(token)) {
    redirect("/admin");
  }

  return <LoginForm />;
}
