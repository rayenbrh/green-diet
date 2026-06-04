import { useEffect, useRef, useState } from 'react'
import { resolveUploadSrc } from '../lib/uploadsBase'

export default function ImageUpload({
  existingImages = [],
  onChange,
  maxImages = 4,
  serverBaseUrl = '',
}) {
  const [kept, setKept] = useState(existingImages)
  const [newFiles, setNewFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    setKept(existingImages)
  }, [existingImages])

  const total = kept.length + newFiles.length

  const notifyParent = (k, f) => {
    onChange?.({ existingImages: k, newFiles: f })
  }

  const handleFiles = (files) => {
    const arr = Array.from(files || [])
    const allowed = arr.filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(f.type),
    )
    const space = maxImages - total
    const toAdd = allowed.slice(0, space)
    const newPreviews = toAdd.map((f) => URL.createObjectURL(f))
    const updatedFiles = [...newFiles, ...toAdd]
    const updatedPreviews = [...previews, ...newPreviews]
    setNewFiles(updatedFiles)
    setPreviews(updatedPreviews)
    notifyParent(kept, updatedFiles)
  }

  const removeExisting = (filename) => {
    const updated = kept.filter((x) => x !== filename)
    setKept(updated)
    notifyParent(updated, newFiles)
  }

  const removeNew = (index) => {
    URL.revokeObjectURL(previews[index])
    const updatedFiles = newFiles.filter((_, i) => i !== index)
    const updatedPreviews = previews.filter((_, i) => i !== index)
    setNewFiles(updatedFiles)
    setPreviews(updatedPreviews)
    notifyParent(kept, updatedFiles)
  }

  const THUMB =
    'relative h-[110px] w-[110px] shrink-0 overflow-hidden rounded-xl border border-[rgba(74,124,89,0.15)]'
  const REMOVE =
    'absolute right-1.5 top-1.5 z-[2] flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-full border-0 bg-black/70 text-xs text-white'

  return (
    <div>
      {(kept.length > 0 || newFiles.length > 0) && (
        <div className="mb-4 flex flex-wrap gap-2.5">
          {kept.map((filename) => (
            <div key={filename} className={THUMB}>
              <img
                src={resolveUploadSrc(filename, serverBaseUrl)}
                alt=""
                className="h-full w-full object-cover"
              />
              <button type="button" className={REMOVE} onClick={() => removeExisting(filename)}>
                ✕
              </button>
            </div>
          ))}
          {previews.map((url, i) => (
            <div key={url} className={THUMB}>
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button type="button" className={REMOVE} onClick={() => removeNew(i)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {total < maxImages && (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            handleFiles(e.dataTransfer.files)
          }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-xl border border-dashed px-5 py-8 text-center transition ${
            dragOver
              ? 'border-[#4a7c59] bg-[rgba(74,124,89,0.08)]'
              : 'border-[rgba(74,124,89,0.35)] bg-[rgba(74,124,89,0.02)]'
          }`}
        >
          <div className="mb-2 text-2xl">📸</div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6b7280]">
            Déposer les images ici
          </div>
          <div className="mt-1 text-xs italic text-[#9ca3af]">
            ou cliquer · {maxImages - total} emplacement(s) · JPEG, PNG, WebP · max 8 Mo
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}
    </div>
  )
}
