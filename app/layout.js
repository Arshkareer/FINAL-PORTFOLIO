import "./globals.css";

export const metadata = {
  title: "Arsh | Full-stack Developer",
  description: "Portfolio of Arshdeep Singh, a passionate full-stack developer and designer.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="container nav-content">
            <a href="/" className="logo">AR<span className="dollar">$</span>H</a>
            <div className="nav-links">
              <a href="#about">About</a>
              <a href="#projects">Projects</a>
              <a href="#certificates">Certificates</a>
              <a href="/login" className="admin-link">Admin</a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
