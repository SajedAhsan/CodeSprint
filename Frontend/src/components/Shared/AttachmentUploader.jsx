import { useState, useRef } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

function getToken() {
  return localStorage.getItem('codesprintToken') || localStorage.getItem('token') || ''
}

function getFileIcon(filetype) {
  if (!filetype) return '📎'
  if (filetype.startsWith('image/')) return '🖼️'
  if (filetype === 'application/pdf') return '📄'
  if (filetype.startsWith('text/') || filetype.includes('source') || filetype.includes('json')) return '📝'
  if (filetype === 'application/zip') return '🗜️'
  return '📎'
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImageType(filetype, filename = '') {
  if (filetype && filetype.toLowerCase().startsWith('image/')) return true
  const lower = (filename || '').toLowerCase()
  return (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.gif') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.svg') ||
    lower.endsWith('.bmp')
  )
}

/**
 * AttachmentUploader – file upload + rich inline attachment renderer.
 *
 * Props:
 *   entityType   – 'blog' | 'editorial' | 'comment' | 'discussion'
 *   entityId     – the entity ID
 *   attachments  – existing attachments array [{ attachmentId, filename, filetype, fileUrl, downloadUrl, authorUsername }]
 *   onUploaded   – callback(newAttachments[]) after successful upload
 *   onDeleted    – callback(attachmentId) after deletion
 *   currentUsername – logged-in username (for showing delete on own uploads)
 *   disabled     – disable the upload button
 *   showUploadButton – whether to show the "Attach" button (default true)
 *   compact      – smaller layout for use inside comment boxes
 */
