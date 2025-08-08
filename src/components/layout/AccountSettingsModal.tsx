import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api';

interface AccountSettingsModalProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ open, onClose, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string>('');
  const [watermark, setWatermark] = useState(false);
  const [taskEmail, setTaskEmail] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      apiClient.getCustomerInfo(),
      apiClient.getCustomerPackage()
    ]).then(([info, pkg]) => {
      setCredits(info?.credits ?? 0);
      setWatermark(info?.removeWatermark ?? false);
      setTaskEmail(info?.taskCompletionEmail ?? false);
      setPlan(pkg?.planName || pkg?.plan || 'Free Plan');
    }).finally(() => setLoading(false));
  }, [open]);

  const handleWatermarkToggle = async () => {
    try {
      setWatermark(!watermark);
      await apiClient.setWatermark(!watermark);
    } catch {}
  };

  const handleTaskEmailToggle = async () => {
    try {
      setTaskEmail(!taskEmail);
      await apiClient.updateNotificationPreferences({
        channel: 'email',
        enabled: !taskEmail,
        notificationType: 'task_completion',
      });
    } catch {}
  };

  if (!open) return null;
  return (
    <div
      className={`fixed z-50 transition-all duration-200`}
      style={{
        top: '72px',
        right: '32px',
        width: '660px',
        height: '440px',
        maxWidth: 'none',
        background: 'white',
        borderRadius: '1.25rem',
        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.25)',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={e => e.stopPropagation()}
    >
      <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl" onClick={onClose}>&times;</button>
      <h2 className="text-xl font-bold mb-6">Account Settings</h2>
      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : (
        <>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-gray-800">Credits Usage</span>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-medium">{plan || 'Free Plan'}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-orange-500">{credits ?? 0}</span>
              <span className="text-gray-500">Available Credits</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">Approximately can generate 5 pages</div>
          </div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">Hide Watermark</div>
              <div className="text-xs text-gray-400">Remove \"Powered by\" watermark from generated pages</div>
              <div className="text-xs text-orange-400 mt-1">Available in Standard and Professional plans</div>
            </div>
            <label className="inline-flex items-center cursor-pointer ml-4">
              <input type="checkbox" className="sr-only peer" checked={watermark} onChange={handleWatermarkToggle} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer dark:bg-gray-300 peer-checked:bg-blue-500 transition-all"></div>
              <div className={`absolute ml-1 mt-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform ${watermark ? 'translate-x-5' : ''}`}></div>
            </label>
          </div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">Task Completion Email</div>
              <div className="text-xs text-gray-400">Get notified when page generation is complete</div>
            </div>
            <label className="inline-flex items-center cursor-pointer ml-4">
              <input type="checkbox" className="sr-only peer" checked={taskEmail} onChange={handleTaskEmailToggle} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer dark:bg-gray-300 peer-checked:bg-blue-500 transition-all"></div>
              <div className={`absolute ml-1 mt-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform ${taskEmail ? 'translate-x-5' : ''}`}></div>
            </label>
          </div>
          <button
            className="w-full py-2 mt-2 rounded-lg bg-red-50 text-red-600 font-semibold border border-red-100 hover:bg-red-100 flex items-center justify-center gap-2 text-lg"
            onClick={onLogout}
          >
            <span className="text-xl">&#x1F6AA;</span> Log Out
          </button>
        </>
      )}
    </div>
  );
};

export default AccountSettingsModal; 