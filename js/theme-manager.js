// Shared theme manager that all pages can use
const ThemeManager = {
  // ... (same implementation as above)
};

// Make it available globally
window.ThemeManager = ThemeManager;

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
  // Load saved preferences
  const savedTheme = localStorage.getItem('appTheme') || 'default';
  const darkMode = localStorage.getItem('darkMode') === 'true';
  
  // Apply settings
  ThemeManager.applyTheme(savedTheme);
  document.body.classList.toggle('dark', darkMode);
  document.getElementById('darkModeToggle').checked = darkMode;
});