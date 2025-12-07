import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

/**
 * Custom hook for standard Dashboard CRUD operations.
 * 
 * @param {Function} fetcher - API function to fetch all items (e.g., api.getDevelopers)
 * @param {Function} creator - API function to create an item (e.g., api.createDeveloper)
 * @param {Function} updater - API function to update an item (e.g., api.updateDeveloper)
 * @param {Function} deleter - API function to delete an item (e.g., api.deleteDeveloper)
 * @param {Object} initialFormState - Initial state for the form
 * @param {Function} searchFilter - items.filter callback for search (item, searchTerm) => boolean
 * @returns {Object} CRUD controls and state
 */
export const useDashboardCrud = (
  fetcher,
  creator,
  updater,
  deleter,
  initialFormState,
  searchFilter
) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetcher();
      setItems(data);
    } catch (error) {
      console.error("Failed to load items", error);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      // Populate form data, assuming item keys match form keys
      // We merge initialFormState to ensure all keys exist even if item is partial
      setFormData({ ...initialFormState, ...item });
    } else {
      setEditingItem(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(initialFormState);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    try {
      if (editingItem) {
        if (updater) {
          await updater(editingItem.id, formData);
          // Optimistic or refresh? Let's refresh for consistency with mock delays
          await loadItems();
        }
      } else {
        if (creator) {
          await creator(formData);
          await loadItems();
        }
      }
      handleCloseModal();
    } catch (error) {
      console.error("Operation failed", error);
      alert("Operation failed. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (deleter) {
          await deleter(id);
          // Optimistic remove
          setItems(prev => prev.filter(item => item.id !== id));
        }
      } catch (error) {
        console.error("Delete failed", error);
        // Revert on fail? For now just alert
        alert("Delete failed.");
        loadItems();
      }
    }
  };

  const handleExport = (fileName, headers, rowMapper) => {
    const csvContent = [
      headers.join(","),
      ...filteredItems.map(rowMapper)
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredItems = items.filter(item => {
    if (searchFilter) return searchFilter(item, searchTerm);
    
    if (!searchTerm) return true;
    
    // Default search: check all string values
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return {
    items,
    filteredItems,
    loading,
    isModalOpen,
    editingItem,
    formData,
    searchTerm,
    setSearchTerm,
    setFormData,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCustomChange,
    handleSubmit,
    handleDelete,
    handleExport,
    refresh: loadItems
  };
};
