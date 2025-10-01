const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

// N8N webhook endpoint
const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://n8n.arrowpipes.site/webhook/b918489b-0898-4b69-a91d-eb7277ab9dca'

export interface ProcessFileResponse {
  success: boolean
  result?: string
  error?: string
  blob?: Blob
  filename?: string
}

export async function processFile(file: File, token: string, prompt: string): Promise<ProcessFileResponse> {
  try {
    // Upload all files directly to N8N for simplicity and to avoid timeouts
    console.log('Uploading directly to N8N:', N8N_WEBHOOK_URL)
    console.log('File details:', { name: file.name, size: file.size, type: file.type })
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('prompt', prompt)
    
    // Create AbortController for timeout handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 20 * 60 * 1000) // 20 minute timeout
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    console.log('Request sent, waiting for response...')
    
    console.log('Response Status:', response.status)
    console.log('Response Headers:', response.headers)
    console.log('Response Size:', response.headers.get('content-length'))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error Response:', errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }
    
    // Check if response is binary (PDF) or text
    const contentType = response.headers.get('content-type') || ''
    console.log('Response Content-Type:', contentType)
    
    if (contentType.includes('application/pdf') || contentType.includes('octet-stream')) {
      // Handle PDF binary response
      const blob = await response.blob()
      console.log('Received PDF blob:', blob.size, 'bytes')
      
      return {
        success: true,
        result: 'PDF_FILE',
        blob: blob,
        filename: file.name.replace('.pdf', '_processed.pdf')
      }
    } else {
      // Handle text/JSON response
      const responseData = await response.json()
      console.log('Response Data:', responseData)
      
      return {
        success: responseData.success || true,
        result: typeof responseData.result === 'object' ? JSON.stringify(responseData.result, null, 2) : responseData.result,
        error: responseData.error
      }
    }
  } catch (error: any) {
    console.error('Error processing file:', error)
    
    // Better error handling
    let errorMessage = 'Failed to process file'
    
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      errorMessage = 'Upload timeout. Large files (>100MB) may exceed server limits. Try reducing file size or contact support.'
    } else if (error.message.includes('HTTP error')) {
      errorMessage = `API Error: ${error.message}`
    } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      errorMessage = 'Upload failed. This may be due to file size limits or network timeout. For files >100MB, please contact support.'
    } else {
      errorMessage = error.message
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}


