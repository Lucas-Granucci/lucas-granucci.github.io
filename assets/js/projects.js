// Project loading and card creation
const projects = {
    data: [],

    async init() {
        this.data = await utils.loadJSON('data/projects.json');
        
        if (document.querySelector('.projects-grid')) {
            this.loadAllProjects();
        }
        
        if (document.getElementById('featured-projects')) {
            this.loadFeaturedProjects();
        }
    },

    loadAllProjects() {
        const grid = document.querySelector('.projects-grid');
        if (!grid || !this.data) return;

        grid.innerHTML = '';
        this.data.projects.forEach(project => {
            grid.appendChild(this.createProjectCard(project));
        });
    },

    loadFeaturedProjects() {
        const container = document.getElementById('featured-projects');
        if (!container || !this.data) return;

        const projectIds = container.getAttribute('data-project-ids').split(',');
        const featuredProjects = projectIds.map(id => 
            this.data.projects.find(project => project.id === id)
        ).filter(project => project);

        container.innerHTML = '';
        featuredProjects.forEach(project => {
            container.appendChild(this.createFeaturedProjectCard(project));
        });
    },

    createProjectCard(project) {
        const card = document.createElement("div");
        card.className = "card project-card";
        card.onclick = (e) => popup.open(project, card);

        if (project.image) {
            const img = document.createElement("img");
            img.src = project.image;
            img.alt = `${project.title} preview`;
            img.className = "project-image";
            card.appendChild(img);
        }

        const content = document.createElement("div");
        content.className = "card-content";
        content.innerHTML = this.getProjectCardHTML(project);
        card.appendChild(content);

        return card;
    },

    createFeaturedProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'card featured-project-card';
        card.onclick = (e) => popup.open(project, card);
        card.innerHTML = this.getFeaturedProjectCardHTML(project);
        return card;
    },

    getProjectCardHTML(project) {
        return `
            <div class="project-header">
                <p class="project-title">${project.title}</p>
                ${project.githubUrl ? this.getGitHubLinkHTML(project.githubUrl) : ''}
            </div>
            <p class="project-description">${project.description}</p>
            <div class="tools">
                ${project.tools.map(t => `<span class="tool-tag">${t}</span>`).join("")}
            </div>
            <small class="project-date">${project.date}</small>
        `;
    },

    getFeaturedProjectCardHTML(project) {
        return `
            <div class="featured-project-header">
                <strong>${project.title}</strong>
                ${project.githubUrl ? this.getGitHubLinkHTML(project.githubUrl) : ''}
            </div>
            <p>${project.description}</p>
            <div class="tools">
                ${project.tools.map(tool => `<span class="tool-tag">${tool}</span>`).join('')}
            </div>
        `;
    },

    getGitHubLinkHTML(url) {
        return `
            <a href="${url}" target="_blank" class="github-link" title="View on GitHub" onclick="event.stopPropagation()">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="github-icon">
                    <path d="M12 0C5.37 0 0 5.37 0 12a12 12 0 008.21 11.44c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.38-1.34-1.75-1.34-1.75-1.1-.75.09-.74.09-.74 1.21.09 1.85 1.25 1.85 1.25 1.08 1.85 2.84 1.32 3.53 1.01.11-.78.42-1.32.76-1.63-2.67-.3-5.47-1.34-5.47-5.94 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.46 11.46 0 016 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.62-2.81 5.63-5.49 5.93.43.37.82 1.1.82 2.23v3.3c0 .32.22.7.83.58A12 12 0 0024 12C24 5.37 18.63 0 12 0z"/>
                </svg>
            </a>
        `;
    }
};

// Initialize projects when DOM is ready
document.addEventListener('DOMContentLoaded', () => projects.init());