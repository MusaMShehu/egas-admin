import React, { useState, useEffect } from 'react';
import SupportTicketList from './SupportTicketList';
import SupportTicketDetails from './SupportTicketDetails';
import SupportTicketFilters from './SupportTicketFilters';
import { adminAPI } from '../../../api/endpoints';
import { useSnackbar } from '../../../hooks/useSnackbar';
import './SupportManagement.css';

const SupportManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [view, setView] = useState('list');
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    search: ''
  });
  const [actionLoading, setActionLoading] = useState(false);

  const { success, error: showError } = useSnackbar();

  useEffect(() => {
    fetchTickets();
  }, [filters.status, filters.category]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTickets();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [filters.search]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
        limit: 50
      };

      const response = await adminAPI.support.getAll(params);
      const data = response.data
      if (data.success) {
        setTickets(data.data?.tickets || data.tickets || []);
      } else {
        setError(data.message || 'Failed to fetch support tickets');
      }
    } catch (err) {
      console.error('Fetch tickets error:', err);
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    setActionLoading(true);
    try {
      const response = await adminAPI.support.updateStatus(ticketId, newStatus);
      const data = response.data
      if (data.success) {
        success('Ticket status updated successfully');
        
        // Update local state
        setTickets(tickets.map(ticket => 
          ticket._id === ticketId ? { ...ticket, status: newStatus } : ticket
        ));
        
        if (selectedTicket && selectedTicket._id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: newStatus });
        }
        
        return { success: true };
      } else {
        showError(data.message || 'Failed to update ticket status');
        return { success: false, message: data.message };
      }
    } catch (err) {
      showError(err.message || 'Network error');
      return { success: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  const addResponse = async (ticketId, message, attachments = []) => {
    setActionLoading(true);
    try {
      const response = await adminAPI.support.addResponse(ticketId, message, attachments);
      const data = response.data
      if (data.success) {
        success('Response added successfully');
        
        // Update local state with the new response
        const updatedTicket = data.data?.ticket || data.ticket;
        setTickets(tickets.map(ticket => 
          ticket._id === ticketId ? updatedTicket : ticket
        ));
        
        if (selectedTicket && selectedTicket._id === ticketId) {
          setSelectedTicket(updatedTicket);
        }
        
        return { success: true };
      } else {
        showError(data.message || 'Failed to add response');
        return { success: false, message: data.message };
      }
    } catch (err) {
      showError(err.message || 'Network error');
      return { success: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await adminAPI.support.getById(ticketId);
      const data = response.data
      if (data.success) {
        return data.data?.ticket || data.ticket;
      } else {
        throw new Error(data.message || 'Failed to fetch ticket details');
      }
    } catch (err) {
      console.error('Fetch ticket details error:', err);
      throw err;
    }
  };

  const handleViewTicket = async (ticket) => {
    try {
      // Fetch fresh ticket data to ensure we have the latest responses
      const freshTicket = await fetchTicketDetails(ticket._id);
      setSelectedTicket(freshTicket);
      setView('details');
    } catch (err) {
      // If fetching fresh data fails, use the existing ticket data
      console.warn('Could not fetch fresh ticket data, using cached data:', err);
      setSelectedTicket(ticket);
      setView('details');
    }
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedTicket(null);
    fetchTickets();
  };

  const handleRefresh = () => {
    fetchTickets();
  };

  // Filter tickets locally for immediate UI updates
  const filteredTickets = tickets.filter(ticket => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        ticket.ticketId?.toLowerCase().includes(searchTerm) ||
        ticket.subject?.toLowerCase().includes(searchTerm) ||
        ticket.user?.firstName?.toLowerCase().includes(searchTerm) ||
        ticket.user?.lastName?.toLowerCase().includes(searchTerm) ||
        ticket.user?.email?.toLowerCase().includes(searchTerm);
      
      if (!matchesSearch) return false;
    }
    return true;
  });

  if (view === 'details' && selectedTicket) {
    return (
      <SupportTicketDetails
        ticket={selectedTicket}
        onBack={handleBackToList}
        onUpdateTicketStatus={updateTicketStatus}
        onAddResponse={addResponse}
        loading={actionLoading}
      />
    );
  }

  return (
    <div className="support-management">
      <div className="support-header">
        <h1>Support Ticket Management</h1>
        <div className="header-actions">
          <button 
            onClick={handleRefresh} 
            className="btn-refresh"
            disabled={loading}
          >
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i> 
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <SupportTicketFilters 
        filters={filters} 
        onFilterChange={setFilters} 
      />
      
      <SupportTicketList
        tickets={filteredTickets}
        loading={loading}
        error={error}
        onViewTicket={handleViewTicket}
        onUpdateTicketStatus={updateTicketStatus}
        loading={actionLoading}
      />
    </div>
  );
};

export default SupportManagement;