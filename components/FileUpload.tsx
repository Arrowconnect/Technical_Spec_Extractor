'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react'
import { processFile } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

interface FileUploadProps {
  onResult: (result: string, blob?: Blob, filename?: string) => void
  prompt: string
}

export default function FileUpload({ onResult, prompt }: FileUploadProps) {
  const { user } = useAuth()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [processingStep, setProcessingStep] = useState<string>('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0])
      setError(null)
      setSuccess(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024 // 50MB (direct N8N upload for >10MB)
  })

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setError(null)
    setSuccess(false)
  }

  const handleProcessFile = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    setError(null)
    setSuccess(false)
    setProcessingStep('Uploading file to N8N...')

    try {
      console.log('Starting file processing for:', uploadedFile.name)
      setProcessingStep('Processing with N8N workflow... (This may take several minutes for large files)')
      
      const response = await processFile(uploadedFile, user?.id || '', prompt)
      
      console.log('Processing response:', response)
      
      if (response.success && response.result) {
        setProcessingStep('Processing complete!')
        setSuccess(true)
        onResult(response.result, response.blob, response.filename)
      } else {
        console.error('Processing failed:', response.error)
        setError(response.error || 'Failed to process file')
      }
    } catch (err: any) {
      console.error('Processing error:', err)
      setError(err.message || 'An error occurred while processing the file')
    } finally {
      setIsProcessing(false)
      setProcessingStep('')
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200 ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
          </p>
          <p className="text-sm text-gray-500 mb-4">or click to select a file</p>
          <p className="text-xs text-gray-400">
            Supports PDF, DOC, DOCX, and TXT files (max 50MB)
          </p>
        </div>
      ) : (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <File className="h-8 w-8 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-1 hover:bg-gray-100 rounded-full"
              disabled={isProcessing}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {error && (
            <div className="flex items-center space-x-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-sm text-green-700">File processed successfully!</p>
            </div>
          )}

          <button
            onClick={handleProcessFile}
            disabled={isProcessing}
            className={`w-full btn-primary ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {processingStep || 'Processing...'}
              </span>
            ) : (
              'Process File'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
