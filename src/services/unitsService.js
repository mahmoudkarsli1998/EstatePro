import apiClient from './apiClient';
import { estateService } from './estateService';

/**
 * Dedicated service for Unit operations
 * Bridges to estateService for shared logic but provides a clean API for status management
 */
export const unitsService = {
    /**
     * Get a single unit by ID
     */
    getById: (id) => estateService.getUnitById(id),

    /**
     * Reserve a unit
     * @param {string} id - Unit ID
     * @param {object} data - Optional reservation details (customer id, notes, etc)
     */
    reserve: (id, data = {}) => estateService.reserveUnit(id, data),

    /**
     * Mark a unit as sold
     * @param {string} id - Unit ID
     * @param {object} data - Optional sale details (price, date, customer)
     */
    sell: (id, data = {}) => estateService.sellUnit(id, data),

    /**
     * Cancel a reservation and return unit to 'available'
     * @param {string} id - Unit ID
     */
    cancelReservation: (id) => estateService.cancelReservation(id),

    /**
     * Generic status update fallback
     */
    updateStatus: (id, status) => estateService.updateUnitStatus(id, status)
};

export default unitsService;
