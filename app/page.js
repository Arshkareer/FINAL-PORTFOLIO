import { db } from "../lib/db";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const projects = await db.project.findMany({ orderBy: { createdAt: "desc" } });
  const certificates = await db.certificate.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main>
      {/* Hero Section */}
      <section className="container hero animate-fade-in">
        <div className="hero-content">
          <h1 className="hero-greeting">
            Hey, I'm <span className="hero-name">Arshdeep Singh</span>
          </h1>
          <h2 className="typewriter">a full-stack developer</h2>
          <p className="hero-sub mt-4">
            "Coding transforms complex problems into efficient algorithms, enabling machines to perform precise tasks. It's the art of structuring logic to build scalable and robust solutions."
          </p>
          <a href="#projects" className="btn-primary">See My Work</a>
        </div>
        <div className="hero-image-container animate-fade-in animate-delay-2">
          <img src="/profile.jpg" alt="Arsh" className="hero-image" style={{ width: '400px', height: '400px', objectFit: 'cover' }} />
        </div>
      </section>

      {/* Stats Section */}
      <div className="container animate-fade-in animate-delay-3">
        <div className="stats-section">
          <div className="stat-item">
            <div className="stat-value">{projects.length}+</div>
            <div className="stat-label">Projects Developed</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{certificates.length}+</div>
            <div className="stat-label">Certifications</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">100%</div>
            <div className="stat-label">Commitment</div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <section id="projects" className="container animate-fade-in animate-delay-4">
        <h2 className="section-title">Featured Projects</h2>
        <div className="projects-grid">
          {projects.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No projects added yet.</p>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="project-card">
                <img src={project.imagePath} alt={project.title} className="project-image" />
                <div className="project-overlay">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-desc">{project.description}</p>
                  <p className="project-tech">{project.techStack}</p>
                  <a href={project.githubLink} target="_blank" rel="noreferrer" className="project-link">
                    View on GitHub
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Certificates Section */}
      <section id="certificates" className="container animate-fade-in">
        <h2 className="section-title">Certifications</h2>
        <div className="certs-grid">
          {certificates.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No certificates added yet.</p>
          ) : (
            certificates.map((cert) => (
              <div key={cert.id} className="cert-card">
                <img src={cert.imagePath} alt={cert.title} className="cert-image" />
                <h3 className="cert-title">{cert.title}</h3>
                <p className="cert-desc">{cert.description}</p>
              </div>
            ))
          )}
        </div>
      </section>
      
      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-color)", padding: "2rem 0", textAlign: "center", color: "var(--text-muted)", marginTop: "4rem" }}>
        <p>&copy; {new Date().getFullYear()} Arshdeep Singh. Built with Next.js</p>
      </footer>
    </main>
  );
}
