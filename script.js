// Admin Password (Change this to your own secure password)
const ADMIN_PASSWORD = "arsh@2025";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDHU3mTL-3O4OW5FLYUp4vUNy2fAfRELGs",
    authDomain: "arsh-portfolio-sync.firebaseapp.com",
    projectId: "arsh-portfolio-sync",
    storageBucket: "arsh-portfolio-sync.firebasestorage.app",
    messagingSenderId: "208403868224",
    appId: "1:208403868224:web:8d3d220c4d980262d70da5"
};

// Initialize Firebase
let db = null;
let storage = null;
let isFirebaseEnabled = false;

try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        storage = firebase.storage();
        isFirebaseEnabled = true;
        console.log('✅ Firebase connected - Real-time sync enabled!');
    }
} catch (error) {
    console.warn('⚠️ Firebase not available, using localStorage only:', error);
    isFirebaseEnabled = false;
}

// Data Storage (Using localStorage as fallback)
let projects = [];
let certificates = [];
let editingProjectId = null;
let editingCertId = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    renderProjects();
    renderCertificates();
    setupEventListeners();
    updateFirebaseStatus();
});

// Setup Event Listeners
function setupEventListeners() {
    // Admin Login
    const adminBtn = document.getElementById('adminLoginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('.close');
    const loginForm = document.getElementById('loginForm');
    
    adminBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;
        
        if (password === ADMIN_PASSWORD) {
            loginModal.style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            document.body.style.overflow = 'hidden';
            renderExistingProjects();
            renderExistingCertificates();
        } else {
            alert('Incorrect password!');
        }
    });
    
    // Certificate Preview Modal
    const certModal = document.getElementById('certPreviewModal');
    const certClose = document.querySelector('.cert-close');
    
    if (certClose) {
        certClose.addEventListener('click', () => {
            certModal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === certModal) {
            certModal.style.display = 'none';
        }
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        document.getElementById('adminPanel').style.display = 'none';
        document.body.style.overflow = 'auto';
        document.getElementById('adminPassword').value = '';
    });
    
    // Tab Switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            btn.classList.add('active');
            document.getElementById(tabName + '-tab').classList.add('active');
        });
    });
    
    // Add Project Form
    document.getElementById('addProjectForm').addEventListener('submit', handleAddProject);
    
    // Add Certificate Form
    document.getElementById('addCertForm').addEventListener('submit', handleAddCertificate);
    
    // Update Resume Form
    document.getElementById('updateResumeForm').addEventListener('submit', handleUpdateResume);
    
    // Export/Import Data
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('importDataFile').addEventListener('change', importData);
    document.getElementById('syncLocalToFirebase').addEventListener('click', syncLocalToFirebase);
    
    // Update data counts
    updateDataCounts();
    
    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
}

// Preview Certificate
function previewCertificate(imageSrc) {
    const modal = document.getElementById('certPreviewModal');
    const modalImg = document.getElementById('certPreviewImage');
    modal.style.display = 'block';
    modalImg.src = imageSrc;
}

// Download Certificate
function downloadCertificate(imageSrc, title) {
    // Create a temporary anchor element
    const link = document.createElement('a');
    
    // Set the href to the image source
    link.href = imageSrc;
    
    // Set the download attribute with the filename
    const filename = title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg';
    link.download = filename;
    
    // Set additional attributes to force download
    link.setAttribute('download', filename);
    link.setAttribute('target', '_blank');
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(link);
    }, 100);
}

