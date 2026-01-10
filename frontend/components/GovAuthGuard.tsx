"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GovAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("gov_token");

    if (!token) {
      router.replace("/government/login");
    }
  }, [router]);

  return <>{children}</>;
}
