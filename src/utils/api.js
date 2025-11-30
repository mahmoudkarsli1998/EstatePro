import { projects, units, leads, developers, agents, users } from '../data/mockData';

export const api = {
  // Projects
  getProjects: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(projects), 800);
    });
  },
  
  getProjectById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const project = projects.find(p => p.id === parseInt(id));
        project ? resolve(project) : reject('Project not found');
      }, 500);
    });
  },
  
  createProject: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProject = { ...data, id: Date.now() };
        projects.push(newProject);
        resolve(newProject);
      }, 1000);
    });
  },
  
  // Units
  getUnits: (projectId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = projectId 
          ? units.filter(u => u.projectId === parseInt(projectId))
          : units;
        resolve(filtered);
      }, 600);
    });
  },

  getUnitById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const unit = units.find(u => u.id === parseInt(id));
        unit ? resolve(unit) : reject('Unit not found');
      }, 500);
    });
  },
  
  // Leads
  getLeads: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(leads), 600);
    });
  },

  createLead: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newLead = { 
          ...data, 
          id: Date.now(),
          status: 'new',
          createdAt: new Date().toISOString()
        };
        leads.push(newLead);
        resolve(newLead);
      }, 800);
    });
  },

  // Developers
  getDevelopers: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(developers), 500);
    });
  },

  // Agents
  getAgents: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(agents), 500);
    });
  },

  // Users
  getUsers: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(users), 500);
    });
  },

  // Auth (Mock)
  login: (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(u => u.email === email);
        if (user) {
          resolve({ user, token: 'mock-jwt-token' });
        } else {
          reject('Invalid credentials');
        }
      }, 1000);
    });
  }
};
