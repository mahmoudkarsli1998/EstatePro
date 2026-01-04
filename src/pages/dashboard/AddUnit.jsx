import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Building2, MapPin, Image, Phone, Check, ChevronLeft, ChevronRight, Upload, X, Save, Star, FileText, Lock
} from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import LocationPicker from '../../components/shared/LocationPicker';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../utils/api';

const AddUnit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user
  const { id } = useParams();
  const isEditMode = !!id;
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [agents, setAgents] = useState([]);
  const [customAmenityText, setCustomAmenityText] = useState('');
  const [noteText, setNoteText] = useState(''); // State for new note input

  // Load initial data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [citiesData, projectsData, agentsData] = await Promise.all([
          api.getCities(),
          api.getProjects(),
          api.getAgents()
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
      api.getUnits().then(units => {
        const unit = units.find(u => u.id === parseInt(id));
        if (unit) {
          setFormData({
             titleAr: unit.number || '', // mapping back from number
             titleEn: unit.number || '',
             type: unit.type || 'residential',
             targetAudience: unit.targetAudience || 'family',
             category: unit.category || 'sale',
             status: unit.status || 'available',
             occupants: unit.occupants || unit.features?.bedrooms || '',
             buildingAge: unit.buildingAge || '',
             area: unit.area_m2 || '',
             isSimilar: unit.isSimilar || false,
             
             contactFamilyName: unit.contactFamilyName || '',
             contactFirstName: unit.contactFirstName || '',
             contactServicesCount: unit.contactServicesCount || '',
             contactPhone: unit.contactPhone || '',
             contactAltPhone: unit.contactAltPhone || '',
             contactAddress: unit.contactAddress || '',
             
             buildingCode: unit.buildingCode || '',
             buildingFloors: unit.buildingFloors || '',
             
             installationType: unit.installationType || 'cash',
             annualInstallment: unit.annualInstallment || '',
             price: unit.price || '',
             
             address: unit.address || '',
             addressAr: unit.addressAr || unit.address || '',
             addressEn: unit.addressEn || unit.address || '',
             city: unit.city || 'cairo',
             latitude: unit.latitude || '30.0444', 
             longitude: unit.longitude || '31.2357',
             
             images: unit.images || [],
             descriptionAr: unit.descriptionAr || '',
             descriptionEn: unit.descriptionEn || '',
             
             finalContactName: unit.finalContactName || '',
             finalContactWhatsapp: unit.finalContactWhatsapp || '',
             finalContactPhone: unit.finalContactPhone || '',
             finalContactEmail: unit.finalContactEmail || '',
             
             
             amenities: unit.features?.amenities || [],
             nearbyFacilities: unit.features?.nearbyFacilities || [],
             
             existingFeatures: unit.features || {},
             
             projectId: unit.projectId || '',
             agentId: unit.agentId || '',
             isFavorite: unit.isFavorite || false,
             privateNotes: unit.privateNotes || []
          });
        }
        setLoading(false);
      });
    }
  }, [id, isEditMode]);
  
  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Property Information
    titleAr: '',
    titleEn: '',
    type: 'residential', // dropdown: Apartment, Villa, Office, Commercial, Land
    targetAudience: 'family', // Individual, Family, Company
    category: 'sale', // dropdown
    status: 'available', // For Sale, For Rent, Sold, Rented
    occupants: '',
    buildingAge: '',
    area: '',
    isSimilar: false,
    isFavorite: false,
    projectId: '',
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
    const newImages = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
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

  const nextStep = (e) => {
    if (e) e.preventDefault();
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
      const apiData = {
        ...formData,
        number: formData.titleEn,
        price: parseFloat(formData.price) || 0,
        area_m2: parseFloat(formData.area) || 0,
        status: statusOverride || formData.status,
        projectId: parseInt(formData.projectId) || null,
        agentId: parseInt(formData.agentId) || null,
        features: {
           ...formData.existingFeatures, // Preserve existing features like parking, view, etc.
           amenities: formData.amenities,
           nearbyFacilities: formData.nearbyFacilities,
           bedrooms: parseInt(formData.occupants) || 0,
           bathrooms: formData.existingFeatures.bathrooms || 0
        }
      };

      if (isEditMode) {
        await api.updateUnit(parseInt(id), { ...apiData, userId: user?.id });
      } else {
        await api.createUnit({ ...apiData, createdById: user?.id });
      }
      navigate('/dashboard/units');
    } catch (error) {
      console.error('Error saving unit:', error);
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
                <Save size={18} className="me-2" /> {t('saveDraft')}
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
                     <option value="commercial">{t('commercial')}</option>
                     <option value="land">{t('land')}</option>
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
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textLight dark:text-gray-400 mb-1">{t('assignedAgent', 'Assigned Agent')}</label>
                    <select 
                      name="agentId"
                      value={formData.agentId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 text-textDark dark:text-white outline-none focus:border-primary [&>option]:bg-white [&>option]:text-black dark:[&>option]:bg-gray-800 dark:[&>option]:text-white"
                    >
                      <option value="">{t('selectAgent', 'Select Agent')}</option>
                      {agents.map(agent => (
                        <option key={agent.id} value={agent.id}>
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
                   label={t('numberOfUnits', 'Number of Units')}
                   name="occupants"
                   type="number"
                   value={formData.occupants}
                   onChange={handleInputChange}
                />
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
              </div>

              <div className="flex flex-wrap gap-4 mt-2">
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
                        selectedCity={cities.find(c => c.id === parseInt(formData.city))?.nameEn || formData.city}
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
                            {cities.map(city => (
                                <option key={city.id} value={city.id}>
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
              <Button type="submit" disabled={loading}>
                {loading ? t('saving') : t('save')}
              </Button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddUnit;
