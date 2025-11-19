/**
 * Lucide Icons Initialization
 * Auto-initialize all icons on page load
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
    console.log('Lucide icons initialized');
  } else {
    console.warn('Lucide library not loaded');
  }
});

/**
 * Manually refresh icons after dynamic content is added
 * Call this function after adding new content with data-lucide attributes
 */
function refreshIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Make refreshIcons available globally
window.refreshIcons = refreshIcons;
