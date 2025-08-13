'use client'

import { useState } from 'react'
import { Copy, Download, FileText } from 'lucide-react'

interface ResultDisplayProps {
  result: string
  filename?: string
  pdfBlob?: Blob | null
}

export default function ResultDisplay({ result, filename, pdfBlob }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleDownload = () => {
    if (pdfBlob) {
      // Download PDF file
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || 'processed-document.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      // Download text content
      const blob = new Blob([result], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `extracted-text-${filename || 'result'}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  // Try to parse JSON result, fallback to string display
  let displayContent = result
  let isJson = false
  
  try {
    const parsed = JSON.parse(result)
    if (typeof parsed === 'object') {
      isJson = true
      // If it's an object with a message or text field, extract that
      if (parsed.message) {
        displayContent = parsed.message
      } else if (parsed.text) {
        displayContent = parsed.text
      } else if (parsed.result) {
        displayContent = parsed.result
      } else {
        displayContent = JSON.stringify(parsed, null, 2)
      }
    }
  } catch (e) {
    // Not JSON, use as is
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Extraction Result</h3>
          </div>
          <div className="flex space-x-2">
            {!pdfBlob && (
              <button
                onClick={handleCopy}
                className={`btn-secondary flex items-center space-x-2 ${
                  copied ? 'bg-green-100 text-green-700' : ''
                }`}
              >
                <Copy className="h-4 w-4" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            )}
            <button
              onClick={handleDownload}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{pdfBlob ? 'Download PDF' : 'Download'}</span>
            </button>
          </div>
        </div>

        {pdfBlob ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">PDF Processing Complete!</h4>
              <p className="text-sm text-gray-600 mb-4">
                Your document has been successfully processed and converted to PDF.
              </p>
              <div className="text-xs text-gray-500">
                File size: {(pdfBlob.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
              {displayContent}
            </pre>
          </div>
        )}

        {isJson && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> This appears to be a JSON response. The content above shows the extracted text or main message.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