export default function AttachmentUploader({
  entityType,
  entityId,
  attachments = [],
  onUploaded,
  onDeleted,
  currentUsername = '',
  disabled = false,
  showUploadButton = true,
  compact = false,
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [lightboxUrl, setLightboxUrl] = useState(null)
  const [failedImages, setFailedImages] = useState(new Set())
  const fileInputRef = useRef(null)

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    if (!entityId) {
      setUploadError('Please save the post first before attaching files.')
      e.target.value = ''
      return
    }

    const token = getToken()
    if (!token) {
      setUploadError('Please log in to upload attachments.')
      e.target.value = ''
      return
    }

    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))

    try {
      setIsUploading(true)
      setUploadError('')

      const endpoint = `${API_BASE_URL}/api/attachments/${entityType}/${entityId}`
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setUploadError(err.message || `Upload failed (${res.status})`)
        return
      }

      const uploaded = await res.json()
      onUploaded?.(uploaded)
    } catch (err) {
      console.error('Attachment upload error:', err)
      setUploadError('Network error. Please try again.')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (attachmentId) => {
    if (!window.confirm('Delete this attachment?')) return
    const token = getToken()
    if (!token) return

    try {
      const res = await fetch(`${API_BASE_URL}/api/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        onDeleted?.(attachmentId)
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.message || 'Failed to delete attachment.')
      }
    } catch {
      alert('Network error while deleting attachment.')
    }
  }

  const resolveUrl = (fileUrl) => {
    if (!fileUrl) return ''
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl
    return `${API_BASE_URL || ''}${fileUrl}`
  }

  const imageAttachments = attachments.filter((att) => isImageType(att.filetype, att.filename))
  const nonImageAttachments = attachments.filter((att) => !isImageType(att.filetype, att.filename))

  return (
    <div className={compact ? 'mt-1.5 space-y-2' : 'mt-2.5 space-y-3'}>
      {/* Upload trigger button (if enabled) */}
      {showUploadButton && (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*,.pdf,.txt,.md,.cpp,.c,.java,.py,.json,.zip"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
          />
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => fileInputRef.current?.click()}
            title={disabled ? 'Save first to attach files' : 'Attach files'}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all select-none
              ${disabled
                ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60'
                : 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 hover:border-violet-300 active:scale-95 cursor-pointer'
              }
              ${isUploading ? 'opacity-70' : ''}
            `}
          >
            {isUploading ? (
              <>
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
                {compact ? 'Attach' : 'Add Attachment'}
              </>
            )}
          </button>

          {uploadError && (
            <span className="text-xs text-rose-600 font-medium">{uploadError}</span>
          )}
        </div>
      )}

      {/* ── Image Attachments: natural size, full width ── */}
      {imageAttachments.length > 0 && (
        <div className={imageAttachments.length === 1 ? 'space-y-2' : 'grid gap-2 grid-cols-2'}>
          {imageAttachments.map((att, idx) => {
            const isOwner =
              currentUsername &&
              att.authorUsername &&
              currentUsername.toLowerCase() === att.authorUsername.toLowerCase()
            const fileUrl = resolveUrl(att.fileUrl)
            const isFailed = failedImages.has(att.attachmentId)

            if (isFailed) {
              return (
                <div
                  key={att.attachmentId}
                  className={`flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 p-2.5 text-xs text-rose-700 ${imageAttachments.length > 1 && idx === 0 && imageAttachments.length % 2 !== 0 ? 'col-span-2' : ''}`}
                >
                  <span>🖼️</span>
                  <span className="truncate font-medium">{att.filename}</span>
                  <a
                    href={resolveUrl(att.downloadUrl || `/api/attachments/${att.attachmentId}/download`)}
                    download={att.filename}
                    className="ml-auto rounded-lg bg-white border border-rose-200 px-2 py-0.5 text-[10px] font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    Download
                  </a>
                </div>
              )
            }

            // Single image: full width, natural size
            // Multiple images: grid of 2, equal height cells
            const isSingle = imageAttachments.length === 1
            const isOddLastInGrid = imageAttachments.length > 1 && imageAttachments.length % 2 !== 0 && idx === imageAttachments.length - 1

            return (
              <div
                key={att.attachmentId}
                className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition-all hover:shadow-lg hover:border-violet-200
                  ${isOddLastInGrid ? 'col-span-2' : ''}`}
              >
                {/* Image — natural size for single, fixed height for grid */}
                <button
                  type="button"
                  onClick={() => setLightboxUrl(fileUrl)}
                  className="block w-full cursor-zoom-in overflow-hidden text-left"
                  title="Click to view full image"
                >
                  <img
                    src={fileUrl}
                    alt={att.filename}
                    className={`w-full object-contain transition-transform duration-200 group-hover:scale-[1.01] bg-slate-50
                      ${isSingle || isOddLastInGrid
                        ? 'max-h-[480px]'
                        : 'h-52 object-cover'
                      }`}
                    onError={() => {
                      setFailedImages((prev) => new Set([...prev, att.attachmentId]))
                    }}
                  />
                </button>

                {/* Hover overlay with controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-2xl" />

                {/* Action bar – always visible at bottom */}
                <div className="flex items-center justify-between gap-1 px-3 py-2 border-t border-slate-100 bg-white/95 backdrop-blur-sm text-[11px]">
                  <span className="truncate font-semibold text-slate-600 max-w-[160px]" title={att.filename}>
                    {att.filename}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setLightboxUrl(fileUrl)}
                      className="rounded-full bg-violet-50 border border-violet-200 px-2.5 py-0.5 text-[10px] font-semibold text-violet-700 hover:bg-violet-100 transition"
                    >
                      Full View
                    </button>
                    <a
                      href={resolveUrl(att.downloadUrl || `/api/attachments/${att.attachmentId}/download`)}
                      download={att.filename}
                      className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-200 transition"
                      title="Download"
                    >
                      ↓ Save
                    </a>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => handleDelete(att.attachmentId)}
                        className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-semibold text-rose-600 hover:bg-rose-100 transition"
                        title="Delete"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Non-Image Attachments (Documents, Source files, ZIPs) ── */}
      {nonImageAttachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {nonImageAttachments.map((att) => {
            const isOwner =
              currentUsername &&
              att.authorUsername &&
              currentUsername.toLowerCase() === att.authorUsername.toLowerCase()
            const downloadUrl = resolveUrl(att.downloadUrl || `/api/attachments/${att.attachmentId}/download`)

            return (
              <div
                key={att.attachmentId}
                className="group relative flex items-center gap-2 rounded-2xl border border-violet-100 bg-violet-50/70 px-3 py-2 text-xs hover:border-violet-200 hover:bg-violet-50 transition-all"
              >
                <span className="text-base leading-none select-none">{getFileIcon(att.filetype)}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-violet-800 leading-tight max-w-[150px]" title={att.filename}>
                    {att.filename}
                  </p>
                  {att.filetype && (
                    <p className="text-[10px] text-violet-500 leading-tight truncate">{att.filetype}</p>
                  )}
                </div>

                <a
                  href={downloadUrl}
                  download={att.filename}
                  className="rounded-lg bg-white border border-violet-200 px-2 py-0.5 text-[10px] font-semibold text-violet-700 hover:bg-violet-100 transition-all"
                  title="Download"
                >
                  Download
                </a>

                {isOwner && (
                  <button
                    type="button"
                    onClick={() => handleDelete(att.attachmentId)}
                    className="rounded-lg bg-white border border-rose-200 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 hover:bg-rose-50 transition-all"
                    title="Delete attachment"
                  >
                    ✕
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div
            className="relative flex items-center justify-center"
            style={{ maxWidth: '95vw', maxHeight: '95vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              className="absolute -top-4 -right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-800 shadow-2xl hover:bg-slate-100 font-bold text-base transition"
              onClick={() => setLightboxUrl(null)}
            >
              ✕
            </button>
            <img
              src={lightboxUrl}
              alt="Full size preview"
              className="rounded-2xl shadow-2xl"
              style={{
                maxWidth: '95vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