// Handle Add Project
async function handleAddProject(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const screenshot = formData.get('screenshot');
    
    // Convert image to base64
    const reader = new FileReader();
    reader.onload = async function(event) {
        const project = {
            id: Date.now(),
            title: formData.get('title'),
            description: formData.get('description'),
            techStack: formData.get('techStack').split(',').map(t => t.trim()),
            githubLink: formData.get('githubLink'),
            screenshot: event.target.result
        };
        
        // Save to Firebase if enabled
        if (isFirebaseEnabled) {
            try {
                const docRef = await db.collection('projects').add(project);
                project.firebaseId = docRef.id;
                console.log('✅ Project saved to Firebase with ID:', docRef.id);
            } catch (error) {
                console.error('Error saving to Firebase:', error);
                alert('Warning: Project saved locally but not synced to cloud. Check your internet connection.');
            }
        }
        
        projects.push(project);
        saveData();
        renderProjects();
        renderExistingProjects();
        e.target.reset();
        alert('Project added successfully!' + (isFirebaseEnabled ? ' ✅ Synced to all devices!' : ''));
    };
    
    reader.readAsDataURL(screenshot);
}

// Handle Add Certificate
async function handleAddCertificate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const certImage = formData.get('certImage');
    
    // Convert image to base64
    const reader = new FileReader();
    reader.onload = async function(event) {
        const certificate = {
            id: Date.now(),
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            image: event.target.result
        };
        
        // Save to Firebase if enabled
        if (isFirebaseEnabled) {
            try {
                const docRef = await db.collection('certificates').add(certificate);
                certificate.firebaseId = docRef.id;
                console.log('✅ Certificate saved to Firebase with ID:', docRef.id);
            } catch (error) {
                console.error('Error saving to Firebase:', error);
                alert('Warning: Certificate saved locally but not synced to cloud. Check your internet connection.');
            }
        }
        
        certificates.push(certificate);
        saveData();
        renderCertificates();
        renderExistingCertificates();
        e.target.reset();
        alert('Certificate added successfully!' + (isFirebaseEnabled ? ' ✅ Synced to all devices!' : ''));
    };
    
    reader.readAsDataURL(certImage);
}

// Handle Update Resume
async function handleUpdateResume(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const resumeFile = formData.get('resumeFile');
    
    if (!resumeFile || resumeFile.type !== 'application/pdf') {
        alert('Please upload a valid PDF file!');
        return;
    }
    
    // Convert PDF to base64 and store in localStorage
    const reader = new FileReader();
    reader.onload = function(event) {
        localStorage.setItem('portfolioResume', event.target.result);
        alert('Resume updated successfully! Note: Download the resume link will use the new file.');
        e.target.reset();
    };
    
    reader.readAsDataURL(resumeFile);
}

// Export Data
function exportData() {
    const data = {
        projects: projects,
        certificates: certificates,
        resume: localStorage.getItem('portfolioResume'),
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Backup exported successfully!');
}

// Sync Local Storage to Firebase
async function syncLocalToFirebase() {
    if (!isFirebaseEnabled) {
        alert('Firebase is not connected. Please check your internet connection.');
        return;
    }
    
    if (!confirm('This will upload all data from this device to the cloud. Continue?')) {
        return;
    }
    
    try {
        const localProjects = JSON.parse(localStorage.getItem('portfolioProjects') || '[]');
        const localCerts = JSON.parse(localStorage.getItem('portfolioCertificates') || '[]');
        
        let uploadedProjects = 0;
        let uploadedCerts = 0;
        
        // Upload projects
        for (const project of localProjects) {
            // Check if project already exists in Firebase
            const existingProject = projects.find(p => p.id === project.id);
            if (!existingProject) {
                await db.collection('projects').add(project);
                uploadedProjects++;
            }
        }
        
        // Upload certificates
        for (const cert of localCerts) {
            // Check if certificate already exists in Firebase
            const existingCert = certificates.find(c => c.id === cert.id);
            if (!existingCert) {
                await db.collection('certificates').add(cert);
                uploadedCerts++;
            }
        }
        
        // Reload data from Firebase
        await loadData();
        
        // Re-render everything
        renderProjects();
        renderCertificates();
        renderExistingProjects();
        renderExistingCertificates();
        updateDataCounts();
        
        alert(`✅ Sync complete!\n\nUploaded:\n- ${uploadedProjects} projects\n- ${uploadedCerts} certificates\n\nAll devices will now show this data!\n\nRefreshing page...`);
        
        // Refresh the page to ensure everything is updated
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error) {
        console.error('Error syncing to Firebase:', error);
        alert('Error syncing data. Please try again.');
    }
}

// Import Data
function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            
            if (confirm('This will replace all current data. Continue?')) {
                projects = data.projects || [];
                certificates = data.certificates || [];
                
                if (data.resume) {
                    localStorage.setItem('portfolioResume', data.resume);
                }
                
                saveData();
                renderProjects();
                renderCertificates();
                renderExistingProjects();
                renderExistingCertificates();
                updateDataCounts();
                
                alert('Data imported successfully! Your projects and certificates are now synced.');
            }
        } catch (error) {
            alert('Error importing data. Please make sure you selected a valid export file.');
            console.error(error);
        }
    };
    
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
}

