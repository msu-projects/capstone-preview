/**
 * Main JavaScript Utilities
 * Core functionality for South Cotabato Data Bank
 */

// ===== UTILITY FUNCTIONS =====

/**
 * Format date to readable string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

/**
 * Format number with commas
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format currency values with peso prefix by default
 */
function formatCurrency(value, options = {}) {
  const amount = Number(value ?? 0);
  const { prefix = "₱", decimals = 2 } = options;
  return `${prefix}${formatNumber(amount.toFixed(decimals))}`;
}

/**
 * Format percentage values with configurable decimals
 */
function formatPercent(value, decimals = 2) {
  const amount = Number(value ?? 0);
  return `${amount.toFixed(decimals)}%`;
}

/**
 * Format percentage values with explicit +/- sign
 */
function formatSignedPercent(value, decimals = 2) {
  const amount = Number(value ?? 0);
  const sign = amount > 0 ? "+" : "";
  return `${sign}${amount.toFixed(decimals)}%`;
}

/**
 * Get status badge class
 */
function getStatusBadgeClass(status) {
  const statusMap = {
    planning: "badge-status-planning",
    in_progress: "badge-status-progress",
    completed: "badge-status-completed",
    suspended: "badge-status-suspended",
  };
  return statusMap[status] || "badge-default";
}

/**
 * Get status label
 */
function getStatusLabel(status) {
  const labelMap = {
    planning: "Planning",
    in_progress: "In Progress",
    completed: "Completed",
    suspended: "Suspended",
  };
  return labelMap[status] || status;
}

/**
 * Truncate text to specified length
 */
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + "...";
}

/**
 * Debounce function for search inputs
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===== MODAL UTILITIES =====

/**
 * Show modal
 */
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
}

/**
 * Hide modal
 */
function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
}

/**
 * Initialize modal close buttons
 */
function initModals() {
  // Close on overlay click
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        overlay.classList.add("hidden");
        document.body.style.overflow = "";
      }
    });
  });

  // Close on close button click
  document.querySelectorAll("[data-modal-close]").forEach((btn) => {
    btn.addEventListener("click", function () {
      const modalId = this.getAttribute("data-modal-close");
      hideModal(modalId);
    });
  });

  // Open on trigger button click
  document.querySelectorAll("[data-modal-open]").forEach((btn) => {
    btn.addEventListener("click", function () {
      const modalId = this.getAttribute("data-modal-open");
      showModal(modalId);
    });
  });
}

// ===== TABLE UTILITIES =====

/**
 * Simple table search
 */
function searchTable(tableId, searchValue) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const rows = table.querySelectorAll("tbody tr");
  const searchTerm = searchValue.toLowerCase();

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "" : "none";
  });
}

/**
 * Sort table by column
 */
function sortTable(tableId, columnIndex, order = "asc") {
  const table = document.getElementById(tableId);
  if (!table) return;

  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  rows.sort((a, b) => {
    const aValue = a.children[columnIndex].textContent.trim();
    const bValue = b.children[columnIndex].textContent.trim();

    if (order === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  rows.forEach((row) => tbody.appendChild(row));
}

// ===== FORM UTILITIES =====

/**
 * Validate form
 */
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;

  let isValid = true;

  // Check required fields
  form.querySelectorAll("[required]").forEach((field) => {
    if (!field.value.trim()) {
      field.classList.add("error");
      isValid = false;
    } else {
      field.classList.remove("error");
    }
  });

  return isValid;
}

/**
 * Reset form
 */
function resetForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.reset();
  form.querySelectorAll(".error").forEach((field) => {
    field.classList.remove("error");
  });
}

// ===== FILE UPLOAD UTILITIES =====

/**
 * Initialize file upload drag and drop
 */
function initFileUpload(uploadAreaId, fileInputId, onFileSelect) {
  const uploadArea = document.getElementById(uploadAreaId);
  const fileInput = document.getElementById(fileInputId);

  if (!uploadArea || !fileInput) return;

  uploadArea.addEventListener("click", () => fileInput.click());

  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");

    const files = e.dataTransfer.files;
    if (files.length > 0 && onFileSelect) {
      onFileSelect(files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    const files = e.target.files;
    if (files.length > 0 && onFileSelect) {
      onFileSelect(files[0]);
    }
  });
}

// ===== TOAST NOTIFICATIONS =====

/**
 * Show toast notification
 */
function showToast(message, type = "info", duration = 3000) {
  const toast = document.createElement("div");
  toast.className = `alert alert-${type}`;
  toast.style.cssText =
    "position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px; animation: slideInRight 0.3s ease;";
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <i data-lucide="${getToastIcon(
        type
      )}" style="width: 20px; height: 20px;"></i>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(toast);

  // Re-initialize icons for the toast
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  setTimeout(() => {
    toast.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function getToastIcon(type) {
  const iconMap = {
    info: "info",
    success: "check-circle",
    warning: "alert-triangle",
    danger: "alert-circle",
  };
  return iconMap[type] || "info";
}

// ===== LOCAL STORAGE UTILITIES =====

/**
 * Save to local storage
 */
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Error saving to localStorage:", e);
    return false;
  }
}

/**
 * Get from local storage
 */
function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error("Error reading from localStorage:", e);
    return defaultValue;
  }
}

/**
 * Remove from local storage
 */
function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error("Error removing from localStorage:", e);
    return false;
  }
}

// ===== PAGINATION UTILITIES =====

/**
 * Create pagination
 */
function createPagination(totalItems, itemsPerPage, currentPage, onPageChange) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pagination = document.createElement("div");
  pagination.className = "pagination";

  // Previous button
  const prevBtn = document.createElement("button");
  prevBtn.className = "pagination-btn";
  prevBtn.innerHTML = '<i data-lucide="chevron-left"></i>';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => onPageChange(currentPage - 1));
  pagination.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 2 && i <= currentPage + 2)
    ) {
      const pageBtn = document.createElement("button");
      pageBtn.className = `pagination-btn ${i === currentPage ? "active" : ""}`;
      pageBtn.textContent = i;
      pageBtn.addEventListener("click", () => onPageChange(i));
      pagination.appendChild(pageBtn);
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      const dots = document.createElement("span");
      dots.textContent = "...";
      dots.style.padding = "0.5rem";
      pagination.appendChild(dots);
    }
  }

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.className = "pagination-btn";
  nextBtn.innerHTML = '<i data-lucide="chevron-right"></i>';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => onPageChange(currentPage + 1));
  pagination.appendChild(nextBtn);

  // Re-initialize icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  return pagination;
}

// ===== INITIALIZATION =====

document.addEventListener("DOMContentLoaded", function () {
  // Initialize modals
  initModals();

  console.log("Main utilities initialized");
});

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
