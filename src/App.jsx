import TextareaAutosize from 'react-textarea-autosize'
import ReactMarkdown from 'react-markdown'
import { useState } from 'react'
import { remixContent } from './services/api'
import './App.css'

function App() {
  const [inputText, setInputText] = useState('')
  const [remixedText, setRemixedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)

  const handleRemix = async (e) => {
    if (e) e.preventDefault()
    if (!inputText.trim()) return
    if (!apiKey.trim()) {
      alert('Please enter your Deepseek API Key first!')
      setShowApiKeyInput(true)
      return
    }

    setIsLoading(true)
    try {
      const result = await remixContent(inputText, apiKey)
      setRemixedText(result)
    } catch (error) {
      console.error('Error remixing text:', error)
      setRemixedText(`Error: ${error.message || 'Failed to remix content'}. Please check your API key.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto relative">
        {/* API Key Toggle */}
        <div className="absolute top-0 right-0">
          <button
            type="button"
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="text-gray-400 hover:text-white text-sm flex items-center gap-2"
          >
            ⚙️ API Settings
          </button>
        </div>

        {showApiKeyInput && (
          <div className="mb-8 p-4 bg-gray-800 rounded-xl border border-gray-700">
            <label className="block text-sm font-medium text-gray-400 mb-2">Deepseek API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}

        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Content Remixer
          </h1>
          <p className="text-gray-400 text-lg">Transform your text with AI</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Input Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-blue-400">Input Text</h2>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <TextareaAutosize
                minRows={10}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your text here..."
                className="w-full bg-transparent outline-none resize-none text-gray-200 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-purple-400">Remixed Result</h2>
            <div className="min-h-[300px] bg-gray-800/50 border border-gray-700 rounded-xl p-6 overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-gray-400 animate-pulse">
                  Remixing your content...
                </div>
              ) : (
                <div className="text-gray-300">
                  {remixedText ? (
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown>
                        {remixedText}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span className="text-gray-500">Result will appear here...</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleRemix}
            disabled={isLoading || !inputText.trim()}
            className={`
              px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all transform hover:scale-105
              ${isLoading || !inputText.trim()
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-blue-500/25'}
            `}
          >
            {isLoading ? 'Remixing...' : 'Remix Content ✨'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
