import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Search, Filter, Home, DollarSign, Maximize, Layers, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import Badge from '../../components/shared/Badge';
import { api } from '../../utils/api';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';

const Units = () => {
  const { t } = useTranslation();
  const {
    filteredItems: units,
    loading,
    isModalOpen,
    editingItem,
    formData,
    searchTerm,
    setSearchTerm,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleSubmit,
    handleDelete,
    handleExport,
    setFormData // Needed for manual updates to form state (dependent dropdowns)
  } = useDashboardCrud(
    api.getUnits,
    api.createUnit,
    api.updateUnit,
    api.deleteUnit,
    { 
      number: '', type: 'residential', floor: '', area_m2: '', 
      price: '', status: 'available', projectId: '', phaseId: '', blockId: '',
      features: { bedrooms: 0, bathrooms: 0 },
      image: null
    },
    (unit, term) => 
      unit.number.toLowerCase().includes(term.toLowerCase()) || 
      unit.type.toLowerCase().includes(term.toLowerCase())
  );

  // Dependent Data States
  const [projects, setProjects] = useState([]);
  const [phases, setPhases] = useState([]);
  const [blocks, setBlocks] = useState([]);

  // Load Projects on Mount
  useEffect(() => {
    api.getProjects().then(setProjects);
  }, []);

  // Load Phases/Blocks when Project changes (in Modal)
  useEffect(() => {
    if (formData.projectId) {
      api.getPhases(formData.projectId).then(setPhases);
      api.getBlocks(formData.projectId).then(setBlocks);
    } else {
      setPhases([]);
      setBlocks([]);
    }
  }, [formData.projectId]);

  const onExport = () => {
    handleExport(
      "units_export.csv",
      ["ID", "Number", "Type", "Floor", "Area", "Price", "Status", "Project ID"],
      u => [u.id, `"${u.number}"`, u.type, u.floor, u.area_m2, u.price, u.status, u.projectId].join(",")
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'reserved': return 'warning';
      case 'sold': return 'neutral';
      default: return 'default';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">{t('units')}</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onExport}>
            <Download size={18} className="me-2" /> {t('export')}
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} className="me-2" /> {t('addUnit')}
          </Button>
        </div>
      </div>

      <div className="bg-dark-card border border-white/10 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="relative max-w-md w-full">
            <Search size={18} className="absolute inset-y-0 start-3 my-auto text-gray-400" />
            <input 
              type="text" 
              placeholder={t('searchUnits')}
              className="w-full ps-10 pe-4 py-2 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="ghost" size="sm">
            <Filter size={18} className="me-2" /> {t('filter')}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 font-medium text-sm">
              <tr>
                <th className="px-6 py-4 text-start">{t('number')}</th>
                <th className="px-6 py-4 text-start">{t('type')}</th>
                <th className="px-6 py-4 text-start">{t('location')}</th>
                <th className="px-6 py-4 text-start">{t('details')}</th>
                <th className="px-6 py-4 text-start">{t('price')}</th>
                <th className="px-6 py-4 text-start">{t('status')}</th>
                <th className="px-6 py-4 text-start">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-4 text-center">{t('loading')}</td></tr>
              ) : units.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-4 text-center">{t('noUnitsFound', 'No units found')}</td></tr>
              ) : units.map((unit) => (
                <tr key={unit.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{unit.number}</td>
                  <td className="px-6 py-4 capitalize text-gray-300">{t(unit.type) || unit.type}</td>
                  <td className="px-6 py-4 text-gray-300">
                    <div className="flex flex-col text-xs">
                       <span>{t('floor')}: {unit.floor}</span>
                       <span className="text-gray-500">{t('project')} ID: {unit.projectId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    {unit.area_m2} m² • {unit.features?.bedrooms || 0} {t('bed')} • {unit.features?.bathrooms || 0} {t('bath')}
                  </td>
                  <td className="px-6 py-4 font-medium text-primary">${(unit.price || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusColor(unit.status)}>
                      {t(unit.status) || unit.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button 
                      className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                      onClick={() => handleOpenModal(unit)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="p-1 text-red-500 hover:text-red-400 transition-colors"
                      onClick={() => handleDelete(unit.id)}
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? t('editUnit') : t('addUnit')}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('project')}</label>
                <select 
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">{t('selectProject')}</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('phaseBlock')}</label>
                <div className="flex gap-2">
                    <select 
                      className="w-1/2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary"
                      name="phaseId"
                      value={formData.phaseId || ''}
                      onChange={handleInputChange}
                      disabled={!formData.projectId}
                    >
                      <option value="">{t('phase')}</option>
                      {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select 
                      className="w-1/2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary"
                      name="blockId"
                      value={formData.blockId || ''}
                      onChange={handleInputChange}
                      disabled={!formData.projectId}
                    >
                      <option value="">{t('block')}</option>
                      {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input 
              label={t('unitNumber')} 
              name="number"
              value={formData.number}
              onChange={handleInputChange}
              required
            />
            <Input 
              label={t('floor')} 
              type="number"
              name="floor"
              value={formData.floor}
              onChange={handleInputChange}
              required
            />
             <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('type')}</label>
                <select 
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="residential">{t('residential')}</option>
                  <option value="commercial">{t('commercial')}</option>
                  <option value="office">{t('office')}</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label={t('area') + " (m²)"} 
              type="number"
              name="area_m2"
              value={formData.area_m2}
              onChange={handleInputChange}
              required
            />
            <Input 
              label={t('price') + " ($)"} 
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <Input 
                label={t('bedrooms')}
                type="number"
                value={formData.features?.bedrooms || ''}
                onChange={(e) => setFormData({
                    ...formData, 
                    features: { ...formData.features, bedrooms: parseInt(e.target.value) || 0 }
                })}
             />
             <Input 
                label={t('bathrooms')}
                type="number"
                value={formData.features?.bathrooms || ''}
                onChange={(e) => setFormData({
                    ...formData, 
                    features: { ...formData.features, bathrooms: parseInt(e.target.value) || 0 }
                })}
             />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t('status')}</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="available">{t('available')}</option>
              <option value="reserved">{t('reserved')}</option>
              <option value="sold">{t('sold')}</option>
            </select>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>{t('cancel')}</Button>
            <Button type="submit">{editingItem ? t('updateUnit') : t('createUnit')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Units;
