// // components/Settings.js
// import React, { useState, useEffect } from 'react';
// import GeneralSettings from './AdminGeneralSettings';
// import ProfileSettings from './AdminProfileSettings';
// import SecuritySettings from './AdminSecuritySettings';
// import NotificationSettings from './AdminNotificationSettings';
// import SystemSettings from './AdminSystemSettings';
// import './AdminPanelSettings.css';

// const Settings = () => {
//   const [activeTab, setActiveTab] = useState('general');
//   const [settings, setSettings] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [saveStatus, setSaveStatus] = useState({});

//   useEffect(() => {
//     fetchSettings();
//   }, []);

//   const fetchSettings = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch('https://egas-server-1.onrender.com/api/v1/admin/settings');
//       const data = await response.json();
      
//       if (response.ok) {
//         setSettings(data.settings);
//       } else {
//         console.error('Failed to fetch settings:', data.message);
//       }
//     } catch (error) {
//       console.error('Network error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateSettings = async (section, newSettings) => {
//     try {
//       setSaveStatus({ ...saveStatus, [section]: 'saving' });
      
//       const response = await fetch(`https://egas-server-1.onrender.com/api/v1/admin/settings/${section}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(newSettings),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setSettings({ ...settings, [section]: data.settings });
//         setSaveStatus({ ...saveStatus, [section]: 'success' });
        
//         // Clear success status after 3 seconds
//         setTimeout(() => {
//           setSaveStatus({ ...saveStatus, [section]: '' });
//         }, 3000);
        
//         return { success: true };
//       } else {
//         setSaveStatus({ ...saveStatus, [section]: 'error' });
//         return { success: false, message: data.message };
//       }
//     } catch (error) {
//       setSaveStatus({ ...saveStatus, [section]: 'error' });
//       return { success: false, message: 'Network error' };
//     }
//   };

//   const tabs = [
//     { id: 'general', label: 'General', icon: 'fas fa-cog' },
//     { id: 'profile', label: 'Profile', icon: 'fas fa-user' },
//     { id: 'security', label: 'Security', icon: 'fas fa-shield-alt' },
//     { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
//     { id: 'system', label: 'System', icon: 'fas fa-server' },
//   ];

//   const renderContent = () => {
//     if (loading) {
//       return (
//         <div className="settings-loading">
//           <i className="fas fa-spinner fa-spin"></i>
//           <p>Loading settings...</p>
//         </div>
//       );
//     }

//     switch (activeTab) {
//       case 'general':
//         return (
//           <GeneralSettings
//             settings={settings.general || {}}
//             onUpdate={(newSettings) => updateSettings('general', newSettings)}
//             saveStatus={saveStatus.general}
//           />
//         );
//       case 'profile':
//         return (
//           <ProfileSettings
//             settings={settings.profile || {}}
//             onUpdate={(newSettings) => updateSettings('profile', newSettings)}
//             saveStatus={saveStatus.profile}
//           />
//         );
//       case 'security':
//         return (
//           <SecuritySettings
//             settings={settings.security || {}}
//             onUpdate={(newSettings) => updateSettings('security', newSettings)}
//             saveStatus={saveStatus.security}
//           />
//         );
//       case 'notifications':
//         return (
//           <NotificationSettings
//             settings={settings.notifications || {}}
//             onUpdate={(newSettings) => updateSettings('notifications', newSettings)}
//             saveStatus={saveStatus.notifications}
//           />
//         );
//       case 'system':
//         return (
//           <SystemSettings
//             settings={settings.system || {}}
//             onUpdate={(newSettings) => updateSettings('system', newSettings)}
//             saveStatus={saveStatus.system}
//           />
//         );
//       default:
//         return <div>Select a settings category</div>;
//     }
//   };

//   return (
//     <div className="settings-container">
//       <div className="settings-header">
//         <h1>Settings</h1>
//         <p>Manage your admin portal configuration and preferences</p>
//       </div>

//       <div className="settings-content">
//         <div className="settings-sidebar">
//           <div className="settings-tabs">
//             {tabs.map(tab => (
//               <button
//                 key={tab.id}
//                 className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
//                 onClick={() => setActiveTab(tab.id)}
//               >
//                 <i className={tab.icon}></i>
//                 <span>{tab.label}</span>
//                 {saveStatus[tab.id] === 'saving' && (
//                   <i className="fas fa-spinner fa-spin saving-indicator"></i>
//                 )}
//                 {saveStatus[tab.id] === 'success' && (
//                   <i className="fas fa-check-circle success-indicator"></i>
//                 )}
//                 {saveStatus[tab.id] === 'error' && (
//                   <i className="fas fa-exclamation-circle error-indicator"></i>
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="settings-main">
//           <div className="settings-panel">
//             {renderContent()}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Settings;























