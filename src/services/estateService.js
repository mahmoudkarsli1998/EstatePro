import apiClient from './apiClient';

export const estateService = {
  // Projects
  getProjects: async (params) => {
    const res = await apiClient.get('/projects');
    const data = Array.isArray(res) ? res : (res?.data || res?.items || []);
    if (params) {
       let result = data;
       if (params.status) result = result.filter(p => p.status === params.status);
       if (params.limit) result = result.slice(0, params.limit); 
       return result;
    }
    return data;
  },
  createProject: (data) => apiClient.post('/projects', data),
  getProjectById: (id) => apiClient.get(`/projects/${id}`),
  getProjectBySlug: (slug) => apiClient.get(`/projects/slug/${slug}`),
  updateProject: (id, data) => apiClient.patch(`/projects/${id}`, data),
  deleteProject: (id) => apiClient.delete(`/projects/${id}`),
  getProjectUnits: async (id) => {
      const res = await apiClient.get(`/projects/${id}/units`);
      if (Array.isArray(res)) return res;
      if (res?.units && Array.isArray(res.units)) return res.units;
      return res?.data || res?.items || [];
  },
  getProjectBlocks: async (id) => {
      try {
        // 1. Try specific endpoint
        const res = await apiClient.get(`/projects/${id}/blocks`);
        if (Array.isArray(res) && res.length > 0) return res;
        if (res?.blocks && Array.isArray(res.blocks) && res.blocks.length > 0) return res.blocks;
      } catch (e) {
          // Continue to fallback
      }
      
      try {
         // 2. Try embedded in project
         const project = await apiClient.get(`/projects/${id}`);
         if (project.blocks && Array.isArray(project.blocks) && project.blocks.length > 0) return project.blocks;
      } catch (inner) { 
          // Continue
      }

      // 3. Last check: Fetch all blocks and filter (in case unrelated)
      try {
         const allRes = await apiClient.get('/blocks');
         const all = Array.isArray(allRes) ? allRes : (allRes?.data || allRes?.items || []);
         return all.filter(b => String(b.projectId) === String(id) || (b.project && (String(b.project.id) === String(id) || String(b.project) === String(id))));
      } catch (e) {
         return [];
      }
  },
  getProjectPhases: async (id) => {
      try {
        const res = await apiClient.get(`/projects/${id}/phases`);
        if (Array.isArray(res)) return res;
        if (res?.phases && Array.isArray(res.phases)) return res.phases;
        return res?.data || res?.items || [];
      } catch (e) {
          // Fallback to project fetch
          try {
            const project = await apiClient.get(`/projects/${id}`);
            return project.phases || [];
          } catch (inner) { return []; }
      }
  },
  getProjectLeads: (id) => apiClient.get(`/projects/${id}/leads`),
  getProjectStats: (id) => apiClient.get(`/projects/${id}/stats`),
  updateProjectStatus: (id, status) => apiClient.patch(`/projects/${id}/status`, { status }),
  addProjectPhase: (id, data) => apiClient.post(`/projects/${id}/phases`, data),
  updateProjectPhase: (id, phaseId, data) => apiClient.patch(`/projects/${id}/phases/${phaseId}`, data),
  deleteProjectPhase: (id, phaseId) => apiClient.delete(`/projects/${id}/phases/${phaseId}`),

  // Units
  getUnits: async (params) => {
    // Use server-side filtering for projectId if provided, as per API Ref
    const query = {};
    if (params?.projectId) query.projectId = params.projectId;

    const res = await apiClient.get('/units', { params: query });
    const data = Array.isArray(res) ? res : (res?.data || res?.items || []);
    
    if (params) {
        let result = data;
        
        // Client-side filtering for remaining params (Status, Price, Pagination)
        // Note: We skip projectId filtering here if handled by backend, but redundant check is safe
        if (params.projectId && !query.projectId) { 
             // Logic if backend didn't handle it
             result = result.filter(u => (u.projectId == params.projectId) || (u.project == params.projectId));
        }

        if (params.status) result = result.filter(u => u.status === params.status);
        if (params.minPrice) result = result.filter(u => u.price >= params.minPrice);
        if (params.maxPrice) result = result.filter(u => u.price <= params.maxPrice);
        
        // Handle pagination (Mock)
        if (params.page && params.limit) {
            const start = (params.page - 1) * params.limit;
            const end = start + params.limit;
            return {
                data: result.slice(start, end),
                total: result.length,
                page: params.page,
                totalPages: Math.ceil(result.length / params.limit)
            };
        }
        return result;
    }
    return data;
  },
  createUnit: (data) => apiClient.post('/units', data),
  getUnitById: (id) => apiClient.get(`/units/${id}`),
  updateUnit: (id, data) => apiClient.patch(`/units/${id}`, data),
  deleteUnit: (id) => apiClient.delete(`/units/${id}`),
  updateUnitStatus: (id, status) => apiClient.patch(`/units/${id}/status`, { status }),
  reserveUnit: (id, data) => apiClient.post(`/units/${id}/reserve`, data),
  cancelReservation: (id) => apiClient.post(`/units/${id}/cancel-reservation`),
  sellUnit: (id, data) => apiClient.post(`/units/${id}/sell`, data),
  getUnitLeads: (id) => apiClient.get(`/units/${id}/leads`),
  searchUnits: (params) => apiClient.get('/units/search', { params }),
  searchUnits: (params) => apiClient.get('/units/search', { params }),
  getAvailableUnits: () => apiClient.get('/units/available'),
  registerUnitView: (id) => apiClient.post(`/units/${id}/view`),

  // Blocks
  getBlocks: async (params) => {
      const res = await apiClient.get('/blocks');
      const all = Array.isArray(res) ? res : (res?.data || res?.items || []);
      if (params?.projectId) return all.filter(b => b.projectId == params.projectId);
      return all;
  },
  createBlock: (data) => apiClient.post('/blocks', data),
  getBlockById: (id) => apiClient.get(`/blocks/${id}`),
  updateBlock: (id, data) => apiClient.patch(`/blocks/${id}`, data),
  deleteBlock: (id) => apiClient.delete(`/blocks/${id}`),
  getBlockUnits: (id) => apiClient.get(`/blocks/${id}/units`),

  // Locations
  getLocations: () => apiClient.get('/locations'),
  createLocation: (data) => apiClient.post('/locations', data),
  getLocationById: (id) => apiClient.get(`/locations/${id}`),
  updateLocation: (id, data) => apiClient.patch(`/locations/${id}`, data),
  deleteLocation: (id) => apiClient.delete(`/locations/${id}`),
  getLocationBySlug: (slug) => apiClient.get(`/locations/slug/${slug}`),
  getNearbyLocations: (params) => apiClient.get('/locations/nearby', { params }),

  // Developers
  getDevelopers: () => apiClient.get('/developers'),
  createDeveloper: (data) => apiClient.post('/developers', data),
  getDeveloperById: (id) => apiClient.get(`/developers/${id}`),
  updateDeveloper: (id, data) => apiClient.patch(`/developers/${id}`, data),
  deleteDeveloper: (id) => apiClient.delete(`/developers/${id}`),
};
