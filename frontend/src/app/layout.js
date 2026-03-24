import { ClerkProvider, SignInButton, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import "./globals.css";

export const metadata = {
  title: "Aether AI Studio | The Future of AI Content",
  description: "Generate & Schedule AI Shorts Videos. Create engaging shorts for YouTube, Instagram, and TikTok in seconds.",
};

export default async function RootLayout({ children }) {
  const { userId } = await auth();

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <div className="background-effects">
            <div className="glow-circle top-right"></div>
            <div className="glow-circle bottom-left"></div>
          </div>
          <nav suppressHydrationWarning className="navbar container flex justify-between items-center" style={{ padding: '1.5rem 2rem' }}>
            <div className="logo text-gradient" style={{ fontSize: "1.75rem", fontWeight: "800" }}>
              AETHER AI
            </div>
            <div>
              {userId ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <SignInButton mode="modal">
                  <button className="btn btn-outline">Sign In</button>
                </SignInButton>
              )}
            </div>
          </nav>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
