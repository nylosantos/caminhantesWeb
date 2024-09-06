export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-16 flex w-full flex-1 items-start justify-center">
      <div className="flex w-full max-w-md flex-col items-center justify-center px-6 mb-20">
        {children}
      </div>
    </div>
  );
}
