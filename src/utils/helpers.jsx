// // utils/helpers.js
// // Helper function to format dates
// export const formatDate = (dateString, includeTime = false) => {
//   const options = { 
//     year: 'numeric', 
//     month: 'short', 
//     day: 'numeric',
//     ...(includeTime && { hour: '2-digit', minute: '2-digit' })
//   };
//   return new Date(dateString).toLocaleDateString('en-US', options);
// };

// // Helper function to get status class
// export const getStatusClass = (status) => {
//   switch(status) {
//     case 'processing':
//     case 'pending':
//       return 'bg-yellow-100 text-yellow-800';
//     case 'completed':
//     case 'delivered':
//     case 'active':
//     case 'resolved':
//       return 'bg-green-100 text-green-800';
//     case 'cancelled':
//     case 'failed':
//       return 'bg-red-100 text-red-800';
//     default:
//       return 'bg-gray-100 text-gray-800';
//   }
// };

// // Helper function to get next month's date
// export const getNextMonthDate = () => {
//   const date = new Date();
//   date.setMonth(date.getMonth() + 1);
//   return date.toISOString().split('T')[0];
// };






















// src/utils/helpers.js
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' }),
  };
  return date.toLocaleDateString('en-US', options);
};

export const formatDateShort = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(num);
};

export const getStatusClass = (status) => {
  const statusMap = {
    processing: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    delivered: 'bg-green-100 text-green-800',
    active: 'bg-green-100 text-green-800',
    resolved: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    failed: 'bg-red-100 text-red-800',
    paused: 'bg-gray-100 text-gray-800',
    assigned: 'bg-blue-100 text-blue-800',
    accepted: 'bg-purple-100 text-purple-800',
    out_for_delivery: 'bg-orange-100 text-orange-800',
  };
  return statusMap[status] || 'bg-gray-100 text-gray-800';
};

export const getNextMonthDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split('T')[0];
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};