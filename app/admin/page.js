"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("projects");
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const router = useRouter();

  // Forms states
  const [projectForm, setProjectForm] = useState({ title: "", description: "", imagePath: "", techStack: "", githubLink: "" });
  const [certForm, setCertForm] = useState({ title: "", description: "", imagePath: "" });
  const [file, setFile] = useState(null);

  const fetchData = async () => {
    // In a real app we might fetch from API, but since we are server components we can create a simple GET route or just reload
    // For simplicity, we'll create a quick fetch to our own server or just reload page since it's an admin panel.
    // Let's create GET handlers in the route files later, or fetch via a new unified route.
    // Actually, creating a GET API is better.
  };

  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(data => {
      if (data.projects) setProjects(data.projects);
      if (data.certificates) setCertificates(data.certificates);
    }).catch(() => {
      // Not authenticated or error
      router.push('/login');
    });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      let imagePath = projectForm.imagePath;
      if (file) {
        imagePath = await uploadFile();
      }
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...projectForm, imagePath }),
      });
      if (res.ok) {
        setProjectForm({ title: "", description: "", imagePath: "", techStack: "", githubLink: "" });
        setFile(null);
        // Refresh data
        window.location.reload();
      }
    } catch (err) {
      alert("Error adding project");
    }
  };

  const handleDeleteProject = async (id) => {
    await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
    window.location.reload();
  };

  const handleAddCert = async (e) => {
    e.preventDefault();
    try {
      let imagePath = certForm.imagePath;
      if (file) {
        imagePath = await uploadFile();
      }
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...certForm, imagePath }),
      });
      if (res.ok) {
        setCertForm({ title: "", description: "", imagePath: "" });
        setFile(null);
        window.location.reload();
      }
    } catch (err) {
      alert("Error adding certificate");
    }
  };

  const handleDeleteCert = async (id) => {
    await fetch(`/api/certificates?id=${id}`, { method: "DELETE" });
    window.location.reload();
  };

  return (
    <main className="container">
      <div className="admin-container">
        <aside className="admin-sidebar">
          <h3>Admin Panel</h3>
          <ul style={{ marginTop: "2rem" }}>
            <li>
              <a href="#" onClick={() => setActiveTab("projects")} style={{ color: activeTab === "projects" ? "var(--primary-color)" : "" }}>
                Manage Projects
              </a>
            </li>
            <li>
              <a href="#" onClick={() => setActiveTab("certs")} style={{ color: activeTab === "certs" ? "var(--primary-color)" : "" }}>
                Manage Certificates
              </a>
            </li>
            <li>
              <a href="#" onClick={handleLogout} style={{ color: "#ef4444", marginTop: "2rem" }}>Logout</a>
            </li>
          </ul>
        </aside>

        <section className="admin-content" style={{ padding: "0 2rem" }}>
          {activeTab === "projects" && (
            <div>
              <h2>Projects</h2>
              <form onSubmit={handleAddProject} style={{ marginTop: "2rem", background: "rgba(0,0,0,0.2)", padding: "2rem", borderRadius: "8px" }}>
                <h4>Add New Project</h4>
                <div className="form-group mt-3">
                  <label>Title</label>
                  <input type="text" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} required rows="3"></textarea>
                </div>
                <div className="form-group">
                  <label>Tech Stack</label>
                  <input type="text" placeholder="e.g. Next.js, CSS, Prisma" value={projectForm.techStack} onChange={e => setProjectForm({...projectForm, techStack: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>GitHub Link</label>
                  <input type="url" value={projectForm.githubLink} onChange={e => setProjectForm({...projectForm, githubLink: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Screenshot Image</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                  <p className="small" style={{ color: 'var(--text-muted)' }}>Or provide a URL:</p>
                  <input type="text" placeholder="https://..." value={projectForm.imagePath} onChange={e => setProjectForm({...projectForm, imagePath: e.target.value})} />
                </div>
                <button type="submit" className="btn-primary">Add Project</button>
              </form>

              <table className="admin-table mt-4">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Tech Stack</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id}>
                      <td>{p.title}</td>
                      <td>{p.techStack}</td>
                      <td><button className="btn-danger" onClick={() => handleDeleteProject(p.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "certs" && (
            <div>
              <h2>Certificates</h2>
              <form onSubmit={handleAddCert} style={{ marginTop: "2rem", background: "rgba(0,0,0,0.2)", padding: "2rem", borderRadius: "8px" }}>
                <h4>Add New Certificate</h4>
                <div className="form-group mt-3">
                  <label>Title</label>
                  <input type="text" value={certForm.title} onChange={e => setCertForm({...certForm, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={certForm.description} onChange={e => setCertForm({...certForm, description: e.target.value})} required rows="2"></textarea>
                </div>
                <div className="form-group">
                  <label>Certificate Image</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                  <p className="small" style={{ color: 'var(--text-muted)' }}>Or provide a URL:</p>
                  <input type="text" placeholder="https://..." value={certForm.imagePath} onChange={e => setCertForm({...certForm, imagePath: e.target.value})} />
                </div>
                <button type="submit" className="btn-primary">Add Certificate</button>
              </form>

              <table className="admin-table mt-4">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map(c => (
                    <tr key={c.id}>
                      <td>{c.title}</td>
                      <td><button className="btn-danger" onClick={() => handleDeleteCert(c.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
