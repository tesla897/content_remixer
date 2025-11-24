import TextareaAutosize from 'react-textarea-autosize'
import ReactMarkdown from 'react-markdown'
import { useState, useEffect } from 'react'
import { remixContent } from './services/api'
import { initSupabase, getSavedTweets, saveTweet, deleteTweet, updateTweet } from './services/supabase'
import SavedTweetsDrawer from './components/SavedTweetsDrawer'
import TweetCard from './components/TweetCard'
import './App.css'

function App() {
  const [inputText, setInputText] = useState('')
  const [remixedTweets, setRemixedTweets] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Initialize from Environment Variables
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_DEEPSEEK_API_KEY || '')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)

  // Supabase State
  const [supabaseUrl, setSupabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL || '')
  const [supabaseKey, setSupabaseKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || '')
  const [savedTweets, setSavedTweets] = useState([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSupabaseReady, setIsSupabaseReady] = useState(false)

  // Editing State
  const [editingIndex, setEditingIndex] = useState(-1)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    if (supabaseUrl && supabaseKey) {
      initSupabase(supabaseUrl, supabaseKey)
      setIsSupabaseReady(true)
      fetchSavedTweets()
    }
  }, [supabaseUrl, supabaseKey])

  const fetchSavedTweets = async () => {
    try {
      const tweets = await getSavedTweets()
      if (tweets) setSavedTweets(tweets)
    } catch (error) {
      console.error('Error fetching tweets:', error)
    }
  }

  const handleSaveCredentials = () => {
    if (supabaseUrl && supabaseKey) {
      initSupabase(supabaseUrl, supabaseKey)
      setIsSupabaseReady(true)
      fetchSavedTweets()
      alert('Credentials applied for this session!')
      setShowApiKeyInput(false)
    }
  }

  const handleSaveTweet = async (tweetContent) => {
    if (!isSupabaseReady) {
      alert('Please configure Supabase first!')
      setShowApiKeyInput(true)
      return
    }
    try {
      const newTweet = await saveTweet(tweetContent)
      setSavedTweets([newTweet, ...savedTweets])
      setIsDrawerOpen(true)
    } catch (error) {
      console.error('Error saving tweet:', error)
      alert('Failed to save tweet')
    }
  }

  const handleDeleteTweet = async (id) => {
    try {
      await deleteTweet(id)
      setSavedTweets(savedTweets.filter(t => t.id !== id))
    } catch (error) {
      console.error('Error deleting tweet:', error)
      alert('Failed to delete tweet')
    }
  }

  const handleUpdateSavedTweet = async (id, newContent) => {
    try {
      const updatedTweet = await updateTweet(id, newContent)
      setSavedTweets(savedTweets.map(t => t.id === id ? updatedTweet : t))
    } catch (error) {
      console.error('Error updating tweet:', error)
      alert('Failed to update tweet')
    }
  }

  const handleStartEdit = (index, content) => {
    setEditingIndex(index)
    setEditContent(content)
  }

  const handleCancelEdit = () => {
    setEditingIndex(-1)
    setEditContent('')
  }

  const handleSaveEdit = (index) => {
    const newTweets = [...remixedTweets]
    newTweets[index] = editContent
    setRemixedTweets(newTweets)
    setEditingIndex(-1)
    setEditContent('')
  }

  const handleRemix = async (e) => {
    if (e) e.preventDefault()
    if (!inputText.trim()) return
    if (!apiKey.trim()) {
      alert('Please enter your Deepseek API Key first!')
      setShowApiKeyInput(true)
      return
    }

    setIsLoading(true)
    setRemixedTweets([])
    try {
      const result = await remixContent(inputText, apiKey)
      setRemixedTweets(Array.isArray(result) ? result : [result])
    } catch (error) {
      console.error('Error remixing text:', error)
      setRemixedTweets([`Error: ${error.message || 'Failed to remix content'}. Please check your API key.`])
    } finally {
      setIsLoading(false)
    }
  }

  const handleTweet = (text) => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(tweetUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements - Simplified/Removed for cleaner look */}

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Top Bar */}
        <div className="absolute top-0 right-0 z-20 flex gap-2">
          {savedTweets.length > 0 && (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="glass-card px-3 py-2 md:px-4 text-sm flex items-center gap-2 hover:bg-gray-50 transition-all duration-300 group"
            >
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700 group-hover:text-purple-600 transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-sm border-2 border-white">
                  {savedTweets.length}
                </span>
              </div>
              <span className="font-medium hidden md:inline text-gray-700 group-hover:text-purple-600">Saved</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="glass-card px-3 py-2 md:px-4 text-sm flex items-center gap-2 hover:bg-gray-50 transition-all duration-300 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium hidden md:inline">Settings</span>
          </button>
        </div>

        {/* Settings Panel */}
        <div className={`transition-all duration-500 ease-out overflow-hidden ${showApiKeyInput ? 'max-h-[500px] opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'}`}>
          <div className="glass-card p-6 gradient-border space-y-4">
            <div>
              <label className="block text-sm font-semibold text-blue-600 mb-2 flex items-center gap-2">
                <span>🔑</span> Deepseek API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full glass-card px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:bg-gray-50 outline-none transition-all duration-300"
              />
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Supabase Configuration (For Saved Tweets)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Project URL</label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full glass-card px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:bg-gray-50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Anon Key</label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJ..."
                    className="w-full glass-card px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:bg-gray-50 outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveCredentials}
                className="mt-3 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
              >
                Apply Credentials
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
            Content Remixer
          </h1>
          <p className="text-gray-600 text-lg font-light tracking-wide">Transform your text with AI magic ✨</p>
        </header>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-6 items-start">
          {/* Input Section */}
          <div className="space-y-4 order-1 w-full">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
                <span>📝</span> Input Text
              </h2>
              <span className="text-sm text-gray-500 font-mono">
                {inputText.length} chars
              </span>
            </div>
            <div className="h-48 md:h-auto md:min-h-[400px] glass-card p-5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-gray-50 transition-all duration-300 group flex flex-col overflow-y-auto custom-scrollbar">
              <TextareaAutosize
                minRows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your text here..."
                className="w-full bg-transparent outline-none resize-none text-gray-900 placeholder-gray-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Enhanced Remix Button - Mobile Order 2, Desktop Order 3 */}
          <div className="flex justify-center order-2 lg:order-3 lg:col-span-2 my-2 lg:mt-6">
            <button
              type="button"
              onClick={handleRemix}
              disabled={isLoading || !inputText.trim()}
              className={`
              relative px-10 py-3 md:py-4 rounded-full font-bold text-lg shadow-xl transition-all duration-300 transform
              ${isLoading || !inputText.trim()
                  ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed backdrop-blur-sm'
                  : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white hover:scale-105 glow-button animate-gradient'
                }
            `}
            >
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                  <>
                    <span className="animate-spin">⚡</span>
                    Remixing...
                  </>
                ) : (
                  <>
                    <span>🎨</span>
                    Remix Content
                    <span>✨</span>
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Output Section */}
          <div className="space-y-4 order-3 lg:order-2 w-full">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                <span>✨</span> Remixed Tweets
              </h2>
              <span className="text-sm text-gray-400 font-mono">
                {remixedTweets.length > 0 ? `${remixedTweets.length} generated` : ''}
              </span>
            </div>
            <div className="h-48 md:h-auto md:min-h-[400px] glass-card p-5 transition-all duration-300 flex flex-col overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                  </div>
                  <p className="text-gray-600 font-medium animate-pulse">Generating viral tweets...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {remixedTweets.length > 0 ? (
                    remixedTweets.map((tweet, index) => (
                      <TweetCard
                        key={index}
                        tweet={tweet}
                        index={index}
                        onSave={handleSaveTweet}
                        onTweet={handleTweet}
                        onEdit={handleStartEdit}
                        isEditing={editingIndex === index}
                        editContent={editContent}
                        setEditContent={setEditContent}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={handleCancelEdit}
                      />
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-gray-500 text-lg">Your viral tweets will appear here...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Powered by AI • Made with 💜</p>
        </footer>
      </div>

      <SavedTweetsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        savedTweets={savedTweets}
        onDelete={handleDeleteTweet}
        onTweet={handleTweet}
        onUpdate={handleUpdateSavedTweet}
      />
    </div>
  )
}

export default App
