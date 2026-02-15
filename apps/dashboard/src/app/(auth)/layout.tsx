// Auth Layout - Simple centered layout for authentication pages
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/" className="font-bold text-xl">
            VisionX Eval
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container py-4 px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} VisionX Eval. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
