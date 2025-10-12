// Theme management
const theme = {
    current: localStorage.getItem("theme") || "light",

    init() {
        document.documentElement.setAttribute("data-theme", this.current);
    },

    toggle() {
        this.current = this.current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", this.current);
        localStorage.setItem("theme", this.current);
    }
};

// Initialize theme
theme.init();