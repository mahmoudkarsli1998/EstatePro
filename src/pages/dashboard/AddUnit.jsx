import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Building2, MapPin, Image, Phone, Check, ChevronLeft, ChevronRight, Upload, X, Save, Star, FileText, Lock, Send
} from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import LocationPicker from '../../components/shared/LocationPicker';
import { useAuth } from '../../hooks/useAuth';
import { estateService } from '../../services/estateService';
import { commonService } from '../../services/commonService';
import { crmService } from '../../services/crmService';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../context/NotificationsContext';
import { uploadService } from '../../services/uploadService';
import UnitStatusControl from '../../components/dashboard/UnitStatusControl';

const AddUnit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user
  const toast = useToast();
  const { createNotification } = useNotifications();
  const { id } = useParams();
  const isEditMode = !!id;
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [phases, setPhases] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [customAmenityText, setCustomAmenityText] = useState('');
  const [noteText, setNoteText] = useState(''); // State for new note input
  const [pendingUploads, setPendingUploads] = useState([]); // Store local files: { file: File, url: string }

  // Load initial data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [citiesData, projectsData, agentsData] = await Promise.all([
          commonService.getCities(),
          estateService.getProjects(),
          crmService.getAgents()
        ]);
        setCities(citiesData);
        setProjects(projectsData);
        setAgents(agentsData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    loadData();
  }, []);

  // Load data for edit mode
  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      estateService.getUnitById(id).then(unit => {
        if (unit) {
          console.log('EDIT UNIT DATA:', unit);

          // Resolve IDs robustly
          const pId = unit.projectId || (typeof unit.project === 'string' ? unit.project : unit.project?.id || unit.project?._id || unit.project) || '';
          const phId = unit.phaseId || '';
          const blkId = unit.blockId || (typeof unit.block === 'string' ? unit.block : unit.block?.id || unit.block?._id || unit.block) || '';

          // Pre-fetch phases and blocks if project exists
          if (pId && pId !== '0') {
            Promise.all([
                estateService.getProjectPhases(pId),
                estateService.getProjectBlocks(pId)
            ]).then(([phasesData, blocksData]) => {
                setPhases(phasesData || []);
                setBlocks(blocksData || []);
            }).catch(e => console.error("Error fetching related items:", e));
          }

          // Parse private notes
          let parsedNotes = [];
          if (Array.isArray(unit.privateNotes)) {
              parsedNotes = unit.privateNotes;
          } else if (typeof unit.privateNotes === 'string') {
              try { 
                  if (unit.privateNotes.startsWith('[') || unit.privateNotes.startsWith('{')) {
                      parsedNotes = JSON.parse(unit.privateNotes);
                  } else {
                      parsedNotes = unit.privateNotes.split('\n').filter(n => n.trim());
                  }
              } catch (e) { 
                  parsedNotes = unit.privateNotes ? [unit.privateNotes] : []; 
              }
          }

          setFormData({
             titleAr: unit.titleAr || '', 
             titleEn: unit.titleEn || unit.number || '',
             type: unit.type || 'residential',
             targetAudience: unit.targetAudience || 'family',
             category: unit.category || 'sale',
             status: unit.status || 'available',
             occupants: unit.features?.bedrooms || unit.occupants || '',
             bathrooms: unit.features?.bathrooms || unit.bathrooms || '',
             floor: unit.floor || '',
             view: unit.features?.view || unit.view || '',
             parking: !!unit.features?.parking,
             furnished: !!unit.features?.furnished,
             buildingAge: unit.buildingAge || '',
             area: unit.area_m2 || unit.area || '',
             price: unit.price || '',
             isSimilar: !!unit.isSimilar,
             
             contactFamilyName: unit.contactFamilyName || unit.owner?.lastName || unit.owner?.familyName || unit.contact?.familyName || '',
             contactFirstName: unit.contactFirstName || unit.owner?.firstName || unit.contact?.firstName || '',
             contactServicesCount: unit.contactServicesCount || unit.servicesCount || '',
             contactPhone: unit.contactPhone || unit.contact?.phone || unit.owner?.phone || unit.phoneNumber || '',
             contactAltPhone: unit.contactAltPhone || unit.contact?.altPhone || '',
             contactAddress: unit.contactAddress || unit.contact?.address || unit.owner?.address || '',
             
             buildingCode: unit.buildingCode || '',
             buildingFloors: unit.buildingFloors || '',
             
             installationType: unit.installationType || 'cash',
             annualInstallment: unit.annualInstallment || '',
             
             address: unit.address || '',
             addressAr: unit.addressAr || unit.address || '',
             addressEn: unit.addressEn || unit.address || '',
             city: unit.city || 'cairo',
             latitude: unit.coordinates?.latitude || unit.latitude || 30.0444,
             longitude: unit.coordinates?.longitude || unit.longitude || 31.2357,
             
             images: Array.isArray(unit.images) ? unit.images : [],
             descriptionAr: unit.descriptionAr || '',
             descriptionEn: unit.descriptionEn || '',
             
             finalContactName: unit.finalContactName || '',
             finalContactWhatsapp: unit.finalContactWhatsapp || '',
             finalContactPhone: unit.finalContactPhone || '',
             finalContactEmail: unit.finalContactEmail || '',
             
             amenities: (unit.features?.amenities || unit.amenities || []).map(a => typeof a === 'object' ? a.name || a.value || '' : a).filter(Boolean),
             nearbyFacilities: unit.features?.nearbyFacilities || [],
             
             existingFeatures: unit.features || {},
             
             projectId: pId,
             phaseId: phId,
             blockId: blkId,
             agentId: unit.agentId || '',
             isFavorite: !!unit.isFavorite,
             privateNotes: parsedNotes
          });
        }
      }).catch(err => {
         console.error("Failed to load unit:", err);
         toast.error("Could not load unit details");
      }).finally(() => setLoading(false));
    }
  }, [id, isEditMode]);
  
  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Property Information
    titleAr: '',
    titleEn: '',
    type: 'apartment', // dropdown: Apartment, Villa, Office, Retail, Studio, Penthouse
    targetAudience: 'family', // Individual, Family, Company
    category: 'sale', // dropdown
    status: 'available', // For Sale, For Rent, Sold, Rented
    occupants: '', // mapped to bedrooms
    bathrooms: '',
    floor: '', // Floor number
    view: '', // View type: sea, garden, city, pool, street, none
    parking: false, // Has parking
    furnished: false, // Is furnished
    buildingAge: '',
    area: '',
    isSimilar: false,
    isFavorite: false,
    projectId: '',
    phaseId: '',
    blockId: '',
    agentId: '',
    
    // Step 2: Details & Location
    // Contact Info Section (part of step 2)
    contactFamilyName: '',
    contactFirstName: '',
    contactServicesCount: '',
    contactPhone: '',
    contactAltPhone: '',
    contactAddress: '',
    
    // Building Information (Added)
    buildingCode: '',
    buildingFloors: '',
    
    // Property Account Details
    installationType: 'cash',
    annualInstallment: '',
    price: '',
    
    // Interactive Location
    address: '', // Legacy support
    addressAr: '',
    addressEn: '',
    city: 'cairo',
    latitude: '30.0444', 
    longitude: '31.2357',
    
    // Step 3: Media & Descriptions
    images: [],
    descriptionAr: '',
    descriptionEn: '',
    
    // Step 4: Contact Info & Amenities
    // Final Contact Details
    finalContactName: '',
    finalContactWhatsapp: '',
    finalContactPhone: '',
    finalContactEmail: '',
    
    // Amenities
    amenities: [],
    nearbyFacilities: [],
    
    // Private Notes (Sales only)
    privateNotes: [],

    // Internal state to preserve existing data
    existingFeatures: {}
  });

  const steps = [
    { id: 1, title: t('basicInfo'), icon: Building2 },
    { id: 2, title: t('detailsAndLocation'), icon: MapPin },
    { id: 3, title: t('mediaAndDescriptions'), icon: Image },
    { id: 4, title: t('contactAndAmenities'), icon: Phone },
    { id: 5, title: isEditMode ? t('statusManagement', 'Status Management') : t('finalizeUnit', 'Finalize Unit'), icon: Star },
  ];

  const amenitiesList = [
    'kitchen', 'parking', 'ac', 'multipleBathrooms', 'garden', 'securitySystem', 
    'heating', 'elevator', 'balcony', 'furnished', 'pool', 'custom'
  ];

  const nearbyList = [
    'schools', 'gasStations', 'hospitals', 'shoppingCenters', 'banks', 
    'restaurants', 'mosques', 'publicTransport', 'parks', 'pharmacies'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'projectId') {
        // Reset sub-levels
        setFormData(prev => ({ ...prev, projectId: value, phaseId: '', blockId: '' }));
        // Fetch new phases/blocks
        if (value) {
            Promise.all([
                estateService.getProjectPhases(value),
                estateService.getProjectBlocks(value)
            ]).then(([phaseData, blockData]) => {
                setPhases(phaseData || []);
                setBlocks(blockData || []);
            });
        } else {
            setPhases([]);
            setBlocks([]);
        }
        return;
    }

    if (name === 'phaseId') {
        // Reset block
        setFormData(prev => ({ ...prev, phaseId: value, blockId: '' }));
        return;
    }

    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleArrayToggle = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

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
    if (imageToRemove.startsWith('blob:')) {
        setPendingUploads(prev => prev.filter(p => p.url !== imageToRemove));
        URL.revokeObjectURL(imageToRemove); // Cleanup memory
    }
  };

  const handleAddCustomAmenity = (e) => {
    e.preventDefault();
    if (!customAmenityText.trim()) return;
    
    // Check if not already exists
    if (!formData.amenities.includes(customAmenityText.trim())) {
        setFormData(prev => ({
            ...prev,
            amenities: [...prev.amenities, customAmenityText.trim()]
        }));
    }
    setCustomAmenityText('');
  };

  const isStepValid = () => {
    switch(currentStep) {
        case 1:
            return formData.titleEn && formData.area;
        case 2:
            return formData.price;
        default:
            return true;
    }
  };

  const nextStep = (e) => {
    if (e) e.preventDefault();
    if (!isStepValid()) {
        const missing = currentStep === 1 ? "Title, Area" : "Price";
        toast.warning(`Please fill in required fields (${missing})`);
        return;
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const prevStep = (e) => {
    if (e) e.preventDefault();
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Double check we are on the last step before allowing submit
    if (currentStep !== steps.length) return;
    await saveUnit(); 
  };
  
  // Prevent accidental submission on Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
    }
  };

  const handleSaveDraft = async () => {
    await saveUnit('draft');
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setFormData(prev => ({
        ...prev,
        privateNotes: [...prev.privateNotes, {
            text: noteText,
            date: new Date().toISOString(),
            author: user?.name,
            authorId: user?.id
        }]
    }));
    setNoteText('');
  };

  const saveUnit = async (statusOverride) => {
    setLoading(true);
    try {
      // Map form data to API structure
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
                  urlMap[p.url] = uploadedResults[idx].url || uploadedResults[idx]; // specific to uploadService return format
              });
              
              // Replace blob URLs in the final list with server filenames
              finalImages = finalImages.map(img => (img.startsWith('blob:') && urlMap[img]) ? urlMap[img] : img);
              
          } catch (uploadErr) {
              console.error("Image upload failed:", uploadErr);
              toast.error(t('imageUploadFailed', 'Failed to upload images'));
              setLoading(false);
              return;
          }
      }

      // Map form data to API structure
      // We explicitly pick fields to avoid sending garbage (...formData can include blobs or temporary UI state)
      const apiData = {
        number: formData.titleEn,
        titleEn: formData.titleEn,
        titleAr: formData.titleAr,
        type: formData.type,
        category: formData.category,
        targetAudience: formData.targetAudience,
        status: statusOverride || formData.status,
        price: parseFloat(formData.price) || 0,
        area_m2: parseFloat(formData.area) || 0,
        floor: formData.floor ? parseInt(formData.floor) : undefined,
        buildingAge: formData.buildingAge,
        buildingCode: formData.buildingCode,
        buildingFloors: formData.buildingFloors ? parseInt(formData.buildingFloors) : undefined,
        
        address: formData.address,
        addressAr: formData.addressAr,
        addressEn: formData.addressEn,
        city: formData.city,
        latitude: formData.latitude,
        longitude: formData.longitude,
        
        images: finalImages,
        descriptionAr: formData.descriptionAr,
        descriptionEn: formData.descriptionEn,
        
        projectId: formData.projectId || undefined,
        project: formData.projectId || undefined,
        phaseId: formData.phaseId || undefined,
        blockId: formData.blockId || undefined,
        agentId: formData.agentId || undefined,
        
        // Ensure numbers are definitely numbers or null
        bedrooms: formData.occupants ? parseInt(formData.occupants) : 0,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : 0,
        
        contactFirstName: formData.contactFirstName || '',
        contactFamilyName: formData.contactFamilyName || '',
        contactPhone: formData.contactPhone || '',
        contactAltPhone: formData.contactAltPhone || '',
        contactAddress: formData.contactAddress || '',
        contactServicesCount: formData.contactServicesCount || 0,
        
        finalContactName: formData.finalContactName || '',
        finalContactWhatsapp: formData.finalContactWhatsapp || '',
        finalContactPhone: formData.finalContactPhone || '',
        finalContactEmail: formData.finalContactEmail || '',

        isFavorite: formData.isFavorite || false,
        
        features: {
           ...formData.existingFeatures,
           amenities: formData.amenities || [],
           nearbyFacilities: formData.nearbyFacilities || [],
           view: formData.view || '',
           parking: !!formData.parking,
           furnished: !!formData.furnished,
           bedrooms: parseInt(formData.occupants) || 0,
           bathrooms: parseInt(formData.bathrooms) || 0
        },
        privateNotes: formData.privateNotes || ''
      };
      
      console.log("Saving unit payload:", apiData); // Debug log

      let savedUnit;
      if (isEditMode) {
        savedUnit = await estateService.updateUnit(id, { ...apiData, userId: user?.id });
      } else {
        savedUnit = await estateService.createUnit({ ...apiData, createdById: user?.id });
      }
      
      // Create notification for unit creation/update
      try {
        await createNotification({
          title: isEditMode ? t('unitUpdated', 'Unit Updated') : t('unitCreated', 'New Unit Created'),
          message: `${user?.fullName || 'User'} ${isEditMode ? 'updated' : 'created'} unit "${formData.titleEn}"`,
          type: isEditMode ? 'UNIT_UPDATE' : 'NEW_UNIT',
          metadata: { 
            unitId: savedUnit?.id || savedUnit?._id || id, 
            unitTitle: formData.titleEn,
            projectId: formData.projectId,
            status: apiData.status
          }
        });
      } catch (notifErr) {
        console.log('Notification creation failed (non-critical):', notifErr);
      }
      
      toast.success(isEditMode ? t('unitUpdatedSuccess', 'Unit updated successfully') : t('unitCreatedSuccess', 'Unit created successfully'));
      navigate('/dashboard/units');
    } catch (error) {
      console.error('Error saving unit:', error);
      toast.error(`Failed to save unit: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-textDark dark:text-white">
            {isEditMode ? t('editUnit', 'Edit Unit') : t('addNewUnit', 'Add New Unit')}
          </h1>
          <p className="text-textLight dark:text-gray-400 text-sm mt-1">
            {isEditMode ? t('editUnitDescription', 'Update existing unit details') : t('addUnitDescription', 'Create a new unit listing')}
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/dashboard/units')}>
                {t('cancel')}
            </Button>
            <Button variant="ghost" className="text-primary border-primary/20" onClick={handleSaveDraft} disabled={loading}>
                <Save size={18} className="me-2" /> {t('saveDraft', 'Save Draft')}
            </Button>
            <Button variant="primary" onClick={() => saveUnit('available')} isLoading={loading}>
                <Send size={18} className="me-2" /> {t('publishSave', 'Save & Publish')}
            </Button>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-background dark:bg-dark-card border border-border/20 rounded-xl p-4 sticky top-4 z-10 shadow-sm">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-border/20 -z-10 rounded-full" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-primary -z-10 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-background dark:bg-dark-card px-2">
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-colors
                    ${isActive ? 'bg-primary text-white' : 
                      isCompleted ? 'bg-green-500 text-white' : 
                      'bg-section dark:bg-white/5 text-textLight'}
                  `}
                >
                  {isCompleted ? <Check size={20} /> : <span className="font-bold">{step.id}</span>}
                </div>
                <span className={`text-xs font-medium hidden md:block ${isActive ? 'text-primary' : 'text-textLight'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-textLight md:hidden px-1">
            <span>{steps[currentStep-1].title}</span>
            <span>{currentStep}/{steps.length}</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-background dark:bg-dark-card border border-border/20 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          
          {/* Step 1: Basic Unit Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <Building2 size={20} /> {t('basicInfo')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label={t('unitTitleAr', 'Unit Title (Arabic)')}
                  name="titleAr"
                  value={formData.titleAr}
                  onChange={handleInputChange}
                  placeholder="عنوان الوحدة بالعربية"
                  dir="rtl"
                />
                <Input 
                  label={t('unitTitleEn', 'Unit Title (English)')}
                  name="titleEn"
                  value={formData.titleEn}
                  onChange={handleInputChange}
                  required
                  placeholder="Unit Title in English"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('unitType', 'Unit Type')}</label>
                   <select 
                     name="type"
                     value={formData.type}
                     onChange={handleInputChange}
                     className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white outline-none focus:border-primary [&>option]:bg-white [&>option]:text-black dark:[&>option]:bg-gray-800 dark:[&>option]:text-white"
                   >

                     <option value="apartment">{t('apartment')}</option>
                     <option value="villa">{t('villa')}</option>
                     <option value="office">{t('office')}</option>
                     <option value="retail">{t('retail', 'Retail')}</option>
                     <option value="studio">{t('studio', 'Studio')}</option>
                     <option value="penthouse">{t('penthouse', 'Penthouse')}</option>
                   </select>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('targetAudience')}</label>
                   <select 
                     name="targetAudience"
                     value={formData.targetAudience}
                     onChange={handleInputChange}
                     className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white outline-none focus:border-primary [&>option]:bg-white [&>option]:text-black dark:[&>option]:bg-gray-800 dark:[&>option]:text-white"
                   >
                     <option value="individual">{t('individual')}</option>
                     <option value="family">{t('family')}</option>
                     <option value="company">{t('company')}</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('unitCategory', 'Unit Category')}</label>
                   <select 
                     name="category"
                     value={formData.category}
                     onChange={handleInputChange}
                     className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white outline-none focus:border-primary [&>option]:bg-white [&>option]:text-black dark:[&>option]:bg-gray-800 dark:[&>option]:text-white"
                   >
                     <option value="sale">{t('forSale')}</option>
                     <option value="rent">{t('forRent')}</option>
                     <option value="investment">{t('investment')}</option>
                   </select>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('project', 'Project / Compound')}</label>
                    <select 
                      name="projectId"
                      value={formData.projectId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white outline-none focus:border-primary [&>option]:bg-white [&>option]:text-black dark:[&>option]:bg-gray-800 dark:[&>option]:text-white"
                    >
                      <option value="">{t('selectProject', 'No project selected')}</option>
                      {projects.map((project, idx) => (
                        <option key={project.id || project._id || `proj-${idx}`} value={project.id || project._id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Phase & Block Selection (Visible if Project Selected) */}
                  {formData.projectId && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('phase', 'Phase (Optional)')}</label>
                            <select 
                                name="phaseId"
                                value={formData.phaseId}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white outline-none focus:border-primary [&>option]:bg-white [&>option]:text-black dark:[&>option]:bg-gray-800 dark:[&>option]:text-white"
                            >
                                <option value="">{t('selectPhase', 'No Phase')}</option>
                                {phases.map((phase) => (
                                <option key={phase.id || phase._id} value={phase.id || phase._id}>
                                    {phase.name}
                                </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('block', 'Block (Optional)')}</label>
                            <select 
                                name="blockId"
                                value={formData.blockId}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white outline-none focus:border-primary [&>option]:bg-white [&>option]:text-black dark:[&>option]:bg-gray-800 dark:[&>option]:text-white"
                            >
                                <option value="">{t('selectBlock', 'No Block')}</option>
                                {/* Filter blocks: if phase selected, only show phase blocks; else show blocks with no phase */}
                                {blocks
                                    .filter(b => formData.phaseId ? b.phaseId == formData.phaseId : !b.phaseId)
                                    .map((block) => (
                                        <option key={block.id || block._id} value={block.id || block._id}>
                                            {block.name}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    </>
                  )} 
                    
                  <div>
                    <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('assignedAgent', 'Assigned Agent')}</label>
                    <select 
                      name="agentId"
                      value={formData.agentId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white outline-none focus:border-primary [&>option]:bg-white [&>option]:text-black dark:[&>option]:bg-gray-800 dark:[&>option]:text-white"
                    >
                      <option value="">{t('selectAgent', 'Select Agent')}</option>
                      {agents.map((agent, idx) => (
                        <option key={agent.id || agent._id || `agent-${idx}`} value={agent.id || agent._id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                   <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('status')}</label>
                   <select 
                     name="status"
                     value={formData.status}
                     onChange={handleInputChange}
                     className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white outline-none focus:border-primary [&>option]:bg-white [&>option]:text-black dark:[&>option]:bg-gray-800 dark:[&>option]:text-white"
                   >
                     <option value="available">{t('available')}</option>
                     <option value="sold">{t('sold')}</option>
                     <option value="rented">{t('rented')}</option>
                     <option value="reserved">{t('reserved')}</option>
                   </select>
                </div>
                  <Input 
                     label={t('bedrooms', 'Bedrooms')}
                     name="occupants"
                     type="number"
                     value={formData.occupants}
                     onChange={handleInputChange}
                  />
                  <Input 
                     label={t('bathrooms', 'Bathrooms')}
                     name="bathrooms"
                     type="number"
                     value={formData.bathrooms}
                     onChange={handleInputChange}
                  />
                  <Input 
                     label={t('floor', 'Floor')}
                     name="floor"
                     type="number"
                     value={formData.floor}
                     onChange={handleInputChange}
                     placeholder="e.g. 5"
                  />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <Input 
                   label={t('buildingAge')}
                   name="buildingAge"
                   value={formData.buildingAge}
                   onChange={handleInputChange}
                />
                <Input 
                   label={t('area')}
                   name="area"
                   type="number"
                   value={formData.area}
                   onChange={handleInputChange}
                   suffix="m²"
                   required
                />
                <div>
                   <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('view', 'View')}</label>
                   <select 
                     name="view"
                     value={formData.view}
                     onChange={handleInputChange}
                     className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white outline-none focus:border-primary [&>option]:bg-white [&>option]:text-black dark:[&>option]:bg-gray-800 dark:[&>option]:text-white"
                   >
                     <option value="">{t('selectView', 'Select View')}</option>
                     <option value="sea">{t('seaView', 'Sea View')}</option>
                     <option value="garden">{t('gardenView', 'Garden View')}</option>
                     <option value="city">{t('cityView', 'City View')}</option>
                     <option value="pool">{t('poolView', 'Pool View')}</option>
                     <option value="street">{t('streetView', 'Street View')}</option>
                     <option value="none">{t('noView', 'No View')}</option>
                   </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-2">
                 <label className="flex items-center gap-2 p-3 rounded-lg border border-border/20 dark:border-white/10 cursor-pointer hover:bg-section dark:hover:bg-white/5 transition-colors">
                    <input 
                       type="checkbox" 
                       name="parking"
                       checked={formData.parking}
                       onChange={handleInputChange}
                       className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-textDark dark:text-white select-none">
                       🚗 {t('hasParking', 'Has Parking')}
                    </span>
                 </label>

                 <label className="flex items-center gap-2 p-3 rounded-lg border border-border/20 dark:border-white/10 cursor-pointer hover:bg-section dark:hover:bg-white/5 transition-colors">
                    <input 
                       type="checkbox" 
                       name="furnished"
                       checked={formData.furnished}
                       onChange={handleInputChange}
                       className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-textDark dark:text-white select-none">
                       🛋️ {t('furnished', 'Furnished')}
                    </span>
                 </label>

                 <label className="flex items-center gap-2 p-3 rounded-lg border border-border/20 dark:border-white/10 cursor-pointer hover:bg-section dark:hover:bg-white/5 transition-colors">
                    <input 
                       type="checkbox" 
                       name="isSimilar"
                       checked={formData.isSimilar}
                       onChange={handleInputChange}
                       className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-textDark dark:text-white select-none">
                       {t('displayInSimilarUnits', 'Display in similar units section')}
                    </span>
                 </label>

                 <label className="flex items-center gap-2 p-3 rounded-lg border border-border/20 dark:border-white/10 cursor-pointer hover:bg-section dark:hover:bg-white/5 transition-colors">
                    <input 
                       type="checkbox" 
                       name="isFavorite"
                       checked={formData.isFavorite}
                       onChange={handleInputChange}
                       className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <Star size={16} className={formData.isFavorite ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} />
                    <span className="text-sm text-textDark dark:text-white select-none">
                       {t('addToFavorites', 'Add to Favorites')}
                    </span>
                 </label>
              </div>
            </div>
          )}

          {/* Step 2: Details & Location */}
          {currentStep === 2 && (
            <div className="space-y-8">
              {/* Contact Info Section */}
              <div className="space-y-4">
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <Check size={20} /> {t('contactInformation')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Input label={t('firstName')} name="contactFirstName" value={formData.contactFirstName} onChange={handleInputChange} />
                     <Input label={t('familyName')} name="contactFamilyName" value={formData.contactFamilyName} onChange={handleInputChange} />
                     <Input label={t('phone')} name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} />
                     <Input label={t('altPhone')} name="contactAltPhone" value={formData.contactAltPhone} onChange={handleInputChange} />
                     <Input label={t('address')} name="contactAddress" value={formData.contactAddress} onChange={handleInputChange} className="md:col-span-2" />
                     <Input label={t('numberOfServices')} name="contactServicesCount" type="number" value={formData.contactServicesCount} onChange={handleInputChange} />
                  </div>
              </div>

              <hr className="border-border/10" />

               {/* Building Information */}
               <div className="space-y-4">
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <Building2 size={20} /> {t('buildingInfo', 'Building Information')}
                  </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <Input label={t('buildingCode', 'Building Code')} name="buildingCode" value={formData.buildingCode} onChange={handleInputChange} />
                       <Input label={t('buildingFloors', 'Building Floors')} name="buildingFloors" value={formData.buildingFloors} type="number" onChange={handleInputChange} />
                   </div>
               </div>

              <hr className="border-border/10" />

              {/* Unit Account Details */}
              <div className="space-y-4">
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <Building2 size={20} /> {t('unitAccountDetails', 'Unit Account Details')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('installationType')}</label>
                        <select 
                            name="installationType"
                            value={formData.installationType}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white outline-none focus:border-primary [&>option]:bg-white [&>option]:text-black dark:[&>option]:bg-gray-800 dark:[&>option]:text-white"
                        >
                            <option value="cash">{t('cash')}</option>
                            <option value="installment">{t('installment')}</option>
                        </select>
                      </div>
                      <Input label={t('annualInstallment')} name="annualInstallment" type="number" value={formData.annualInstallment} onChange={handleInputChange} prefix="$" />
                      <Input label={t('totalPrice')} name="price" type="number" value={formData.price} onChange={handleInputChange} prefix="$" required />
                  </div>
              </div>

              <hr className="border-border/10" />

              {/* Interactive Location */}
              <div className="space-y-4">
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <MapPin size={20} /> {t('locationFeatures')}
                  </h3>
                  
                  {/* Map Embed */}
                  <div className="md:col-span-2 relative h-96 rounded-xl overflow-hidden border border-border/20 bg-section dark:bg-white/5 group z-0">
                     <LocationPicker 
                        lat={formData.latitude} 
                        lng={formData.longitude} 
                        selectedCity={cities.find(c => c.slug === formData.city || c._id === formData.city)?.nameEn || formData.city}
                        onLocationSelect={(lat, lng) => {
                            setFormData(prev => ({
                                ...prev,
                                latitude: lat,
                                longitude: lng
                            }));
                        }}
                     />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label={t('unitAddressAr', 'Unit Address (Arabic)')}
                            name="addressAr"
                            value={formData.addressAr}
                            onChange={handleInputChange}
                            placeholder="عنوان الوحدة بالعربية"
                            dir="rtl"
                        />
                        <Input 
                            label={t('unitAddressEn', 'Unit Address (English)')}
                            name="addressEn"
                            value={formData.addressEn}
                            onChange={handleInputChange}
                            placeholder="Unit Address in English"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('city', 'City / Location')}</label>
                        <select 
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white outline-none focus:border-primary [&>option]:bg-white [&>option]:text-black dark:[&>option]:bg-gray-800 dark:[&>option]:text-white"
                        >
                            <option value="">{t('selectCity', 'Select City')}</option>
                            {cities.map((city, idx) => (
                                <option key={city.id || city._id || `city-${idx}`} value={city.slug || city.id || city._id}>
                                    {t.language === 'ar' ? city.nameAr : city.nameEn}
                                </option>
                            ))}
                        </select>
                      </div>
                      <Input label={t('latitude')} name="latitude" value={formData.latitude} onChange={handleInputChange} />
                      <Input label={t('longitude')} name="longitude" value={formData.longitude} onChange={handleInputChange} />
                  </div>
              </div>
            </div>
          )}

          {/* Step 3: Media & Descriptions */}
          {currentStep === 3 && (
            <div className="space-y-8">
               {/* Media Upload */}
               <div className="space-y-4">
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <Image size={20} /> {t('mediaUpload')}
                  </h3>
                  <div className="border-2 border-dashed border-border/40 rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-section/30 dark:bg-white/5">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*,video/*,.pdf"
                      onChange={handleImageUpload}
                      className="hidden" 
                      id="media-upload"
                    />
                    <label htmlFor="media-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                        <Upload size={32} />
                      </div>
                      <h4 className="font-semibold text-textDark dark:text-white">{t('uploadMedia')}</h4>
                      <p className="text-textLight text-sm">{t('dragAndDropDetails', 'Supports JPEG, PNG, GIF, MP4, PDF, PSD, AI, Word, PPT. Max 40MB.')}</p>
                    </label>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-border/20 bg-black/10">
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

               <hr className="border-border/10" />

               {/* Descriptions */}
               <div className="space-y-4">
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <Building2 size={20} /> {t('unitDescriptions', 'Unit Descriptions')}
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <div className="flex justify-between mb-1">
                          <label className="text-sm font-medium text-textLight dark:text-gray-400">{t('descriptionAr')}</label>
                          <span className="text-xs text-gray-500">{formData.descriptionAr.length} chars</span>
                      </div>
                      <textarea
                        name="descriptionAr"
                        value={formData.descriptionAr}
                        onChange={handleInputChange}
                        rows="5"
                        placeholder="أدخل وصف الوحدة بالعربية..."
                        dir="rtl"
                        className="w-full px-4 py-3 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white outline-none focus:border-primary resize-none"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                          <label className="text-sm font-medium text-textLight dark:text-gray-400">{t('descriptionEn')}</label>
                          <span className="text-xs text-gray-500">{formData.descriptionEn.length} chars</span>
                      </div>
                      <textarea
                        name="descriptionEn"
                        value={formData.descriptionEn}
                        onChange={handleInputChange}
                        rows="5"
                        placeholder="Enter unit description in English..."
                        className="w-full px-4 py-3 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white outline-none focus:border-primary resize-none"
                      />
                     </div>
                  </div>
               </div>

                <hr className="border-border/10" />

               {/* Private Notes Section (Sales Only) */}
               {user?.role === 'sales' && (
                 <div className="space-y-4">
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                        <FileText size={20} /> {t('privateNotes')}
                    </h3>
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700/30 rounded-lg p-4">
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-4 flex items-center gap-2">
                            <Lock size={12} /> {t('privateNotesWarning', 'These notes are visible ONLY to you.')}
                        </p>
                        
                        <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                            {formData.privateNotes.map((note, idx) => (
                                <div key={idx} className="bg-white dark:bg-black/20 p-3 rounded border border-yellow-100 dark:border-yellow-900/20 text-sm">
                                    <p className="text-slate-800 dark:text-gray-200">{note.text}</p>
                                    <span className="text-xs text-slate-400 mt-1 block">{new Date(note.date).toLocaleString()}</span>
                                </div>
                            ))}
                            {formData.privateNotes.length === 0 && <p className="text-sm text-gray-400 italic">No notes added yet.</p>}
                        </div>

                        <div className="flex gap-2">
                            <Input 
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Add a private note..."
                                className="flex-grow text-sm"
                            />
                            <Button size="sm" onClick={handleAddNote} disabled={!noteText.trim()}>Add Note</Button>
                        </div>
                    </div>
                 </div>
               )}
            </div>
          )}

          {/* Step 4: Contact Info & Amenities */}
          {currentStep === 4 && (
            <div className="space-y-8">
               {/* Contact Details */}
               <div className="space-y-4">
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <Phone size={20} /> {t('contactDetails')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Input label={t('contactName')} name="finalContactName" value={formData.finalContactName} onChange={handleInputChange} />
                     <Input label={t('whatsapp')} name="finalContactWhatsapp" value={formData.finalContactWhatsapp} onChange={handleInputChange} />
                     <Input label={t('phone')} name="finalContactPhone" value={formData.finalContactPhone} onChange={handleInputChange} />
                     <Input label={t('email')} name="finalContactEmail" value={formData.finalContactEmail} onChange={handleInputChange} />
                  </div>
               </div>

               <hr className="border-border/10" />

               {/* Amenities */}
               <div className="space-y-4">
                 <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <Check size={20} /> {t('featuresAndAmenities')}
                 </h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {amenitiesList.map(item => (
                        <label 
                          key={item} 
                          className={`
                            flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
                            ${formData.amenities.includes(item) 
                              ? 'border-primary bg-primary/10 text-primary' 
                              : 'border-border/20 dark:border-white/10 hover:bg-section dark:hover:bg-white/5 text-textLight'}
                          `}
                        >
                          <input 
                            type="checkbox"
                            className="hidden"
                            checked={formData.amenities.includes(item)}
                            onChange={() => handleArrayToggle('amenities', item)}
                          />
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.amenities.includes(item) ? 'bg-primary border-primary text-white' : 'border-gray-400'}`}>
                            {formData.amenities.includes(item) && <Check size={14} />}
                          </div>
                          <span className="capitalize text-sm">{t(item) || item}</span>
                        </label>
                    ))}
                 </div>
                 
                 {/* Custom Amenity Input */}
                 <div className="flex gap-2 mt-4 items-end max-w-md">
                    <div className="flex-grow">
                        <Input 
                            label={t('addCustomAmenity', 'Add Custom Feature')} 
                            value={customAmenityText}
                            onChange={(e) => setCustomAmenityText(e.target.value)}
                            placeholder="e.g. Private Cinema"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddCustomAmenity(e);
                            }}
                        />
                    </div>
                    <Button 
                        type="button" 
                        onClick={handleAddCustomAmenity}
                        className="mb-1"
                        variant="primary"
                        disabled={!customAmenityText.trim()}
                    >
                        <Upload size={18} className="rotate-90" />
                    </Button>
                 </div>
               </div>

               <hr className="border-border/10" />

               {/* Nearby Facilities */}
               <div className="space-y-4">
                 <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <Building2 size={20} /> {t('nearbyFacilities')}
                 </h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {nearbyList.map(item => (
                        <label 
                          key={item} 
                          className={`
                            flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
                            ${formData.nearbyFacilities.includes(item) 
                              ? 'border-primary bg-primary/10 text-primary' 
                              : 'border-border/20 dark:border-white/10 hover:bg-section dark:hover:bg-white/5 text-textLight'}
                          `}
                        >
                          <input 
                            type="checkbox"
                            className="hidden"
                            checked={formData.nearbyFacilities.includes(item)}
                            onChange={() => handleArrayToggle('nearbyFacilities', item)}
                          />
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.nearbyFacilities.includes(item) ? 'bg-primary border-primary text-white' : 'border-gray-400'}`}>
                            {formData.nearbyFacilities.includes(item) && <Check size={14} />}
                          </div>
                          <span className="capitalize text-sm">{t(item) || item}</span>
                        </label>
                    ))}
                 </div>
               </div>
            </div>
          )}

          {/* Step 5: Status Management & Finalize */}
          {currentStep === 5 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                    <Star size={32} className="fill-current" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold text-textDark dark:text-white">
                      {isEditMode ? t('manageUnitStatus', 'Status Management') : t('readyToPublish', 'Ready to Publish?')}
                    </h3>
                    <p className="text-textLight dark:text-gray-400">
                      {isEditMode 
                        ? t('manageUnitDescription', 'Update the unit lifecycle status directly.') 
                        : t('createUnitFirst', 'Review your details and create the unit to enable advanced status controls.')}
                    </p>
                  </div>
                </div>

                {!isEditMode ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-border/20 text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto">
                        <Check size={32} />
                    </div>
                    <h4 className="text-xl font-bold">{t('allSet', 'Everything is set!')}</h4>
                    <p className="max-w-md mx-auto text-textLight">
                        {t('finalizeInstructions', 'Click "Create & Finish" below to save your unit. Once created, you can manage reservations, sales, and more.')}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-border/20 shadow-sm">
                    <UnitStatusControl 
                        unit={{ ...formData, id }} 
                        onUpdate={(updatedUnit) => {
                            if (updatedUnit?.status) {
                                setFormData(prev => ({ ...prev, status: updatedUnit.status }));
                            } else {
                                estateService.getUnits().then(units => {
                                    const u = units.find(u => String(u.id) === String(id) || String(u._id) === String(id));
                                    if (u) setFormData(prev => ({ ...prev, status: u.status }));
                                });
                            }
                        }}
                    />
                  </div>
                )}
              </div>

              {/* Quick Summary Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-section dark:bg-white/5 p-6 rounded-xl border border-border/10">
                  <span className="text-xs uppercase tracking-wider text-textLight font-bold mb-2 block">{t('currentPrice', 'Current Price')}</span>
                  <div className="text-2xl font-bold text-primary">{formData.price || '---'} {t('currency', 'EGP')}</div>
                </div>
                <div className="bg-section dark:bg-white/5 p-6 rounded-xl border border-border/10">
                  <span className="text-xs uppercase tracking-wider text-textLight font-bold mb-2 block">{t('unitArea', 'Total Area')}</span>
                  <div className="text-2xl font-bold text-textDark dark:text-white">{formData.area || '---'} m²</div>
                </div>
                <div className="bg-section dark:bg-white/5 p-6 rounded-xl border border-border/10">
                  <span className="text-xs uppercase tracking-wider text-textLight font-bold mb-2 block">{t('unitStatus', 'Unit Status')}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${formData.status === 'available' ? 'bg-green-500' : formData.status === 'sold' ? 'bg-red-500' : 'bg-warning'}`} />
                    <div className="text-2xl font-bold capitalize text-textDark dark:text-white">{t(formData.status)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border/10">
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft size={18} className="me-2" /> {t('previous')}
            </Button>
            
            {currentStep < steps.length ? (
              <Button type="button" onClick={nextStep}>
                {t('next')} <ChevronRight size={18} className="ms-2" />
              </Button>
            ) : (
              <Button type="submit" variant="primary" className="px-10" disabled={loading} isLoading={loading}>
                {isEditMode ? t('finishManagement', 'Finish & Close') : t('createUnitFinish', 'Create & Finish')}
              </Button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddUnit;
