import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';

export default function Settings() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [voiceSettings, setVoiceSettings] = useState({
    voiceSpeed: 1,
    voicePitch: 1,
    autoListen: true,
  });

  if (!user) {
    setLocation('/');
    return null;
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleVoiceChange = (setting: string, value: any) => {
    setVoiceSettings(prev => ({ ...prev, [setting]: value }));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-cyan-500/20 px-6 py-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-gray-400 text-sm mt-1">Customize your JARVIS X experience</p>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-48 border-r border-cyan-500/20 p-6">
          <nav className="space-y-2">
            {[
              { id: 'profile', label: 'Profile' },
              { id: 'voice', label: 'Voice Settings' },
              { id: 'privacy', label: 'Privacy & Security' },
              { id: 'notifications', label: 'Notifications' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-2 rounded transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400'
                    : 'text-gray-400 hover:text-cyan-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-cyan-500/30 rounded text-white focus:outline-none focus:border-cyan-500"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 bg-gray-900 border border-cyan-500/30 rounded text-white focus:outline-none focus:border-cyan-500"
                      placeholder="your@email.com"
                    />
                  </div>

                  <button className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Voice Settings Tab */}
          {activeTab === 'voice' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Voice Settings</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Voice Speed: {voiceSettings.voiceSpeed.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={voiceSettings.voiceSpeed}
                      onChange={e => handleVoiceChange('voiceSpeed', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Adjust how fast JARVIS speaks</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Voice Pitch: {voiceSettings.voicePitch.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={voiceSettings.voicePitch}
                      onChange={e => handleVoiceChange('voicePitch', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Adjust the pitch of JARVIS's voice</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="autoListen"
                      checked={voiceSettings.autoListen}
                      onChange={e => handleVoiceChange('autoListen', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="autoListen" className="text-sm font-medium text-gray-300">
                      Auto-listen after response
                    </label>
                  </div>

                  <button className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded transition-colors">
                    Save Voice Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Security Tab */}
          {activeTab === 'privacy' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Privacy & Security</h2>

                <div className="space-y-4">
                  <div className="p-4 border border-cyan-500/20 rounded bg-cyan-500/5">
                    <h3 className="font-semibold mb-2">Data Privacy</h3>
                    <p className="text-sm text-gray-400">
                      Your conversations are encrypted and stored securely. We never share your data with third parties.
                    </p>
                  </div>

                  <div className="p-4 border border-cyan-500/20 rounded bg-cyan-500/5">
                    <h3 className="font-semibold mb-2">Memory Management</h3>
                    <p className="text-sm text-gray-400 mb-3">
                      JARVIS learns from your conversations to provide personalized responses.
                    </p>
                    <button className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm rounded transition-colors">
                      Clear All Memory
                    </button>
                  </div>

                  <div className="p-4 border border-cyan-500/20 rounded bg-cyan-500/5">
                    <h3 className="font-semibold mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-400 mb-3">
                      Add an extra layer of security to your account.
                    </p>
                    <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Notification Settings</h2>

                <div className="space-y-4">
                  {[
                    { id: 'email', label: 'Email Notifications', desc: 'Get updates via email' },
                    { id: 'push', label: 'Push Notifications', desc: 'Receive browser notifications' },
                    { id: 'summary', label: 'Daily Summary', desc: 'Get a summary of your conversations' },
                  ].map(notif => (
                    <div key={notif.id} className="flex items-center justify-between p-4 border border-cyan-500/20 rounded">
                      <div>
                        <h3 className="font-semibold">{notif.label}</h3>
                        <p className="text-sm text-gray-500">{notif.desc}</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
