export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-prism-dark via-prism-dark-700 to-prism-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">PRISM</h1>
          <p className="text-prism-secondary">Portfolio Risk Intelligence & Savings Management</p>
        </div>
        {children}
      </div>
    </div>
  );
}