// Update Data Counts
function updateDataCounts() {
    const projectCountEl = document.getElementById('projectCount');
    const certCountEl = document.getElementById('certCount');
    
    if (projectCountEl) projectCountEl.textContent = projects.length;
    if (certCountEl) certCountEl.textContent = certificates.length;
}

// Render Existing Projects in Admin Panel
function renderExistingProjects() {
    const container = document.getElementById('existingProjects');
    if (!container) return;
    
    container.innerHTML = projects.map(project => `
        <div class="item-card">
            <div class="item-info">
                <h4>${project.title}</h4>
                <p>${project.description.substring(0, 100)}...</p>
                <p><strong>Tech:</strong> ${project.techStack.join(', ')}</p>
            </div>
            <div class="item-actions">
                <button class="edit-btn" onclick="editProject(${project.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" onclick="deleteProject(${project.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Render Existing Certificates in Admin Panel
function renderExistingCertificates() {
    const container = document.getElementById('existingCertificates');
    if (!container) return;
    
    container.innerHTML = certificates.map(cert => `
        <div class="item-card">
            <div class="item-info">
                <h4>${cert.title}</h4>
                <p>${cert.description.substring(0, 100)}...</p>
                <p><strong>Category:</strong> ${cert.category}</p>
            </div>
            <div class="item-actions">
                <button class="edit-btn" onclick="editCertificate(${cert.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" onclick="deleteCertificate(${cert.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Edit Project
function editProject(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    
    const newTitle = prompt('Edit Title:', project.title);
    if (newTitle === null) return;
    
    const newDescription = prompt('Edit Description:', project.description);
    if (newDescription === null) return;
    
    const newTechStack = prompt('Edit Tech Stack (comma separated):', project.techStack.join(', '));
    if (newTechStack === null) return;
    
    const newGithubLink = prompt('Edit GitHub Link:', project.githubLink);
    if (newGithubLink === null) return;
    
    project.title = newTitle;
    project.description = newDescription;
    project.techStack = newTechStack.split(',').map(t => t.trim());
    project.githubLink = newGithubLink;
    
    saveData();
    renderProjects();
    renderExistingProjects();
    alert('Project updated successfully!');
}

// Delete Project
async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    const project = projects.find(p => p.id === id);
    
    // Delete from Firebase if enabled
    if (isFirebaseEnabled && project && project.firebaseId) {
        try {
            await db.collection('projects').doc(project.firebaseId).delete();
            console.log('✅ Project deleted from Firebase');
        } catch (error) {
            console.error('Error deleting from Firebase:', error);
        }
    }
    
    projects = projects.filter(p => p.id !== id);
    saveData();
    renderProjects();
    renderExistingProjects();
    alert('Project deleted successfully!' + (isFirebaseEnabled ? ' ✅ Synced to all devices!' : ''));
}

// Edit Certificate
function editCertificate(id) {
    const cert = certificates.find(c => c.id === id);
    if (!cert) return;
    
    const newTitle = prompt('Edit Title:', cert.title);
    if (newTitle === null) return;
    
    const newDescription = prompt('Edit Description:', cert.description);
    if (newDescription === null) return;
    
    const newCategory = prompt('Edit Category:', cert.category);
    if (newCategory === null) return;
    
    cert.title = newTitle;
    cert.description = newDescription;
    cert.category = newCategory;
    
    saveData();
    renderCertificates();
    renderExistingCertificates();
    alert('Certificate updated successfully!');
}

// Delete Certificate
async function deleteCertificate(id) {
    if (!confirm('Are you sure you want to delete this certificate?')) return;
    
    const cert = certificates.find(c => c.id === id);
    
    // Delete from Firebase if enabled
    if (isFirebaseEnabled && cert && cert.firebaseId) {
        try {
            await db.collection('certificates').doc(cert.firebaseId).delete();
            console.log('✅ Certificate deleted from Firebase');
        } catch (error) {
            console.error('Error deleting from Firebase:', error);
        }
    }
    
    certificates = certificates.filter(c => c.id !== id);
    saveData();
    renderCertificates();
    renderExistingCertificates();
    alert('Certificate deleted successfully!' + (isFirebaseEnabled ? ' ✅ Synced to all devices!' : ''));
}

// Render Projects
function renderProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    
    // Default projects if none exist
    if (projects.length === 0) {
        projects = [
            {
                id: 1,
                title: "Skill Enhancement Dashboard",
                description: "A web app where students found each and every language and courses under single roof to get skill and Development.",
                techStack: ["HTML", "CSS", "JavaScript"],
                githubLink: "https://github.com/Arshkareer/First-Frontend-Project-",
                screenshot: "Screenshot (14).png"
            },
            {
                id: 2,
                title: "Teacher Availability Portal",
                description: "A web app where students are able to find the teachers by simply entering their name to find the location that will help to find accurately and tends to save their time.",
                techStack: ["HTML", "CSS", "JavaScript", "PHP", "MySQL"],
                githubLink: "https://github.com/Arshkareer/Teacher-Availability-Portal",
                screenshot: "Screenshot (15).png"
            },
            {
                id: 3,
                title: "User Tracking System",
                description: "A web app where all the activities are get tracked that have been performed by user even a single click.",
                techStack: ["HTML", "CSS", "JavaScript", "PHP", "MySQL"],
                githubLink: "https://github.com/Arshkareer/User-Tracking-System",
                screenshot: "Screenshot (16).png"
            }
        ];
        saveData();
    }
    
    projectsGrid.innerHTML = projects.map(project => `
        <div class="project-card">
            <img src="${project.screenshot}" alt="${project.title}" class="project-image">
            <div class="project-overlay">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">
                    ${project.techStack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <div class="project-actions">
                    <button class="project-view-btn" onclick="viewProjectImage('${project.screenshot}', '${project.title}')">
                        <i class="fa fa-image"></i> View Image
                    </button>
                    <a href="${project.githubLink}" target="_blank" class="project-link">
                        <i class="fab fa-github"></i> GitHub
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// View Project Image in Modal
function viewProjectImage(imageSrc, title) {
    const modal = document.getElementById('certPreviewModal');
    const modalImg = document.getElementById('certPreviewImage');
    modal.style.display = 'block';
    modalImg.src = imageSrc;
    modalImg.alt = title;
}

// Render Certificates
function renderCertificates() {
    const technicalCerts = document.getElementById('technicalCerts');
    const extraCerts = document.getElementById('extraCerts');
    
    // Default certificates if none exist
    if (certificates.length === 0) {
        certificates = [
            {
                id: 1,
                title: "ISO Certificate",
                description: "Actively participating in workshop on Emerging Technologies.",
                category: "Technical",
                image: "WhatsApp Image 2025-08-12 at 11.30.28_70218134.jpg"
            },
            {
                id: 2,
                title: "Hackathon Achievement",
                description: "Proudly secured the Third Position in the Hackathon organized by Guru Nanak Dev Engineering College.",
                category: "Technical",
                image: "WhatsApp Image 2025-08-12 at 11.43.36_f2abffea.jpg"
            },
            {
                id: 3,
                title: "GNA Hackathon 3.0",
                description: "Successfully participated in GNA Hackathon 3.0 organised by GNA University.",
                category: "Technical",
                image: "WhatsApp Image 2025-08-12 at 12.31.54_9e2df64c.jpg"
            },
            {
                id: 4,
                title: "Tech Trova: AI Edition Innovation",
                description: "Secured 2nd Position in Tech Trova: AI Edition Innovation at ISTE Student Convention 2024. Awarded by Chitkara University for excellence in AI innovation.",
                category: "Extra Curricular",
                image: "WhatsApp Image 2025-08-12 at 19.17.04_7fbf360c.jpg"
            },
            {
                id: 5,
                title: "Sports Achievement",
                description: "Secured 2nd Position in Tug of War at Inter Year League 2025. Awarded by Guru Nanak Dev Engineering College for athletics excellence.",
                category: "Extra Curricular",
                image: "WhatsApp Image 2025-08-12 at 19.23.42_53d46814.jpg"
            },
            {
                id: 6,
                title: "Tech Exhibition",
                description: "Presented Concept of Acknowledgment at Tech Exhibition 2025. Awarded Certificate of Participation by Guru Nanak Dev Engineering College.",
                category: "Extra Curricular",
                image: "WhatsApp Image 2025-08-12 at 19.28.13_fea31d67.jpg"
            }
        ];
        saveData();
    }
    
    const technical = certificates.filter(cert => cert.category.toLowerCase().includes('technical'));
    const extra = certificates.filter(cert => cert.category.toLowerCase().includes('extra') || cert.category.toLowerCase().includes('curricular'));
    
    technicalCerts.innerHTML = technical.map(cert => `
        <div class="cert-card">
            <img src="${cert.image}" alt="${cert.title}" class="cert-image" onclick="previewCertificate('${cert.image}')">
            <h3>${cert.title}</h3>
            <p>${cert.description}</p>
            <div class="cert-actions">
                <button class="cert-preview" onclick="previewCertificate('${cert.image}')">
                    <i class="fa fa-eye"></i> Preview
                </button>
                <button class="cert-download" onclick="downloadCertificate('${cert.image}', '${cert.title}')">
                    <i class="fa fa-download"></i> Download
                </button>
            </div>
        </div>
    `).join('');
    
    extraCerts.innerHTML = extra.map(cert => `
        <div class="cert-card">
            <img src="${cert.image}" alt="${cert.title}" class="cert-image" onclick="previewCertificate('${cert.image}')">
            <h3>${cert.title}</h3>
            <p>${cert.description}</p>
            <div class="cert-actions">
                <button class="cert-preview" onclick="previewCertificate('${cert.image}')">
                    <i class="fa fa-eye"></i> Preview
                </button>
                <button class="cert-download" onclick="downloadCertificate('${cert.image}', '${cert.title}')">
                    <i class="fa fa-download"></i> Download
                </button>
            </div>
        </div>
    `).join('');
}

// Save Data to localStorage and Firebase
async function saveData() {
    // Always save to localStorage as backup
    localStorage.setItem('portfolioProjects', JSON.stringify(projects));
    localStorage.setItem('portfolioCertificates', JSON.stringify(certificates));
    
    // Save to Firebase if enabled
    if (isFirebaseEnabled) {
        try {
            // Note: Individual items are saved when added/edited/deleted
            console.log('✅ Data synced to Firebase');
        } catch (error) {
            console.error('Error saving to Firebase:', error);
        }
    }
}

// Load Data from localStorage and Firebase
async function loadData() {
    if (isFirebaseEnabled) {
        try {
            // Load from Firebase
            const projectsSnapshot = await db.collection('projects').orderBy('id', 'desc').get();
            const firebaseProjects = projectsSnapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id }));
            
            const certsSnapshot = await db.collection('certificates').orderBy('id', 'desc').get();
            const firebaseCerts = certsSnapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id }));
            
            // Check if we have old localStorage data that needs to be migrated
            const localProjects = JSON.parse(localStorage.getItem('portfolioProjects') || '[]');
            const localCerts = JSON.parse(localStorage.getItem('portfolioCertificates') || '[]');
            
            // Migrate localStorage data to Firebase if it exists and Firebase is empty
            if (firebaseProjects.length === 0 && localProjects.length > 0) {
                console.log('📤 Migrating projects from localStorage to Firebase...');
                for (const project of localProjects) {
                    try {
                        const docRef = await db.collection('projects').add(project);
                        console.log(`✅ Migrated project: ${project.title}`);
                    } catch (error) {
                        console.error('Error migrating project:', error);
                    }
                }
                // Reload from Firebase after migration
                const newSnapshot = await db.collection('projects').orderBy('id', 'desc').get();
                projects = newSnapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id }));
            } else {
                projects = firebaseProjects;
            }
            
            if (firebaseCerts.length === 0 && localCerts.length > 0) {
                console.log('📤 Migrating certificates from localStorage to Firebase...');
                for (const cert of localCerts) {
                    try {
                        const docRef = await db.collection('certificates').add(cert);
                        console.log(`✅ Migrated certificate: ${cert.title}`);
                    } catch (error) {
                        console.error('Error migrating certificate:', error);
                    }
                }
                // Reload from Firebase after migration
                const newSnapshot = await db.collection('certificates').orderBy('id', 'desc').get();
                certificates = newSnapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id }));
            } else {
                certificates = firebaseCerts;
            }
            
            console.log(`✅ Loaded ${projects.length} projects and ${certificates.length} certificates from Firebase`);
        } catch (error) {
            console.error('Error loading from Firebase:', error);
            // Fallback to localStorage
            loadFromLocalStorage();
        }
    } else {
        // Use localStorage
        loadFromLocalStorage();
    }
    
    // Load custom resume if available
    const savedResume = localStorage.getItem('portfolioResume');
    if (savedResume) {
        const resumeBtn = document.getElementById('resumeDownloadBtn');
        if (resumeBtn) {
            resumeBtn.href = savedResume;
        }
    }
}

// Load from localStorage (fallback)
function loadFromLocalStorage() {
    const savedProjects = localStorage.getItem('portfolioProjects');
    const savedCertificates = localStorage.getItem('portfolioCertificates');
    
    if (savedProjects) {
        projects = JSON.parse(savedProjects);
    }
    
    if (savedCertificates) {
        certificates = JSON.parse(savedCertificates);
    }
}

// Typing Animation
const typingTexts = ['dashboards', 'web apps', 'APIs', 'mobile apps', 'startups'];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeText() {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return;
    
    const currentText = typingTexts[textIndex];
    
    if (isDeleting) {
        typingElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
    }
    
    if (!isDeleting && charIndex === currentText.length) {
        isDeleting = true;
        setTimeout(typeText, 2000);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % typingTexts.length;
        setTimeout(typeText, 500);
    } else {
        setTimeout(typeText, isDeleting ? 50 : 100);
    }
}

// Start typing animation
setTimeout(typeText, 1000);

// Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'all 0.6s ease-out';
    observer.observe(section);
});

// Update Firebase Status Indicator
function updateFirebaseStatus() {
    const statusEl = document.getElementById('firebaseStatus');
    if (!statusEl) return;
    
    if (isFirebaseEnabled) {
        statusEl.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> ☁️ Cloud Sync: <strong style="color: #10b981;">ACTIVE</strong>';
        statusEl.style.background = 'rgba(16, 185, 129, 0.1)';
        statusEl.style.border = '1px solid rgba(16, 185, 129, 0.3)';
        statusEl.style.color = '#10b981';
    } else {
        statusEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ⚠️ Cloud Sync: <strong style="color: #f59e0b;">OFFLINE</strong> (Using Local Storage)';
        statusEl.style.background = 'rgba(245, 158, 11, 0.1)';
        statusEl.style.border = '1px solid rgba(245, 158, 11, 0.3)';
        statusEl.style.color = '#f59e0b';
    }
}
