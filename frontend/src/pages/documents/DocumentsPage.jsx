import { useState, useEffect } from 'react'
import {
  FileText, Upload, Sparkles, Download, Trash2,
  AlertCircle, CheckCircle2, Clock, FileCheck, ArrowRight, RefreshCw
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { documentService } from '../../services/documentService'
import { useAuth } from '../../hooks/useAuth'
import { formatDate, formatFileSize } from '../../utils/formatters'
import Button from '../../components/ui/Button'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'

const GOV_DOC_CATEGORIES = [
  'Sustainability Policies',
  'Environmental Reports',
  'Government Schemes',
  'Municipal Reports',
  'Infrastructure Development',
  'Water Management',
  'Waste Management',
]

export default function DocumentsPage() {
  const { hasAnyRole } = useAuth()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Sustainability Policies')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  // Latest / Selected summary viewer
  const [activeSummary, setActiveSummary] = useState(null)

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const data = await documentService.getDocuments({ per_page: 50 })
      setDocuments(data.items || [])
      if (data.items && data.items.length > 0 && !activeSummary) {
        setActiveSummary(data.items[0])
      }
    } catch (err) {
      console.error('Failed to load documents', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1))
      }
    }
  }

  const handleUploadAndSummarize = async (e) => {
    e.preventDefault()
    setError('')
    if (!selectedFile) {
      setError('Please select a PDF or DOCX document to summarize.')
      return
    }

    const formData = new FormData()
    formData.append('title', title || selectedFile.name)
    formData.append('category', category)
    if (description) formData.append('description', description)
    formData.append('file', selectedFile)

    setUploading(true)
    try {
      const uploadedDoc = await documentService.uploadDocument(formData)
      setSelectedFile(null)
      setTitle('')
      setDescription('')
      // Set the newly uploaded and summarized doc as active view
      setActiveSummary(uploadedDoc)
      loadDocuments()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to process and summarize document')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this summarized document?')) return
    try {
      await documentService.deleteDocument(docId)
      if (activeSummary?.id === docId) {
        setActiveSummary(null)
      }
      loadDocuments()
    } catch (err) {
      alert('Failed to delete document')
    }
  }

  const handleDownload = async (docId, fileName) => {
    try {
      const res = await documentService.downloadDocument(docId)
      const blob = new Blob([res.data || res])
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName || 'document.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err) {
      alert('Failed to download document')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
              <Sparkles className="text-blue-600" size={26} />
              AI Document Summarizer
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Upload municipal gazettes, environmental reports, or policy directives to automatically extract key insights and executive action items.
            </p>
          </div>
          <Button variant="secondary" icon={RefreshCw} onClick={loadDocuments}>
            Refresh
          </Button>
        </div>

        {/* Upload & Summarization Dropzone */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Upload Document for AI Summarization</h2>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: <strong className="text-gray-700">.pdf</strong> and <strong className="text-gray-700">.docx</strong> (Max 10MB)
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-red-50 text-red-700 text-sm rounded-xl flex items-center gap-2 border border-red-200">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUploadAndSummarize} className="space-y-5">
              {/* File Dropzone Input */}
              <div className="relative border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 rounded-2xl p-6 text-center transition-colors">
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  <div className="p-3 bg-blue-100 text-blue-700 rounded-full">
                    <Upload size={24} />
                  </div>
                  {selectedFile ? (
                    <div>
                      <p className="text-sm font-semibold text-blue-900">{selectedFile.name}</p>
                      <p className="text-xs text-blue-600">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Click or drag & drop your document here
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">PDF or Word files</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Document Title (Auto-detected)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter document title..."
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={uploading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Policy Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    disabled={uploading}
                  >
                    {GOV_DOC_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="inline-flex items-center gap-2.5 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Sparkles size={18} className={uploading ? 'animate-spin' : ''} />
                  {uploading ? 'Extracting Text & Generating AI Summary...' : 'Upload & Generate AI Summary'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Results Section */}
        {activeSummary && (
          <div className="bg-white rounded-2xl border border-blue-200 shadow-md p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                  <FileCheck size={26} />
                </div>
                <div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {activeSummary.category}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-1">{activeSummary.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    File: {activeSummary.file_name} • {formatFileSize(activeSummary.file_size)} • Uploaded {formatDate(activeSummary.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Download}
                  onClick={() => handleDownload(activeSummary.id, activeSummary.file_name)}
                >
                  Download File
                </Button>
                <button
                  onClick={() => handleDelete(activeSummary.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition border border-red-200"
                  title="Delete Document"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* The Generated Summary Body */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                <Sparkles size={16} />
                <span>Executive AI Summary</span>
              </div>
              <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-xl border border-blue-100/80 text-sm leading-relaxed text-gray-800 shadow-inner">
                {activeSummary.ai_summary || 'Summary processing complete.'}
              </div>
            </div>
          </div>
        )}

        {/* Previous Summaries List */}
        {documents.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Your Uploaded Documents ({documents.length})</h3>
            <div className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setActiveSummary(doc)}
                  className={`py-3.5 px-4 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition ${
                    activeSummary?.id === doc.id ? 'bg-blue-50/80 border border-blue-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={20} className={activeSummary?.id === doc.id ? 'text-blue-600' : 'text-gray-400'} />
                    <div className="truncate">
                      <p className="text-sm font-semibold text-gray-900 truncate">{doc.title}</p>
                      <p className="text-xs text-gray-400">
                        {doc.category} • {formatDate(doc.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                      View Summary <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
