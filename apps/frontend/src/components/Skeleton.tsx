export function SkeletonTable() {
  return (
    <div className="skeleton-table" aria-label="Carregando dados">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

export function LoadingSpinner() {
  return <span className="spinner" aria-label="Carregando" />;
}
