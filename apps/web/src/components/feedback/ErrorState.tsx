type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="state state-error" role="alert">
      <p>{message}</p>
      {onRetry ? <button type="button" onClick={onRetry}>Tentar novamente</button> : null}
    </div>
  );
}
