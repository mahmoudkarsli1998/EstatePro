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

  deleteProject: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = projects.findIndex(p => p.id === parseInt(id));
        if (index > -1) projects.splice(index, 1);
        resolve({ success: true });
      }, 800);
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

  updateLead: (id, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lead = leads.find(l => l.id === parseInt(id));
        if (lead) Object.assign(lead, data);
        resolve(lead);
      }, 600);
    });
  },

  deleteLead: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = leads.findIndex(l => l.id === parseInt(id));
        if (index > -1) leads.splice(index, 1);
        resolve({ success: true });
      }, 600);
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

  updateUser: (id, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = users.find(u => u.id === parseInt(id));
        if (user) Object.assign(user, data);
        resolve(user);
      }, 600);
    });
  },

  deleteUser: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = users.findIndex(u => u.id === parseInt(id));
        if (index > -1) users.splice(index, 1);
        resolve({ success: true });
      }, 600);
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
