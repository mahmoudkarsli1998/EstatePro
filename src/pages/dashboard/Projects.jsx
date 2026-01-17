import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Edit, Trash, Search, MapPin, Layers, Download, Home, Maximize, LayoutGrid, List, Upload, X, Box } from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import LocationPicker from '../../components/shared/LocationPicker';
import EntityImage from '../../components/shared/EntityImage';
import { estateService } from '../../services/estateService';
import { commonService } from '../../services/commonService';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../context/NotificationsContext';
import { uploadService } from '../../services/uploadService';

const Projects = () => {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const { createNotification } = useNotifications();
  const [viewMode, setViewMode] = useState('grid');
  const [cities, setCities] = useState([]);
  const [developers, setDevelopers] = useState([]);
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
        try {
            const [citiesData, developersData] = await Promise.all([
                commonService.getCities(),
                commonService.getDevelopers()
            ]);
            setCities(citiesData || []);
            setDevelopers(developersData || []);
        } catch (err) {
            console.error("Failed to load generic data", err);
        }
    };
    loadData();
  }, []);

  const {
    filteredItems: projects,
    loading,
    isModalOpen,
    editingItem,
    formData,
    setFormData,
    searchTerm,
    setSearchTerm,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleSubmit,
    handleDelete,
    handleExport,
    refresh
  } = useDashboardCrud(
    estateService.getProjects,
    estateService.createProject,
    estateService.updateProject,
    estateService.deleteProject,
    { 
      name: '', 
      description: '', 
      status: 'active',
      type: 'keys', 
      propertyType: 'residential', 
      listingType: 'sale',
      developer: '', 
      amenities: ["Pool", "Gym", "Security"], // Valid default to prevent null
      deliveryDate: '2026-12-31',
      location: { lat: 30.0444, lng: 31.2357 },
      address: '', 
      city: '', 
      priceRange: { min: 0, max: 0 },
      images: [],
      stats: { totalUnits: 0, available: 0, sold: 0 },
      phases: [] // Allow phases during creation
    },
    (proj, term) => proj.name.toLowerCase().includes(term.toLowerCase())
  );
  
  const location = useLocation();
  useEffect(() => {
    if (location.state?.openCreateModal && !loading) {
       handleOpenModal();
       window.history.replaceState({}, document.title);
    }
  }, [location.state, loading]);

  const [activeTab, setActiveTab] = useState('details');
  const [pendingUploads, setPendingUploads] = useState([]);

  const onExport = () => {
    handleExport(
      "projects_export.csv",
      ["ID", "Name", "Location", "Status", "Units", "Available"],
      p => [p.id, `"${p.name}"`, `"${p.address}"`, p.status, p.stats.totalUnits, p.stats.available].join(",")
    );
  };

  const handleModalCloseWrapper = () => {
    setActiveTab('details');
    handleCloseModal();
  };

  const handleAddPhase = async (e) => {
    // Prevent any form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const name = prompt("Enter Phase Name:");
    if (!name || !name.trim()) return;
    
    const newPhase = { 
      id: Date.now(), // Temporary ID for create mode
      name: name.trim(), 
      deliveryDate: "2026-01-01", 
      status: "planned" 
    };
    
    if (editingItem?.id) {
      // EDIT MODE: Save to API
      try {
        await estateService.addProjectPhase(editingItem.id, newPhase);
        refresh(); 
      } catch(err) {
        toast.error("Failed to add phase");
      }
    } else {
      // CREATE MODE: Store locally (don't submit form!)
      setPendingPhases(prev => [...prev, newPhase]);
    }
  };

  const handleDeletePhase = async (phaseId) => {
    if (!window.confirm("Delete this phase?")) return;
    
    if (editingItem?.id) {
      // EDIT MODE: Delete via API
      try {
        await estateService.deleteProjectPhase(editingItem.id, phaseId);
        refresh();
      } catch(err) {
        toast.error("Failed to delete phase");
      }
    } else {
      // CREATE MODE: Remove from local state
      setPendingPhases(prev => prev.filter(p => p.id !== phaseId));
      // Also remove blocks associated with this phase
      setPendingBlocks(prev => prev.filter(b => b.phaseId !== phaseId));
    }
  };

  // Image Handling
  // Image Handling
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Create local previews and store files
    const newEntries = files.map(file => ({
        file: file,
        url: URL.createObjectURL(file)
    }));

    setPendingUploads(prev => [...prev, ...newEntries]);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newEntries.map(e => e.url)] }));
  };

  const removeImage = (index) => {
    const imageToRemove = formData.images[index];
    
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    // If it's a blob (local file), remove from pending uploads too
    if (imageToRemove && imageToRemove.startsWith('blob:')) {
        setPendingUploads(prev => prev.filter(p => p.url !== imageToRemove));
        URL.revokeObjectURL(imageToRemove); // Cleanup memory
    }
  };

  // Move Stepper Logic here to be available for Block Handling
  const [currentStep, setCurrentStep] = useState(1);
  // Always show all steps including Phases and Blocks
  const steps = [
    { id: 1, title: t('basicInfo'), icon: Home },
    { id: 2, title: t('location'), icon: MapPin },
    { id: 3, title: t('details'), icon: List },
    { id: 4, title: t('media'), icon: Maximize },
    { id: 5, title: t('phases'), icon: Layers },
    { id: 6, title: t('blocks', 'Blocks'), icon: Box }
  ];

  // Pending phases/blocks for CREATE mode (stored locally before project exists)
  const [pendingPhases, setPendingPhases] = useState([]);
  const [pendingBlocks, setPendingBlocks] = useState([]);

  // Reset step and pending state when modal opens/closes
  useEffect(() => {
    if (isModalOpen) {
      setCurrentStep(1);
      // Reset pending states for create mode
      if (!editingItem) {
        setPendingPhases([]);
        setPendingBlocks([]);
        setPendingUploads([]);
      }
    }
  }, [isModalOpen, editingItem]);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Validation helper for Next button
  const isStepValid = () => {
    if (currentStep === 1) return formData.name && formData.description; 
    if (currentStep === 2) return formData.address && formData.city;
    // Add other strict checks if needed, or allow loose navigation
    return true; 
  };

  // Block Handling
  const [projectBlocks, setProjectBlocks] = useState([]);
  const [newBlockName, setNewBlockName] = useState('');
  const [newBlockPhase, setNewBlockPhase] = useState('');

  // Fetch blocks when entering the modal or when blocks step is active
  useEffect(() => {
    if (editingItem && isModalOpen) {
       // Refresh blocks list
       estateService.getProjectBlocks(editingItem.id).then(res => setProjectBlocks(res || [])).catch(console.error);
    }
  }, [editingItem, isModalOpen, currentStep]);

  const handleAddBlock = async () => {
    if (!newBlockName) return;
    
    const newBlock = {
      id: Date.now(), // Temporary ID for create mode
      name: newBlockName,
      phaseId: newBlockPhase ? parseInt(newBlockPhase) : null,
      status: 'active'
    };
    
    if (editingItem?.id) {
      // EDIT MODE: Save to API
      try {
        await estateService.createBlock({
          ...newBlock,
          projectId: editingItem.id
        });
        setNewBlockName('');
        setNewBlockPhase('');
        // Refresh local blocks list
        const updatedBlocks = await estateService.getProjectBlocks(editingItem.id);
        setProjectBlocks(updatedBlocks || []);
      } catch(err) {
        toast.error("Failed to add block");
        console.error(err);
      }
    } else {
      // CREATE MODE: Store locally
      setPendingBlocks(prev => [...prev, newBlock]);
      setNewBlockName('');
      setNewBlockPhase('');
    }
  };

  const handleDeleteBlock = async (blockId) => {
    if (!confirm("Delete this block? Units assigned to this block will be unassigned.")) return;
    
    if (editingItem?.id) {
      // EDIT MODE: Delete via API
      try {
        await estateService.deleteBlock(blockId);
        const updatedBlocks = await estateService.getProjectBlocks(editingItem.id);
        setProjectBlocks(updatedBlocks || []);
      } catch(err) {
        toast.error("Failed to delete block");
      }
    } else {
      // CREATE MODE: Remove from local state
      setPendingBlocks(prev => prev.filter(b => b.id !== blockId));
    }
  };

  // Location Handling
  const handleLocationSelect = (lat, lng) => {
    setFormData(prev => ({
        ...prev,
        location: { lat, lng }
    }));
  };

  // ===== SAVE PROJECT HANDLER (Called explicitly by Save button, NOT by form submit) =====
  const [isSaving, setIsSaving] = useState(false);
  const [lastSubmissionKey, setLastSubmissionKey] = useState(null);
  
  const handleSaveProject = async () => {
    // Generate idempotency key based on form data
    const submissionKey = `${formData.name}_${Date.now()}`;
    
    // Prevent double submission
    if (isSaving) {
      console.warn("Already saving, ignoring duplicate click");
      return;
    }
    
    // Check if we already submitted this exact data recently (within 5 seconds)
    if (lastSubmissionKey && lastSubmissionKey.startsWith(formData.name + '_')) {
      const lastTime = parseInt(lastSubmissionKey.split('_')[1]);
      if (Date.now() - lastTime < 5000) {
        console.warn("Duplicate submission detected within 5 seconds, ignoring");
        return;
      }
    }
    
    setIsSaving(true);
    setLastSubmissionKey(submissionKey);
    console.log("=== handleSaveProject called ===");
    console.log("Idempotency Key:", submissionKey);
    console.log("editingItem:", editingItem);
    console.log("pendingPhases:", pendingPhases);
    console.log("pendingBlocks:", pendingBlocks);
    
    console.log("pendingBlocks:", pendingBlocks);
    
    try {
      // 1. Upload new images if any
      let finalImages = [...formData.images];
      
      if (pendingUploads.length > 0) {
          try {
              // Extract just the files
              const filesToUpload = pendingUploads.map(p => p.file);
              const uploadedResults = await uploadService.uploadMultiple(filesToUpload);
              
              // Create map: blobUrl -> serverFilename
              const urlMap = {};
              pendingUploads.forEach((p, idx) => {
                  urlMap[p.url] = uploadedResults[idx].url || uploadedResults[idx];
              });
              
              // Replace blob URLs in the final list with server filenames
              finalImages = finalImages.map(img => (img.startsWith('blob:') && urlMap[img]) ? urlMap[img] : img);
              
          } catch (uploadErr) {
              console.error("Image upload failed:", uploadErr);
              toast.error(t('imageUploadFailed', 'Failed to upload images'));
              setIsSaving(false);
              return;
          }
      }

      // Prepare payload matching backend API schema
      const payload = {
        name: formData.name,
        description: formData.description || '',
        address: formData.address || '',
        location: formData.location || { lat: 30.0444, lng: 31.2357 },
        developer: formData.developer || (developers.length > 0 ? developers[0]._id || developers[0].id : undefined),
        status: formData.status || 'active',
        type: formData.type || 'developer',
        propertyType: formData.propertyType || 'residential',
        listingType: formData.listingType || 'sale',
        images: finalImages,
        amenities: Array.isArray(formData.amenities) ? formData.amenities : ["Pool", "Gym", "Security"],
        deliveryDate: formData.deliveryDate || '2027-06-01',
        priceRange: formData.priceRange || { min: 0, max: 0 }
      };
      
      // Add optional fields if present
      if (formData.locationId) payload.locationId = formData.locationId;
      if (formData.city) payload.city = formData.city;
      
      console.log("Submitting Payload:", payload);
      
      if (editingItem) {
        // ===== EDIT MODE =====
        console.log("EDIT MODE - updating project:", editingItem._id || editingItem.id);
        await estateService.updateProject(editingItem._id || editingItem.id, payload);
        handleModalCloseWrapper();
        refresh();
      } else {
        // ===== CREATE MODE =====
        console.log("CREATE MODE - creating new project");
        
        // Copy pending items to local vars and IMMEDIATELY clear state to prevent duplicates
        const phasesToCreate = [...pendingPhases];
        const blocksToCreate = [...pendingBlocks];
        setPendingPhases([]);
        setPendingBlocks([]);
        
        const projectResponse = await estateService.createProject(payload);
        console.log("Created project response:", projectResponse);
        
        // Extract projectId - handle various response formats (MongoDB uses _id)
        const newProject = projectResponse?.data || projectResponse;
        const projectId = newProject?._id || newProject?.id;
        
        if (!projectId) {
          console.error("No project ID found in response:", projectResponse);
          throw new Error("Project created but no ID returned");
        }
        
        console.log("New project ID:", projectId);
        
        // Create phases if any pending
        const phaseIdMap = {};
        if (phasesToCreate.length > 0) {
          console.log(`Creating ${phasesToCreate.length} phases...`);
          
          for (const phase of phasesToCreate) {
            const phasePayload = {
              name: phase.name,
              deliveryDate: phase.deliveryDate || '2027-01-01'
            };
            console.log("Adding phase:", phasePayload);
            
            const phaseResponse = await estateService.addProjectPhase(projectId, phasePayload);
            console.log("Phase response:", phaseResponse);
            
            // The API returns updated project object with phases array
            const responseData = phaseResponse?.data || phaseResponse;
            const phasesArray = responseData?.phases || [];
            console.log("Phases array from response:", phasesArray);
            
            // Find the newly added phase by name
            const addedPhase = phasesArray.find(p => p.name === phase.name);
            console.log("Added phase object:", addedPhase); // DEBUG: Show full phase object
            
            if (addedPhase) {
              // According to API docs, phases use custom 'id' format like 'ph_xxx_xxx'
              const realPhaseId = addedPhase.id || addedPhase._id;
              console.log(`Phase has id=${addedPhase.id}, _id=${addedPhase._id}, using: ${realPhaseId}`);
              phaseIdMap[phase.id] = realPhaseId;
              console.log(`Mapped phase ${phase.name}: ${phase.id} -> ${realPhaseId}`);
            } else {
              console.warn(`Could not find phase "${phase.name}" in response`);
            }
          }
        }
        
        // Create blocks if any pending
        if (blocksToCreate.length > 0) {
          console.log(`Creating ${blocksToCreate.length} blocks...`);
          
          for (const block of blocksToCreate) {
            // Map temporary phaseId to real phaseId, or null if not assigned
            let realPhaseId = null;
            if (block.phaseId && phaseIdMap[block.phaseId]) {
              realPhaseId = phaseIdMap[block.phaseId];
              console.log(`Block "${block.name}" mapped phaseId: ${block.phaseId} -> ${realPhaseId}`);
            }
            
            const blockPayload = {
              name: block.name,
              projectId: projectId
            };
            
            // Only add phaseId if it's a valid phase ID format (starts with 'ph_')
            // If it looks like a MongoDB ObjectId (24 hex chars), the backend may reject it
            if (realPhaseId) {
              if (realPhaseId.startsWith('ph_')) {
                blockPayload.phaseId = realPhaseId;
              } else {
                console.warn(`PhaseId "${realPhaseId}" doesn't match expected format (ph_xxx), skipping phaseId for block`);
              }
            }
            
            console.log("Creating block:", blockPayload);
            await estateService.createBlock(blockPayload);
            console.log(`Created block: ${block.name}`);
          }
        }
        
        // Success - close modal and refresh
        handleModalCloseWrapper();
        refresh();
      }
    } catch (err) {
      console.error("Failed to save project:", err);
      toast.error("Failed to save project: " + (err?.response?.data?.message || err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  // Stepper Logic moved up


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading text-textDark dark:text-white">{t('projects')}</h1>
        <div className="flex gap-3">
           <Button variant="outline" onClick={onExport}>
            <Download size={18} className="me-2" /> {t('export')}
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} className="me-2" /> {t('addProject')}
          </Button>
        </div>
      </div>

      <div className="bg-background dark:bg-dark-card border border-border/20 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search size={18} className="absolute inset-y-0 start-3 my-auto text-gray-400" />
            <input 
              type="text" 
              placeholder={t('searchProjects')}
              className="w-full ps-10 pe-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-textDark dark:text-white placeholder-textLight"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-lg border border-border/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              title={t('Grid View')}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              title={t('List View')}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {loading ? (
             <div className="p-8 text-center text-gray-400">{t('loading')}</div>
        ) : projects.length === 0 ? (
             <div className="p-8 text-center text-gray-400">{t('noProjects')}</div>
        ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {projects.map((project) => (
            <div key={project.id || project._id} className="glass-panel overflow-hidden hover:border-primary/50 transition-colors group flex flex-col">
              <div className="h-48 bg-gray-800 relative">
                <EntityImage 
                  src={project.images?.[0]} 
                  alt={project.name}
                  type="project"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-xs text-white uppercase font-bold border border-white/10">
                  {project.status}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-textDark dark:text-white mb-2">{project.name}</h3>
                <div className="flex items-center text-textLight dark:text-gray-400 mb-4 text-sm">
                  <MapPin size={14} className="me-1" /> {project.address}
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-background dark:bg-white/5 border border-border/10 dark:border-transparent p-2 rounded text-center">
                    <div className="text-lg font-bold text-textDark dark:text-white">{project.stats?.totalUnits || 0}</div>
                    <div className="text-[10px] text-textLight dark:text-gray-500 uppercase">{t('units')}</div>
                  </div>
                  <div className="bg-background dark:bg-white/5 border border-border/10 dark:border-transparent p-2 rounded text-center">
                    <div className="text-lg font-bold text-primary">{project.stats?.available || 0}</div>
                    <div className="text-[10px] text-textLight dark:text-gray-500 uppercase">{t('avail')}</div>
                  </div>
                  <div className="bg-primary/5 p-2 rounded text-center">
                    <div className="text-lg font-bold text-green-400">{project.stats?.sold || 0}</div>
                    <div className="text-[10px] text-textLight uppercase">{t('sold')}</div>
                  </div>
                </div>

                <div className="mt-auto flex justify-between items-center pt-4 border-t border-border/10 dark:border-white/5">
                  <div className="flex items-center text-sm text-textLight dark:text-gray-400">
                    <Layers size={14} className="me-2" />
                    {project.phases?.length || 0} {t('phases')}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      onClick={() => handleOpenModal(project)}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      onClick={() => handleDelete(project.id || project._id)}
                      title="Delete"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        ) : (
            <div className="overflow-x-auto">
                 {/* List view implementation (unchanged logic, just ensuring safe access) */}
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-white/5 text-textLight dark:text-gray-400 text-sm border-b border-border/20 dark:border-white/10">
                            <th className="p-4 font-medium">{t('Name')}</th>
                            <th className="p-4 font-medium">{t('Location')}</th>
                            <th className="p-4 font-medium text-center">{t('Status')}</th>
                            <th className="p-4 font-medium text-center">{t('Units')}</th>
                            <th className="p-4 font-medium text-center">{t('Sold')}</th>
                            <th className="p-4 font-medium text-end">{t('Actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 dark:divide-white/5">
                        {projects.map((project) => (
                            <tr key={project.id || project._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                                            <EntityImage 
                                              src={project.images?.[0]} 
                                              alt={project.name}
                                              type="project"
                                              className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="font-bold text-textDark dark:text-white">{project.name}</div>
                                    </div>
                                </td>
                                <td className="p-4 text-textDark dark:text-gray-300">
                                    <div className="flex items-center text-sm gap-1">
                                        <MapPin size={14} className="text-gray-400" />
                                        {project.address}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold uppercase ${
                                        project.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
                                    }`}>
                                        {project.status}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-textDark dark:text-white">{project.stats?.totalUnits || 0}</span>
                                        <span className="text-xs text-textLight">{project.stats?.available || 0} avail</span>
                                    </div>
                                </td>
                                <td className="p-4 text-center text-green-500 font-bold">
                                    {project.stats?.sold || 0}
                                </td>
                                <td className="p-4">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                            onClick={() => handleOpenModal(project)}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            onClick={() => handleDelete(project.id || project._id)}
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? `${t('edit')}: ${editingItem.name}` : t('createProject')}
        maxWidth="max-w-2xl"
      >
        <div className="flex flex-col h-full">
            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-8 px-2 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border/20 -z-10 rounded-full" />
                {steps.map((step) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-white dark:bg-gray-800 px-2 z-10">
                             <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                ${isActive ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 
                                  isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}`}
                             >
                                 {step.id}
                             </div>
                             <span className={`text-[10px] uppercase tracking-wider font-semibold ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                                 {step.title}
                             </span>
                        </div>
                    );
                })}
            </div>

            {/* Using div instead of form to prevent ANY auto-submission */}
            <div className="space-y-6">
              
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Input 
                        label={t('projectName')} 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Sunset Towers"
                    />
                    <div>
                        <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('developer')}</label>
                        <select 
                        name="developer" 
                        value={formData.developer} 
                        onChange={handleInputChange} 
                        className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white focus:outline-none focus:border-primary"
                        required
                        >
                        <option value="">Select Developer</option>
                        {developers.map((dev, idx) => (
                            <option key={dev.id || idx} value={dev.id}>{dev.name}</option>
                        ))}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('status')}</label>
                        <select 
                        className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white focus:outline-none focus:border-primary"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        >
                        <option value="active">Active</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="resale">Resale</option>
                        <option value="ready">Ready</option>
                        <option value="unlocked">Unlocked</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('description')}</label>
                        <textarea 
                        className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white focus:outline-none focus:border-primary h-24 resize-none"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Brief description of the project..."
                        />
                    </div>
                  </div>
              )}

              {/* Step 2: Location */}
              {currentStep === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                            <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('city')}</label>
                            <select 
                                name="city"
                                value={formData.city} 
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white focus:outline-none focus:border-primary"
                            >
                                <option value="">{t('selectCity', 'Select City')}</option>
                                {cities.map((city, idx) => (
                                    <option key={city.id || idx} value={city.slug || city.id}>
                                        {i18n.language === 'ar' ? city.nameAr : city.nameEn}
                                    </option>
                                ))}
                            </select>
                         </div>
                         <Input 
                            label={t('address')} 
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            placeholder="Street address, District"
                         />
                     </div>
                     <div className="h-64 rounded-xl overflow-hidden border border-border/20">
                        <LocationPicker 
                            lat={formData.location?.lat || 30.0444} 
                            lng={formData.location?.lng || 31.2357}
                            selectedCity={formData.city} 
                            onLocationSelect={handleLocationSelect}
                        />
                    </div>
                    <div className="text-xs text-gray-500 text-center">Click on the map to pin exact location</div>
                  </div>
              )}

              {/* Step 3: Details */}
              {currentStep === 3 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('type')}</label>
                        <select 
                            className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white focus:outline-none focus:border-primary"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                        >
                            <option value="keys">Keys (Ready)</option>
                            <option value="developer">Developer</option>
                            <option value="invest">Investment</option>
                            <option value="offer">Offer</option>
                        </select>
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('propertyType')}</label>
                        <select 
                            className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white focus:outline-none focus:border-primary"
                            name="propertyType"
                            value={formData.propertyType}
                            onChange={handleInputChange}
                        >
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="mixed">Mixed Use</option>
                        </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('listingType')}</label>
                        <select 
                            className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white focus:outline-none focus:border-primary"
                            name="listingType"
                            value={formData.listingType}
                            onChange={handleInputChange}
                        >
                            <option value="sale">For Sale</option>
                            <option value="rent">For Rent</option>
                        </select>
                        </div>
                        <Input 
                            label={t('deliveryDate')} 
                            name="deliveryDate" 
                            type="date" 
                            value={formData.deliveryDate ? formData.deliveryDate.split('T')[0] : ''} 
                            onChange={handleInputChange} 
                        />
                    </div>
                    
                    {/* Price Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label="Min Price (EGP)" 
                            name="priceRangeMin" 
                            type="number" 
                            value={formData.priceRange?.min || ''} 
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              priceRange: { ...prev.priceRange, min: Number(e.target.value) || 0 }
                            }))}
                            placeholder="e.g. 2500000"
                        />
                        <Input 
                            label="Max Price (EGP)" 
                            name="priceRangeMax" 
                            type="number" 
                            value={formData.priceRange?.max || ''} 
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              priceRange: { ...prev.priceRange, max: Number(e.target.value) || 0 }
                            }))}
                            placeholder="e.g. 8000000"
                        />
                    </div>
                    
                    {/* Amenities */}
                    <div>
                        <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">Amenities</label>
                        <input 
                            className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white focus:outline-none focus:border-primary"
                            name="amenities"
                            value={Array.isArray(formData.amenities) ? formData.amenities.join(', ') : formData.amenities || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              amenities: e.target.value.split(',').map(a => a.trim()).filter(a => a)
                            }))}
                            placeholder="pool, gym, security, clubhouse, parking"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separate amenities with commas</p>
                    </div>
                  </div>
              )}

              {/* Step 4: Media */}
              {currentStep === 4 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                       <div className="border-2 border-dashed border-border/40 rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-section/30 dark:bg-white/5">
                        <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden" 
                        id="project-image-upload"
                        />
                        <label htmlFor="project-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                            <Upload size={32} />
                        </div>
                        <h4 className="font-semibold text-textDark dark:text-white">{t('uploadMedia')}</h4>
                        <p className="text-textLight text-sm">{t('dragAndDropDetails', 'Supports JPEG, PNG. Max 5MB.')}</p>
                        </label>
                    </div>
                    {formData.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        {formData.images.map((img, index) => (
                            <div key={index} className="relative aspect-video rounded-lg overflow-hidden group border border-border/20 bg-black/10">
                            <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                            <button 
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={14} />
                            </button>
                            </div>
                        ))}
                        </div>
                    )}
                  </div>
              )}
                
              {/* Step 5: Phases */}
              {currentStep === 5 && (
                   <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-textDark dark:text-white">Project Phases</h3>
                        <Button type="button" size="sm" onClick={handleAddPhase}>
                            <Plus size={16} className="mr-1" /> Add Phase
                        </Button>
                    </div>
                    
                    <div className="space-y-2">
                         {/* Use editingItem.phases for edit mode, pendingPhases for create mode */}
                         {(() => {
                           const phasesToShow = editingItem ? (editingItem.phases || []) : pendingPhases;
                           return phasesToShow.length === 0 ? (
                             <div className="text-gray-500 text-sm italic py-4 text-center">No phases defined. Click "Add Phase" to create one.</div>
                           ) : (
                             phasesToShow.map((phase, idx) => (
                               <div key={phase.id || idx} className="bg-background dark:bg-white/5 p-3 rounded-lg border border-border/20 dark:border-white/10 flex justify-between items-center">
                                 <div>
                                   <div className="font-bold text-textDark dark:text-white">{phase.name}</div>
                                   <div className="text-xs text-textLight dark:text-gray-400">{phase.status} • {phase.deliveryDate}</div>
                                 </div>
                                 <button 
                                   type="button"
                                   onClick={() => handleDeletePhase(phase.id || phase._id)}
                                   className="text-red-400 hover:text-red-300 transition-colors bg-transparent p-1"
                                 >
                                   <Trash size={16} />
                                 </button>
                               </div>
                             ))
                           );
                         })()}
                    </div>
                 </div>
              )}

              {/* Step 6: Blocks */}
              {currentStep === 6 && (
                   <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-textDark dark:text-white">Project Blocks</h3>
                    </div>
                    
                    {/* Add Block Form */}
                    <div className="flex gap-2 items-end bg-gray-50 dark:bg-white/5 p-3 rounded-lg">
                        <div className="flex-1">
                            <label className="text-xs text-textLight mb-1 block">Block Name</label>
                            <Input 
                                value={newBlockName}
                                onChange={(e) => setNewBlockName(e.target.value)}
                                placeholder="Block Name (e.g. B1)"
                                className="h-9 text-sm"
                            />
                        </div>
                        {/* Show phase dropdown if phases exist (from editingItem or pendingPhases) */}
                        {(() => {
                          const availablePhases = editingItem ? (editingItem.phases || []) : pendingPhases;
                          return availablePhases.length > 0 && (
                            <div className="flex-1">
                                <label className="text-xs text-textLight mb-1 block">Phase (Optional)</label>
                                <select 
                                    value={newBlockPhase}
                                    onChange={(e) => setNewBlockPhase(e.target.value)}
                                    className="w-full h-9 px-3 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-black/20 text-textDark dark:text-white text-sm focus:outline-none focus:border-primary"
                                >
                                    <option value="">No Phase</option>
                                    {availablePhases.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                          );
                        })()}
                        <Button type="button" size="sm" onClick={handleAddBlock} disabled={!newBlockName} className="h-9">
                            <Plus size={16} /> Add
                        </Button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                         {/* Use projectBlocks for edit mode, pendingBlocks for create mode */}
                         {(() => {
                           const blocksToShow = editingItem ? projectBlocks : pendingBlocks;
                           const availablePhases = editingItem ? (editingItem.phases || []) : pendingPhases;
                           
                           return blocksToShow.length === 0 ? (
                             <div className="text-gray-500 text-sm italic py-4 text-center">No blocks defined. Click "Add" to create one.</div>
                           ) : (
                             blocksToShow.map((block, idx) => {
                               const phaseName = block.phaseId ? availablePhases.find(p => p.id === block.phaseId)?.name : null;
                               return (
                                 <div key={block.id || idx} className="bg-background dark:bg-white/5 p-3 rounded-lg border border-border/20 dark:border-white/10 flex justify-between items-center">
                                   <div className="flex items-center gap-3">
                                     <div className="bg-primary/10 p-2 rounded text-primary">
                                       <Box size={16} />
                                     </div>
                                     <div>
                                       <div className="font-bold text-textDark dark:text-white">{block.name}</div>
                                       <div className="text-xs text-textLight dark:text-gray-400">
                                         {phaseName ? `Phase: ${phaseName}` : 'No Phase'}
                                       </div>
                                     </div>
                                   </div>
                                   <button 
                                     type="button"
                                     onClick={() => handleDeleteBlock(block.id || block._id)}
                                     className="text-red-400 hover:text-red-300 transition-colors bg-transparent p-1"
                                   >
                                     <Trash size={16} />
                                   </button>
                                 </div>
                               );
                             })
                           );
                         })()}
                    </div>
                 </div>
              )}

              {/* Navigation Actions */}
              <div className="flex justify-between pt-6 border-t border-border/10">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={currentStep === 1 ? handleCloseModal : prevStep}
                >
                    {currentStep === 1 ? t('cancel') : t('back', 'Previous')}
                </Button>
                
                {currentStep < steps.length ? (
                     <Button type="button" onClick={() => {
                         if(isStepValid()) nextStep(); 
                         else toast.warning("Please fill required fields");
                     }}>
                         {t('next', 'Next')}
                     </Button>
                ) : (
                    <Button type="button" onClick={handleSaveProject} disabled={isSaving} isLoading={isSaving}>
                         {isSaving ? 'Saving...' : t('saveDetails')}
                    </Button>
                )}
              </div>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Projects;
