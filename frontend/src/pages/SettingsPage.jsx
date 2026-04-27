import React, { useState, useEffect, useContext } from 'react';
import { User, Lock, Globe, Users, Save, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import apiClient from '../api/client';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Loader from '../components/UI/Loader';

const SettingsPage = () => {
  const { user } = useContext(AuthContext);
  const { t, setLanguage } = useContext(LanguageContext);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Profile state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    language: 'es'
  });

  // Workers state
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    if (activeTab === 'workers' && user?.role === 'admin') {
      fetchWorkers();
    }
  }, [activeTab]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/auth/workers');
      setWorkers(response.data);
    } catch (error) {
      console.error("Error fetching workers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        language: formData.language
      };
      if (formData.password) {
        payload.password = formData.password;
      }
      
      await apiClient.put('/auth/me', payload);
      setLanguage(formData.language);
      setSuccessMsg(t('settings.profileSuccess'));
      setTimeout(() => setSuccessMsg(''), 3000);
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error) {
      console.error("Error updating profile", error);
      alert(error.response?.data?.detail || "Error al actualizar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('settings.title')}</h2>
          <p className="text-[var(--text-secondary)]">{t('settings.subtitle')}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] relative overflow-hidden ${
              activeTab === 'profile' 
                ? 'text-white font-medium bg-gradient-to-r from-[rgba(139,92,246,0.15)] to-transparent border-l-4 border-[var(--accent-tertiary)] shadow-[-10px_0_20px_-10px_rgba(139,92,246,0.5)]' 
                : 'text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.03)] hover:text-white border-l-4 border-transparent'
            }`}
          >
            <User size={18} className={`mr-3 transition-colors duration-300 relative z-10 ${activeTab === 'profile' ? 'text-[var(--accent-tertiary)] drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]' : ''}`} /> 
            <span className="relative z-10">{t('settings.profileTab')}</span>
            {activeTab === 'profile' && <div className="absolute inset-0 bg-[var(--accent-tertiary)] opacity-10 blur-xl"></div>}
          </button>
          
          {user?.role === 'admin' && (
            <button 
              onClick={() => setActiveTab('workers')}
              className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] relative overflow-hidden ${
                activeTab === 'workers' 
                  ? 'text-white font-medium bg-gradient-to-r from-[rgba(139,92,246,0.15)] to-transparent border-l-4 border-[var(--accent-tertiary)] shadow-[-10px_0_20px_-10px_rgba(139,92,246,0.5)]' 
                  : 'text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.03)] hover:text-white border-l-4 border-transparent'
              }`}
            >
              <Users size={18} className={`mr-3 transition-colors duration-300 relative z-10 ${activeTab === 'workers' ? 'text-[var(--accent-tertiary)] drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]' : ''}`} /> 
              <span className="relative z-10">{t('settings.teamTab')}</span>
              {activeTab === 'workers' && <div className="absolute inset-0 bg-[var(--accent-tertiary)] opacity-10 blur-xl"></div>}
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 glass-panel p-6">
          {activeTab === 'profile' && (
            <div className="max-w-2xl animate-fade-in">
              <h3 className="text-xl font-semibold text-white mb-6">{t('settings.personalInfo')}</h3>
              
              {successMsg && (
                <div className="mb-6 p-4 rounded-lg bg-[rgba(16,185,129,0.1)] border border-[var(--status-success)] flex items-center text-[var(--status-success)]">
                  <CheckCircle size={20} className="mr-2" />
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmitProfile} className="space-y-6">
                <div className="space-y-4">
                  <Input 
                    label={t('settings.fullName')} 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    icon={User}
                    required 
                  />
                  <Input 
                    label={t('settings.email')} 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    required 
                  />
                  
                  <div className="space-y-1.5 w-full">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">{t('settings.language')}</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                      <select 
                        name="language" 
                        value={formData.language} 
                        onChange={handleInputChange} 
                        className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg pl-10 px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                      >
                        <option value="es" className="bg-[var(--bg-secondary)]">Español</option>
                        <option value="en" className="bg-[var(--bg-secondary)]">English</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--border-light)]">
                  <h3 className="text-lg font-medium text-white mb-4">{t('settings.security')}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    {t('settings.passwordHint')}
                  </p>
                  <Input 
                    label={t('settings.newPassword')} 
                    name="password" 
                    type="password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    icon={Lock} 
                    placeholder="••••••••"
                  />
                </div>

                <div className="pt-6 border-t border-[var(--border-light)] flex justify-end">
                  <Button type="submit" isLoading={isSaving} className="flex items-center">
                    <Save size={18} className="mr-2" /> {t('settings.saveChanges')}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'workers' && user?.role === 'admin' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">{t('settings.myTeam')}</h3>
                <div className="text-sm px-3 py-1 bg-[rgba(255,255,255,0.05)] border border-[var(--border-light)] rounded-md text-[var(--text-secondary)]">
                  {t('settings.companyCodePrefix')} <span className="text-white font-mono font-bold tracking-wider">{user?.company_code}</span>
                </div>
              </div>

              {loading ? (
                <div className="py-12"><Loader /></div>
              ) : (
                <div className="overflow-x-auto border border-[var(--border-light)] rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] text-sm">
                        <th className="p-4 font-medium">{t('settings.tableName')}</th>
                        <th className="p-4 font-medium">{t('settings.tableEmail')}</th>
                        <th className="p-4 font-medium">{t('settings.tableDate')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-light)] text-sm">
                      {workers.length > 0 ? (
                        workers.map((worker) => (
                          <tr key={worker.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                            <td className="p-4 text-white font-medium flex items-center">
                              <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] bg-opacity-20 flex items-center justify-center text-[var(--accent-primary)] font-bold mr-3">
                                {worker.name.charAt(0).toUpperCase()}
                              </div>
                              {worker.name}
                            </td>
                            <td className="p-4 text-[var(--text-secondary)]">{worker.email}</td>
                            <td className="p-4 text-[var(--text-secondary)]">{new Date(worker.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="p-8 text-center text-[var(--text-muted)]">
                            {t('settings.noWorkers')} <br/>
                            {t('settings.shareCode')} <span className="text-white font-mono">{user?.company_code}</span> {t('settings.registerHint')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
