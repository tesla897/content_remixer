import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import TextareaAutosize from 'react-textarea-autosize'

const ContentCard = ({
    content,
    index,
    onSave,
    onShare,
    onEdit,
    isEditing,
    editContent,
    setEditContent,
    onSaveEdit,
    onCancelEdit,
    contentType = 'tweet'
}) => {
    const [swipeFeedback, setSwipeFeedback] = useState(null)

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            onSave(content)
            showFeedback(
                <div className="flex items-center gap-2">
                    <span>Saved!</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                </div>
            )
        },
        onSwipedRight: () => {
            if (contentType === 'instagram' || contentType === 'linkedin') {
                handleCopy()
            } else {
                onShare(content)
                showFeedback('Opening Twitter... 🐦')
            }
        },
        preventDefaultTouchmoveEvent: true,
        trackMouse: true
    })

    const showFeedback = (message) => {
        setSwipeFeedback(message)
        setTimeout(() => setSwipeFeedback(null), 2000)
    }

    const handleDoubleTap = () => {
        onEdit(index, content)
    }

    const handleCopy = async () => {
        try {
            // Try modern clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(content)
            } else {
                // Fallback for older browsers or insecure contexts (mobile dev)
                const textArea = document.createElement("textarea")
                textArea.value = content

                // Ensure it's not visible but part of DOM
                textArea.style.position = "fixed"
                textArea.style.left = "-9999px"
                textArea.style.top = "0"
                document.body.appendChild(textArea)

                textArea.focus()
                textArea.select()

                try {
                    document.execCommand('copy')
                } catch (err) {
                    console.error('Fallback: Oops, unable to copy', err)
                }

                document.body.removeChild(textArea)
            }

            // Show feedback only on success (or assumed success)
            showFeedback(
                <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-green-500 rounded-full shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold">Copied!</span>
                </div>
            )
        } catch (err) {
            console.error('Failed to copy:', err)
            showFeedback('Failed to copy ❌')
        }
    }

    return (
        <div
            {...handlers}
            onDoubleClick={handleDoubleTap}
            className="glass-card p-4 pb-12 border border-gray-300 hover:border-purple-500/50 transition-all duration-300 group relative select-none touch-pan-y"
        >
            {/* Swipe Feedback Overlay */}
            {swipeFeedback && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl animate-in fade-in duration-200 text-white">
                    {typeof swipeFeedback === 'string' ? (
                        <span className="font-bold text-xl">{swipeFeedback}</span>
                    ) : (
                        swipeFeedback
                    )}
                </div>
            )}

            {isEditing ? (
                <div className="space-y-3 relative z-30">
                    <TextareaAutosize
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                        minRows={2}
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={onCancelEdit}
                            className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSaveEdit(index)}
                            className="px-3 py-1.5 text-sm bg-purple-500 text-white hover:bg-purple-600 rounded-lg transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <p className="text-gray-900 pr-8 whitespace-pre-wrap">{content}</p>

                    {/* Desktop Actions (Hover) & Mobile Actions (Hidden by default, show on interaction) */}
                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-200 z-10">
                        <button
                            onClick={() => onEdit(index, content)}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                            title="Edit Content"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                        </button>
                        <button
                            onClick={() => onSave(content)}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-purple-50 text-gray-400 hover:text-purple-500 transition-colors"
                            title="Save Content"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => (contentType === 'instagram' || contentType === 'linkedin') ? handleCopy() : onShare(content)}
                            className={`p-2 rounded-lg bg-gray-100 transition-colors ${contentType === 'instagram'
                                ? 'hover:bg-pink-50 text-gray-400 hover:text-pink-500'
                                : (contentType === 'linkedin'
                                    ? 'hover:bg-blue-50 text-gray-400 hover:text-blue-700'
                                    : 'hover:bg-blue-50 text-gray-400 hover:text-blue-500')
                                }`}
                            title={contentType === 'instagram' ? 'Copy to Clipboard' : (contentType === 'linkedin' ? 'Copy for LinkedIn' : 'Post to Twitter')}
                        >
                            {contentType === 'instagram' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185.639-.074 1.281-.135 1.927-.184" />
                                </svg>
                            ) : (contentType === 'linkedin' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            ))}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

export default ContentCard
