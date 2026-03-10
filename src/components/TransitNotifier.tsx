import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Sparkles, Info, AlertTriangle, CheckCircle, Volume2 } from 'lucide-react';
import { useSyllabusStore } from '../store';
import { getTransitNotifications } from '../services/astrologyService';
import { ReadAloudButton } from './ReadAloudButton';

export const TransitNotifier: React.FC = () => {
  const { 
    userBirthday, userBirthTime, userBirthTimezone, userLocation,
    transitNotifications, addTransitNotifications, lastTransitCheck, setLastTransitCheck,
    markNotificationRead, clearNotifications
  } = useSyllabusStore();

  useEffect(() => {
    const checkTransits = async () => {
      if (!userBirthday || !userBirthTime || !userLocation) return;

      const now = new Date();
      const lastCheck = lastTransitCheck ? new Date(lastTransitCheck) : null;
      
      // Check every 6 hours
      if (!lastCheck || (now.getTime() - lastCheck.getTime() > 6 * 60 * 60 * 1000)) {
        try {
          const newNotifications = await getTransitNotifications({
            date: userBirthday,
            time: userBirthTime,
            location: userLocation.name || "Unknown",
            timezone: userBirthTimezone
          });
          
          if (newNotifications && newNotifications.length > 0) {
            addTransitNotifications(newNotifications);
          }
          setLastTransitCheck(now.toISOString());
        } catch (error) {
          console.error("Transit check failed", error);
        }
      }
    };

    checkTransits();
  }, [userBirthday, userBirthTime, userLocation, lastTransitCheck]);

  const unreadCount = transitNotifications?.filter(n => !n.isRead).length || 0;

  if (!transitNotifications || transitNotifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-auto z-[3000] flex flex-col gap-3 sm:gap-4 max-w-full sm:max-w-sm pointer-events-none">
      <AnimatePresence>
        {transitNotifications?.filter(n => !n.isRead).slice(0, 3).map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pointer-events-auto bg-white border border-archive-line shadow-2xl p-3 sm:p-4 rounded-xl flex gap-3 sm:gap-4 items-start group"
          >
            <div className="mt-1 flex-shrink-0">
              {notification.type === 'info' && <Info size={18} className="text-blue-500" />}
              {notification.type === 'warning' && <AlertTriangle size={18} className="text-amber-500" />}
              {notification.type === 'success' && <CheckCircle size={18} className="text-emerald-500" />}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-mono uppercase opacity-30 tracking-widest truncate">Celestial Transit</span>
                <ReadAloudButton text={notification.message} className="!p-1 !h-auto !w-auto !bg-transparent !border-none !shadow-none opacity-20 hover:opacity-100" />
              </div>
              <p className="handwritten text-sm italic leading-tight text-archive-ink break-words">
                {notification.message}
              </p>
              <p className="text-[9px] font-mono uppercase opacity-30">
                {new Date(notification.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <button 
              onClick={() => markNotificationRead(notification.id)}
              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1 hover:bg-archive-ink/5 rounded flex-shrink-0"
            >
              <X size={16} className="opacity-40" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {unreadCount > 3 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-archive-ink text-archive-bg px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-widest self-start shadow-lg"
        >
          + {unreadCount - 3} more transits
        </motion.div>
      )}
    </div>
  );
};
