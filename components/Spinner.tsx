export function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "3px solid var(--color-border)",
          borderTopColor: "var(--color-primary)",
          animation: "spin 0.8s linear infinite",
        }}
        role="status"
        aria-label="Memuat"
      />
    </div>
  );
}
