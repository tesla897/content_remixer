import { useState, useEffect } from 'react'

export default function SettingsModal({
    isOpen,
    onClose,
    provider,
    setProvider,
    userKeys,
    setUserKeys,
    onSave
}) {
    const [localKeys, setLocalKeys] = useState(userKeys)
    const [activeTab, setActiveTab] = useState('provider') // 'provider' or 'database'

    useEffect(() => {
        setLocalKeys(userKeys)
    }, [userKeys, isOpen])

    if (!isOpen) return null

    const handleKeyChange = (key, value) => {
        setLocalKeys(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const handleSave = () => {
        setUserKeys(localKeys)
        onSave()
        onClose()
    }

    const providers = [
        { id: 'deepseek', name: 'Deepseek', color: 'blue' },
        { id: 'openai', name: 'OpenAI', color: 'green' },
        { id: 'gemini', name: 'Gemini', color: 'purple' },
        { id: 'claude', name: 'Claude', color: 'orange' }
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span>⚙️</span> Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('provider')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'provider'
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        AI Provider
                    </button>
                    <button
                        onClick={() => setActiveTab('database')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'database'
                                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Database (Supabase)
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {activeTab === 'provider' ? (
                        <div className="space-y-6">
                            {/* Provider Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Select Active Provider</label>
                                <div className="relative">
                                    <select
                                        value={provider}
                                        onChange={(e) => setProvider(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none transition-all cursor-pointer"
                                    >
                                        {providers.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* API Key Input (Dynamic) */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-bold text-gray-700">
                                        {providers.find(p => p.id === provider)?.name} API Key
                                    </span>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Optional (BYOK)</span>
                                </div>

                                <input
                                    type="password"
                                    value={localKeys[`${provider}ApiKey`] || ''}
                                    onChange={(e) => handleKeyChange(`${provider}ApiKey`, e.target.value)}
                                    placeholder={`sk-... (Enter your ${providers.find(p => p.id === provider)?.name} key)`}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
                                />
                                <p className="text-xs text-gray-400 ml-1">
                                    Leave blank to use the server's default key (if configured).
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-4">
                                <p className="text-xs text-purple-800 leading-relaxed">
                                    Configure your own Supabase project to save and manage your remixed content.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Project URL</label>
                                <input
                                    type="text"
                                    value={localKeys.supabaseUrl || ''}
                                    onChange={(e) => handleKeyChange('supabaseUrl', e.target.value)}
                                    placeholder="https://your-project.supabase.co"
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Anon Key</label>
                                <input
                                    type="password"
                                    value={localKeys.supabaseKey || ''}
                                    onChange={(e) => handleKeyChange('supabaseKey', e.target.value)}
                                    placeholder="eyJ..."
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-black rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}
