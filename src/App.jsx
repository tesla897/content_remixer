import TextareaAutosize from 'react-textarea-autosize'
import ReactMarkdown from 'react-markdown'
import { useState, useEffect } from 'react'
import { remixContent } from './services/api'
import { initSupabase, getSavedItems, saveItem, deleteItem, updateItem } from './services/supabase'
import SavedContentDrawer from './components/SavedContentDrawer'
import ContentCard from './components/ContentCard'
import SettingsModal from './components/SettingsModal'
import './App.css'

function App() {
  const [inputText, setInputText] = useState('')
  const [remixedContent, setRemixedContent] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [provider, setProvider] = useState('deepseek')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [userKeys, setUserKeys] = useState({})

  // Supabase State
  const [savedContent, setSavedContent] = useState([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Editing State
  const [editingIndex, setEditingIndex] = useState(-1)
  const [editContent, setEditContent] = useState('')

  // Content Type State
  const [contentType, setContentType] = useState('tweet')

  useEffect(() => {
    fetchSavedContent()
  }, [contentType])

  const fetchSavedContent = async () => {
    try {
      const items = await getSavedItems(contentType, userKeys.supabaseUrl, userKeys.supabaseKey)
      if (items) {
        const itemsWithType = items.map(item => ({ ...item, content_type: contentType }))
        setSavedContent(itemsWithType)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const handleSaveContent = async (contentToSave) => {
    try {
      const newItem = await saveItem(contentToSave, contentType, userKeys.supabaseUrl, userKeys.supabaseKey)
      if (!newItem) {
        throw new Error('No data returned from save operation')
      }
      // Add content_type to the saved item for tracking
      newItem.content_type = contentType
      setSavedContent([newItem, ...savedContent])
      setIsDrawerOpen(true)
    } catch (error) {
      console.error('Error saving item:', error)

      // Provide more detailed error messages
      const itemType = contentType === 'instagram' ? 'caption' : (contentType === 'linkedin' ? 'post' : 'tweet')
      const tableName = contentType === 'instagram' ? 'captions' : (contentType === 'linkedin' ? 'linkedin_posts' : 'tweets')
      let errorMessage = `Failed to save ${itemType}. `
      if (error.message.includes('not initialized')) {
        errorMessage += 'Supabase is not properly configured. Please check your credentials in Settings.'
      } else if (error.message.includes('relation') || error.message.includes('table')) {
        errorMessage += `Database table "${tableName}" not found. Please create the table in your Supabase project.`
      } else if (error.message.includes('permission') || error.message.includes('policy')) {
        errorMessage += 'Permission denied. Please check your Supabase RLS policies.'
      } else {
        errorMessage += error.message || 'Unknown error occurred.'
      }

      alert(errorMessage)
    }
  }

  const handleDeleteContent = async (id, itemContentType) => {
    try {
      await deleteItem(id, itemContentType || contentType, userKeys.supabaseUrl, userKeys.supabaseKey)
      setSavedContent(savedContent.filter(t => t.id !== id))
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  const handleUpdateSavedContent = async (id, newContent, itemContentType) => {
    try {
      const updatedItem = await updateItem(id, newContent, itemContentType || contentType, userKeys.supabaseUrl, userKeys.supabaseKey)
      // Preserve content_type when updating
      updatedItem.content_type = itemContentType || contentType
      setSavedContent(savedContent.map(t => t.id === id ? updatedItem : t))
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Failed to update item')
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
    const newContentList = [...remixedContent]
    newContentList[index] = editContent
    setRemixedContent(newContentList)
    setEditingIndex(-1)
    setEditContent('')
  }

  const handleRemix = async (e) => {
    if (e) e.preventDefault()
    if (!inputText.trim()) return

    setIsLoading(true)
    setRemixedContent([])
    try {
      const result = await remixContent(inputText, contentType, provider, userKeys[`${provider}ApiKey`])
      setRemixedContent(Array.isArray(result) ? result : [result])
    } catch (error) {
      console.error('Error remixing text:', error)
      setRemixedContent([`Error: ${error.message || 'Failed to remix content'}. Please check your API key.`])
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = (text) => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(tweetUrl, '_blank')
  }

  return (
    <div className="h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex flex-col">
      {/* Background Elements - Simplified/Removed for cleaner look */}

      <div className="max-w-7xl mx-auto relative z-10 w-full h-full flex flex-col">
        {/* Header & Top Bar */}
        <div className="flex items-start justify-between mb-2 flex-shrink-0 relative">
          {/* Left Spacer */}
          <div className="w-20 md:w-32 flex-shrink-0"></div>

          {/* Title */}
          <header className="text-center flex-grow px-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1">
              Content Remixer
            </h1>
            <p className="text-gray-600 text-sm font-light tracking-wide">Transform your text with AI magic ✨</p>
          </header>

          {/* Right Buttons */}
          <div className="flex gap-2 w-auto justify-end flex-shrink-0 z-20">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="glass-card p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            {savedContent.length > 0 && (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="glass-card px-3 py-2 md:px-4 text-sm flex items-center gap-2 hover:bg-gray-50 transition-all duration-300 group"
              >
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700 group-hover:text-purple-600 transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                  </svg>
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-sm border-2 border-white">
                    {savedContent.length}
                  </span>
                </div>
                <span className="font-medium hidden md:inline text-gray-700 group-hover:text-purple-600">Saved</span>
              </button>
            )}
          </div>
        </div>



        {/* Content Type Selector */}
        <div className="flex justify-center mb-4 flex-shrink-0">
          <div className="glass-card p-1.5 inline-flex gap-1">
            <button
              onClick={() => setContentType('tweet')}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${contentType === 'tweet'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="hidden md:inline">Tweet</span>
            </button>
            <button
              onClick={() => setContentType('instagram')}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${contentType === 'instagram'
                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span className="hidden md:inline">Instagram</span>
            </button>
            <button
              onClick={() => setContentType('linkedin')}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${contentType === 'linkedin'
                ? 'bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span className="hidden md:inline">LinkedIn</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:grid-rows-[1fr_auto] gap-4 flex-1 min-h-0">
          {/* Input Section */}
          <div className="space-y-2 order-1 w-full h-full flex flex-col min-h-0">
            <div className="flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                <span>📝</span> Input Text
              </h2>
              <span className="text-sm text-gray-500 font-mono">
                {inputText.length} chars
              </span>
            </div>
            <div className="glass-card p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-gray-50 transition-all duration-300 group flex flex-col flex-1 min-h-0">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your text here..."
                className="w-full h-full bg-transparent outline-none resize-none text-gray-900 placeholder-gray-500 leading-relaxed custom-scrollbar"
              />
            </div>
          </div>

          {/* Enhanced Remix Button - Mobile Order 2, Desktop Order 3 */}
          <div className="flex justify-center items-center order-2 lg:order-3 lg:col-span-2 my-2 lg:mt-0 flex-shrink-0">
            <button
              type="button"
              onClick={handleRemix}
              disabled={isLoading || !inputText.trim()}
              className={`
              relative px-10 py-3 rounded-full font-bold text-lg shadow-xl transition-all duration-300 transform
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
          <div className="space-y-2 order-3 lg:order-2 w-full h-full flex flex-col min-h-0">
            <div className="flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                <span>✨</span> {contentType === 'instagram' ? 'Captions' : (contentType === 'linkedin' ? 'LinkedIn Post' : 'Remixed')}
              </h2>
              <span className="text-sm text-gray-400 font-mono">
                {remixedContent.length > 0 ? `${remixedContent.length}` : ''}
              </span>
            </div>
            <div className="glass-card p-4 transition-all duration-300 flex flex-col flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                  </div>
                  <p className="text-gray-600 font-medium animate-pulse">
                    {contentType === 'instagram' ? 'Crafting captions...' : (contentType === 'linkedin' ? 'Drafting professional post...' : 'Generating tweets...')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {remixedContent.length > 0 ? (
                    remixedContent.map((content, index) => (
                      <ContentCard
                        key={index}
                        content={content}
                        index={index}
                        contentType={contentType}
                        onSave={handleSaveContent}
                        onShare={handleShare}
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
                      <span className="text-gray-500 leading-relaxed text-center px-4">
                        {contentType === 'instagram' ? 'Your Instagram captions will appear here...' : (contentType === 'linkedin' ? 'Your professional LinkedIn post will appear here...' : 'Your viral tweets will appear here...')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Footer */}
        <footer className="mb-2 text-center text-gray-500 text-xs flex-shrink-0">
          <p>Powered by AI • Made with 💜</p>
        </footer>
      </div>

      <SavedContentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        savedContent={savedContent}
        onDelete={handleDeleteContent}
        onShare={handleShare}
        onUpdate={handleUpdateSavedContent}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        provider={provider}
        setProvider={setProvider}
        userKeys={userKeys}
        setUserKeys={setUserKeys}
        onSave={() => { }}
      />
    </div>
  )
}

export default App
