import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-4 px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © 2026 Alatyon Hospital. All rights reserved.
        </p>
        <nav className="flex items-center gap-6">
          <Link
            href="#"
            className="text-sm text-primary hover:underline transition-colors"
          >
            Contact Us
          </Link>
          <Link
            href="#"
            className="text-sm text-primary hover:underline transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="text-sm text-primary hover:underline transition-colors"
          >
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}
