"use client";

import React, { useTransition } from "react";
import { ButtonLoadingBar } from "@/components/ButtonLoadingBar";
import { togglePublish } from "./actions";

export function PublishToggleButton({
  setId,
  published,
}: {
  setId: string;
  published: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("set_id", setId);
      formData.set("next", String(!published));
      await togglePublish(formData);
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className="boxy-pressable-sm font-mono"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "7px 14px",
        fontSize: "11px",
        fontWeight: 800,
        border: "1.5px solid var(--color-border)",
        backgroundColor: published
          ? "var(--color-surface)"
          : "var(--color-accent)",
        color: published
          ? "var(--color-text)"
          : "var(--color-accent-contrast)",
        cursor: isPending ? "not-allowed" : "pointer",
        opacity: isPending ? 0.85 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "120px",
      }}
    >
      <span>
        {isPending
          ? published
            ? "MENGUBAH KE DRAF..."
            : "MENERBITKAN..."
          : published
            ? "JADIKAN DRAF"
            : "TERBITKAN KE SISWA ➔"}
      </span>
      {isPending && (
        <ButtonLoadingBar
          variant={published ? "surface" : "contrast"}
          height={3}
        />
      )}
    </button>
  );
}
