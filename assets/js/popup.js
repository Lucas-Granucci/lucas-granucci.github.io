// Popup functionality
const popup = {
    async open(project, clickedCard) {
        const overlay = document.createElement("div");
        overlay.className = "project-popup-overlay";

        const popup = document.createElement("div");
        popup.className = "project-popup";

        // Store original card position and dimensions
        const cardRect = clickedCard.getBoundingClientRect();
        
        // Set initial popup position and size to match the card
        Object.assign(popup.style, {
            position: 'fixed',
            left: `${cardRect.left}px`,
            top: `${cardRect.top}px`,
            width: `${cardRect.width}px`,
            height: `${cardRect.height}px`,
            transformOrigin: 'top left',
            overflow: 'hidden'
        });

        // Load markdown content
        const markdown = await this.loadMarkdown(project.markdownDesc);
        const mdHTML = marked.parse(markdown);

        popup.innerHTML = this.getPopupHTML(project, mdHTML);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        this.setupPopupStyles();
        this.animatePopupOpen(popup, overlay, clickedCard);
        this.setupPopupEvents(overlay, popup, clickedCard, cardRect);
    },

    async loadMarkdown(url) {
        try {
            const resp = await fetch(url);
            return await resp.text();
        } catch (err) {
            return "_Failed to load project details._";
        }
    },

    getPopupHTML(project, markdownHTML) {
        const gitHubHTML = project.githubUrl ? `
            <a href="${project.githubUrl}" target="_blank" class="github-link popup-github" title="View on GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="github-icon">
                    <path d="M12 0C5.37 0 0 5.37 0 12a12 12 0 008.21 11.44c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.38-1.34-1.75-1.34-1.75-1.1-.75.09-.74.09-.74 1.21.09 1.85 1.25 1.85 1.25 1.08 1.85 2.84 1.32 3.53 1.01.11-.78.42-1.32.76-1.63-2.67-.3-5.47-1.34-5.47-5.94 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.46 11.46 0 016 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.62-2.81 5.63-5.49 5.93.43.37.82 1.1.82 2.23v3.3c0 .32.22.7.83.58A12 12 0 0024 12C24 5.37 18.63 0 12 0z"/>
                </svg>
            </a>
        ` : "";

        return `
            <div class="popup-content">
                <img src="${project.image}" alt="${project.title}" class="popup-image">
                <div class="popup-bar">
                    <h2 class="popup-title">${project.title}</h2>
                    <div class="tools">
                        ${project.tools.map((t) => `<span class="tool-tag">${t}</span>`).join("")}
                    </div>
                    ${gitHubHTML}
                </div>
                <div class="popup-markdown markdown-body">
                    ${markdownHTML}
                </div>
            </div>
        `;
    },

    setupPopupStyles() {
        document.body.style.overflow = 'hidden';
        document.body.classList.add('popup-open');
    },

    animatePopupOpen(popup, overlay, clickedCard) {
        clickedCard.style.visibility = 'hidden';
        popup.offsetHeight; // Force reflow

        requestAnimationFrame(() => {
            overlay.classList.add("visible");
            
            const finalRect = {
                left: (window.innerWidth - Math.min(1000, window.innerWidth * 0.9)) / 2,
                top: (window.innerHeight - Math.min(window.innerHeight * 0.85, 800)) / 2,
                width: Math.min(1000, window.innerWidth * 0.9),
                height: Math.min(window.innerHeight * 0.85, 800)
            };

            Object.assign(popup.style, {
                left: `${finalRect.left}px`,
                top: `${finalRect.top}px`,
                width: `${finalRect.width}px`,
                height: `${finalRect.height}px`,
                borderRadius: '10px'
            });
        });

        setTimeout(() => {
            popup.style.overflow = 'auto';
        }, 400);
    },

    setupPopupEvents(overlay, popup, clickedCard, cardRect) {
        const handleEscKey = (e) => {
            if (e.key === "Escape") this.close(overlay, popup, clickedCard, cardRect);
        };

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) this.close(overlay, popup, clickedCard, cardRect);
        });

        document.addEventListener("keydown", handleEscKey);
        
        // Store close function with the overlay for cleanup
        overlay._closeHandler = () => this.close(overlay, popup, clickedCard, cardRect);
        overlay._escHandler = handleEscKey;
    },

    close(overlay, popup, clickedCard, cardRect) {
        popup.style.overflow = 'hidden';
        
        Object.assign(popup.style, {
            left: `${cardRect.left}px`,
            top: `${cardRect.top}px`,
            width: `${cardRect.width}px`,
            height: `${cardRect.height}px`,
            borderRadius: '10px'
        });
        
        overlay.classList.remove("visible");
        
        setTimeout(() => {
            overlay.remove();
            clickedCard.style.visibility = 'visible';
            document.body.style.overflow = '';
            document.body.classList.remove('popup-open');
            
            // Clean up event listeners
            if (overlay._escHandler) {
                document.removeEventListener("keydown", overlay._escHandler);
            }
        }, 400);
    }
};