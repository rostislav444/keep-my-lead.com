"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DialogDetailRedirect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/panel/dialogs?selected=${id}`);
  }, [id, router]);

  return null;
}
