import { projects, units, leads, developers, agents, users, blocks, managers, admins } from '../data/mockData';

export const api = {
  // Projects
  getProjects: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const optimizedProjects = projects.map(p => ({
          ...p,
          images: p.images.map(img => img.includes('?') ? img : `${img}?auto=format&fit=crop&w=800&q=80`)
        }));
        resolve(optimizedProjects);
      }, 800);
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

  updateProject: (id, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const project = projects.find(p => p.id === parseInt(id));
        if (project) Object.assign(project, data);
        resolve(project);
      }, 800);
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

  createUnit: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUnit = { 
          ...data, 
          id: Date.now(),
          images: data.images || [],
          features: data.features || { bedrooms: 0, bathrooms: 0 }
        };
        units.push(newUnit);
        
        // Update project stats
        const project = projects.find(p => p.id === parseInt(data.projectId));
        if (project) {
          project.stats.totalUnits++;
          project.stats.available++;
        }
        
        resolve(newUnit);
      }, 800);
    });
  },

  updateUnit: (id, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const unit = units.find(u => u.id === parseInt(id));
        if (unit) Object.assign(unit, data);
        resolve(unit);
      }, 600);
    });
  },

  deleteUnit: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = units.findIndex(u => u.id === parseInt(id));
        if (index > -1) {
          const unit = units[index];
          // Update project stats
          const project = projects.find(p => p.id === unit.projectId);
          if (project) {
            project.stats.totalUnits--;
            if (unit.status === 'available') project.stats.available--;
          }
          units.splice(index, 1);
        }
        resolve({ success: true });
      }, 600);
    });
  },

  getPhases: (projectId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const project = projects.find(p => p.id === parseInt(projectId));
        resolve(project ? project.phases : []);
      }, 500);
    });
  },

  createPhase: (projectId, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const project = projects.find(p => p.id === parseInt(projectId));
        if (project) {
          const newPhase = { ...data, id: Date.now() };
          if (!project.phases) project.phases = [];
          project.phases.push(newPhase);
          resolve(newPhase);
        }
      }, 800);
    });
  },

  deletePhase: (projectId, phaseId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const project = projects.find(p => p.id === parseInt(projectId));
        if (project && project.phases) {
          const index = project.phases.findIndex(p => p.id === parseInt(phaseId));
          if (index > -1) project.phases.splice(index, 1);
        }
        resolve({ success: true });
      }, 600);
    });
  },

  // Blocks
  getBlocks: (projectId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = projectId 
          ? blocks.filter(b => b.projectId === parseInt(projectId))
          : blocks;
        resolve(filtered);
      }, 500);
    });
  },

  createBlock: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newBlock = { ...data, id: Date.now() };
        blocks.push(newBlock);
        resolve(newBlock);
      }, 800);
    });
  },

  deleteBlock: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = blocks.findIndex(b => b.id === parseInt(id));
        if (index > -1) blocks.splice(index, 1);
        resolve({ success: true });
      }, 600);
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

  createDeveloper: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newDeveloper = { ...data, id: Date.now(), projects: [] };
        developers.push(newDeveloper);
        resolve(newDeveloper);
      }, 800);
    });
  },

  updateDeveloper: (id, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const developer = developers.find(d => d.id === parseInt(id));
        if (developer) Object.assign(developer, data);
        resolve(developer);
      }, 600);
    });
  },

  deleteDeveloper: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = developers.findIndex(d => d.id === parseInt(id));
        if (index > -1) developers.splice(index, 1);
        resolve({ success: true });
      }, 600);
    });
  },

  // Agents
  getAgents: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(agents), 500);
    });
  },

  createAgent: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAgent = { ...data, id: Date.now(), assignedProjects: [] };
        agents.push(newAgent);
        resolve(newAgent);
      }, 800);
    });
  },

  updateAgent: (id, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const agent = agents.find(a => a.id === parseInt(id));
        if (agent) Object.assign(agent, data);
        resolve(agent);
      }, 600);
    });
  },

  deleteAgent: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = agents.findIndex(a => a.id === parseInt(id));
        if (index > -1) agents.splice(index, 1);
        resolve({ success: true });
      }, 600);
    });
  },

  // Users
  getUsers: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(users), 500);
    });
  },

  inviteUser: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = { 
          ...data, 
          id: Date.now(), 
          isActive: false, 
          createdAt: new Date().toISOString(),
          inviteToken: Math.random().toString(36).substring(7)
        };
        users.push(newUser);
        resolve(newUser);
      }, 800);
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

  // Managers
  getManagers: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(managers), 500);
    });
  },

  createManager: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newManager = { ...data, id: Date.now(), joinDate: new Date().toISOString() };
        managers.push(newManager);
        resolve(newManager);
      }, 800);
    });
  },

  updateManager: (id, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const manager = managers.find(m => m.id === parseInt(id));
        if (manager) Object.assign(manager, data);
        resolve(manager);
      }, 600);
    });
  },

  deleteManager: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = managers.findIndex(m => m.id === parseInt(id));
        if (index > -1) managers.splice(index, 1);
        resolve({ success: true });
      }, 600);
    });
  },

  // Admins
  getAdmins: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(admins), 500);
    });
  },

  createAdmin: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAdmin = { ...data, id: Date.now(), lastLogin: new Date().toISOString() };
        admins.push(newAdmin);
        resolve(newAdmin);
      }, 800);
    });
  },

  updateAdmin: (id, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const admin = admins.find(a => a.id === parseInt(id));
        if (admin) Object.assign(admin, data);
        resolve(admin);
      }, 600);
    });
  },

  deleteAdmin: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = admins.findIndex(a => a.id === parseInt(id));
        if (index > -1) admins.splice(index, 1);
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