// src/components/admin/AdminPanelSettings.jsx
import React, { useState, useEffect } from 'react';
import GeneralSettings from './AdminGeneralSettings';
import ProfileSettings from './AdminProfileSettings';
import SecuritySettings from './AdminSecuritySettings';
import NotificationSettings from './AdminNotificationSettings';
import SystemSettings from './AdminSystemSettings';
import { adminAPI } from '../../../api/endpoints';
import { useSnackbar } from '../../../hooks/useSnackbar';
import './AdminPanelSettings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState({});

  const { success, error: showError } = useSnackbar();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Since there's no specific settings endpoint, we'll use a mock or fetch from user profile
      const response = await adminAPI.users.getStats(); // Placeholder
      // For now, set mock settings
      setSettings({
        general: {
          siteName: 'e-GAS Admin',
          adminEmail: 'admin@egas.com',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          itemsPerPage: 25,
          language: 'en'
        },
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@egas.com',
          phone: '+1234567890',
          position: 'System Administrator',
          department: 'IT'
        },
        security: {
          twoFactorEnabled: false,
          sessionTimeout: 60,
          loginAlerts: true,
          passwordExpiry: 90
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: false,
          orderAlerts: true,
          paymentAlerts: true,
          userAlerts: true,
          systemAlerts: true,
          marketingEmails: false,
          digestEmail: true,
          digestFrequency: 'daily'
        },
        system: {
          systemName: 'e-GAS Management System',
          systemVersion: '1.0.0',
          storageLimit: 1000,
          backupFrequency: 'daily',
          autoUpdate: false,
          debugMode: false,
          logLevel: 'info',
          maxFileSize: 5,
          sessionEncryption: true
        }
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      showError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (section, newSettings) => {
    try {
      setSaveStatus({ ...saveStatus, [section]: 'saving' });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSettings({ ...settings, [section]: newSettings });
      setSaveStatus({ ...saveStatus, [section]: 'success' });
      success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings updated successfully`);
      
      // Clear success status after 3 seconds
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [section]: '' }));
      }, 3000);
      
      return { success: true };
    } catch (error) {
      setSaveStatus({ ...saveStatus, [section]: 'error' });
      showError(error.message || 'Failed to update settings');
      return { success: false, message: error.message };
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: 'fas fa-cog' },
    { id: 'profile', label: 'Profile', icon: 'fas fa-user' },
    { id: 'security', label: 'Security', icon: 'fas fa-shield-alt' },
    { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
    { id: 'system', label: 'System', icon: 'fas fa-server' },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="settings-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading settings...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'general':
        return (
          <GeneralSettings
            settings={settings.general || {}}
            onUpdate={(newSettings) => updateSettings('general', newSettings)}
            saveStatus={saveStatus.general}
          />
        );
      case 'profile':
        return (
          <ProfileSettings
            settings={settings.profile || {}}
            onUpdate={(newSettings) => updateSettings('profile', newSettings)}
            saveStatus={saveStatus.profile}
          />
        );
      case 'security':
        return (
          <SecuritySettings
            settings={settings.security || {}}
            onUpdate={(newSettings) => updateSettings('security', newSettings)}
            saveStatus={saveStatus.security}
          />
        );
      case 'notifications':
        return (
          <NotificationSettings
            settings={settings.notifications || {}}
            onUpdate={(newSettings) => updateSettings('notifications', newSettings)}
            saveStatus={saveStatus.notifications}
          />
        );
      case 'system':
        return (
          <SystemSettings
            settings={settings.system || {}}
            onUpdate={(newSettings) => updateSettings('system', newSettings)}
            saveStatus={saveStatus.system}
          />
        );
      default:
        return <div>Select a settings category</div>;
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your admin portal configuration and preferences</p>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <div className="settings-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={tab.icon}></i>
                <span>{tab.label}</span>
                {saveStatus[tab.id] === 'saving' && (
                  <i className="fas fa-spinner fa-spin saving-indicator"></i>
                )}
                {saveStatus[tab.id] === 'success' && (
                  <i className="fas fa-check-circle success-indicator"></i>
                )}
                {saveStatus[tab.id] === 'error' && (
                  <i className="fas fa-exclamation-circle error-indicator"></i>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-main">
          <div className="settings-panel">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;