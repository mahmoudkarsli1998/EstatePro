import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, CheckCircle, XCircle, RotateCcw, AlertTriangle, FileText, Send } from 'lucide-react';
import Button from '../shared/Button';
import { unitsService } from '../../services/unitsService';
import { useNotifications } from '../../context/NotificationsContext';

/**
 * UnitStatusControl - A control panel for unit status operations
 * Features: Reserve, Sell, Cancel Reservation
 */
const UnitStatusControl = ({ unit, onUpdate, size = "md", layout = "grid" }) => {
    const { t } = useTranslation();
    const { createNotification } = useNotifications();
    const [loading, setLoading] = useState(false);

    const handleAction = async (action) => {
        setLoading(true);
        try {
            let res;
            if (action === 'reserve') {
                res = await unitsService.reserve(unit.id || unit._id);
                createNotification(t('unitReservedSuccess', 'Unit reserved successfully'), 'success');
            } else if (action === 'sell') {
                res = await unitsService.sell(unit.id || unit._id);
                createNotification(t('unitSoldSuccess', 'Unit marked as sold'), 'success');
            } else if (action === 'rent') {
                res = await unitsService.updateStatus(unit.id || unit._id, 'rented');
                createNotification(t('unitRentedSuccess', 'Unit marked as rented'), 'success');
            } else if (action === 'cancel') {
                res = await unitsService.cancelReservation(unit.id || unit._id);
                createNotification(t('unitCancelledSuccess', 'Reservation cancelled'), 'success');
            } else if (action === 'delete') {
                if (window.confirm(t('confirmDeleteUnit', 'Are you sure you want to delete this unit?'))) {
                    await estateService.deleteUnit(unit.id || unit._id);
                    createNotification(t('unitDeletedSuccess', 'Unit deleted successfully'), 'success');
                    if (onUpdate) onUpdate({ deleted: true });
                    return;
                }
            } else if (action === 'draft') {
                res = await unitsService.updateStatus(unit.id || unit._id, 'draft');
                createNotification(t('unitDraftSuccess', 'Moved to drafts'), 'success');
            } else if (action === 'publish') {
                res = await unitsService.updateStatus(unit.id || unit._id, 'available');
                createNotification(t('unitPublishedSuccess', 'Unit published successfully'), 'success');
            }
            
            if (onUpdate) onUpdate(res);
        } catch (err) {
            console.error('Status Update Error:', err);
            createNotification(err?.message || t('statusUpdateError', 'Failed to update unit status'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const containerStyle = layout === 'grid' 
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
        : "flex flex-wrap gap-3";

    return (
        <div className={containerStyle}>
            {unit.status === 'draft' && (
                <Button 
                    size="lg"
                    variant="primary" 
                    onClick={(e) => { e.stopPropagation(); handleAction('publish'); }}
                    isLoading={loading}
                    className="w-full flex items-center justify-center py-6 shadow-lg shadow-primary/10"
                >
                    <Send size={20} className="me-3" />
                    <div className="text-left">
                        <span className="block font-bold">{t('publishNow', 'Publish Now')}</span>
                        <span className="text-xs opacity-70">{t('makeVisiblePublic', 'Make this unit visible to everyone')}</span>
                    </div>
                </Button>
            )}

            {(unit.status === 'available' || unit.status === 'active') && (
                <>
                    <Button 
                        size="lg"
                        variant="warning" 
                        onClick={(e) => { e.stopPropagation(); handleAction('reserve'); }}
                        isLoading={loading}
                        className="w-full flex items-center justify-center py-6"
                    >
                        <Clock size={20} className="me-3" />
                        <div className="text-left">
                            <span className="block font-bold">{t('reserveUnit', 'Reserve Unit')}</span>
                            <span className="text-xs opacity-70">{t('setAsReserved', 'Block unit from search')}</span>
                        </div>
                    </Button>
                    <Button 
                        size="lg"
                        variant="primary" 
                        onClick={(e) => { e.stopPropagation(); handleAction('sell'); }}
                        isLoading={loading}
                        className="w-full flex items-center justify-center py-6 bg-green-500 hover:bg-green-600 text-white border-none"
                    >
                        <CheckCircle size={20} className="me-3" />
                        <div className="text-left">
                            <span className="block font-bold">{t('markAsSold', 'Mark as Sold')}</span>
                            <span className="text-xs opacity-70">{t('permanentSale', 'Finalize the property sale')}</span>
                        </div>
                    </Button>
                    <Button 
                        size="lg"
                        variant="primary" 
                        onClick={(e) => { e.stopPropagation(); handleAction('rent'); }}
                        isLoading={loading}
                        className="w-full flex items-center justify-center py-6 bg-blue-500 hover:bg-blue-600 text-white border-none"
                    >
                        <FileText size={20} className="me-3" />
                        <div className="text-left">
                            <span className="block font-bold">{t('markAsRented', 'Mark as Rented')}</span>
                            <span className="text-xs opacity-70">{t('leaseUnit', 'Set as currently leased')}</span>
                        </div>
                    </Button>
                    <Button 
                        size="lg"
                        variant="outline" 
                        onClick={(e) => { e.stopPropagation(); handleAction('draft'); }}
                        isLoading={loading}
                        className="w-full flex items-center justify-center py-6"
                    >
                        <FileText size={20} className="me-3" />
                        <div className="text-left">
                            <span className="block font-bold">{t('moveToDraft', 'Move to Draft')}</span>
                            <span className="text-xs opacity-70">{t('hideFromPublic', 'Stop showing this unit')}</span>
                        </div>
                    </Button>
                </>
            )}

            {(unit.status === 'reserved' || unit.status === 'sold' || unit.status === 'rented') && (
                <Button 
                    size="lg"
                    variant="outline" 
                    onClick={(e) => { e.stopPropagation(); handleAction('publish'); }}
                    isLoading={loading}
                    className="w-full flex items-center justify-center py-6 border-green-500 text-green-500 hover:bg-green-50"
                >
                    <RotateCcw size={20} className="me-3" />
                    <div className="text-left">
                        <span className="block font-bold">{t('makeAvailable', 'Make Available')}</span>
                        <span className="text-xs opacity-70">{t('resetStatus', 'Back to regular listing')}</span>
                    </div>
                </Button>
            )}

            {unit.status === 'reserved' && (
                <Button 
                    size="lg"
                    variant="danger" 
                    onClick={(e) => { e.stopPropagation(); handleAction('cancel'); }}
                    isLoading={loading}
                    className="w-full flex items-center justify-center py-6"
                >
                    <XCircle size={20} className="me-3" />
                    <div className="text-left">
                        <span className="block font-bold">{t('cancelReservation', 'Cancel Reservation')}</span>
                        <span className="text-xs opacity-70">{t('releaseHold', 'Immediately release this unit')}</span>
                    </div>
                </Button>
            )}

            <Button 
                size="lg"
                variant="ghost" 
                onClick={(e) => { e.stopPropagation(); handleAction('delete'); }}
                isLoading={loading}
                className="w-full flex items-center justify-center py-6 text-red-500 hover:bg-red-50 sm:col-span-2 lg:col-span-3 border border-dashed border-red-200"
            >
                <XCircle size={20} className="me-3" />
                <div className="text-left">
                    <span className="block font-bold">{t('deletePermanently', 'Delete Unit Permanently')}</span>
                    <span className="text-xs opacity-70">{t('irreversibleAction', 'This action cannot be undone')}</span>
                </div>
            </Button>
        </div>
    );
};

export default UnitStatusControl;
