export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell mx-auto w-full max-w-lg px-4 py-10 sm:px-6">
      <div className="rounded-3xl bg-white p-6 shadow-card sm:p-8">{children}</div>
    </div>
  );
}
