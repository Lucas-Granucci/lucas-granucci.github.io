// Shared utilities and initialization
const utils = {
    // Debounce function for performance
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Safe query selector
    $: (selector, parent = document) => parent.querySelector(selector),
    $$: (selector, parent = document) => parent.querySelectorAll(selector),

    // Load JSON data
    loadJSON: async (url) => {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error loading JSON:', error);
            return null;
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio loaded successfully');
});