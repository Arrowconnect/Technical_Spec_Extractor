const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// N8N webhook endpoint
const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://n8n-tech-spec.duckdns.org/webhook/b918489b-0898-4b69-a91d-eb7277ab9dca'

export interface ProcessFileResponse {
  success: boolean
  result?: string
  error?: string
  blob?: Blob
  filename?: string
}

export async function processFile(file: File, token: string, prompt: string): Promise<ProcessFileResponse> {
  try {
    const apiEndpoint = `${API_BASE_URL}/api/process-pdf`
    console.log('Sending file to Vercel API route:', apiEndpoint)
    console.log('File details:', { name: file.name, size: file.size, type: file.type })
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('prompt', prompt)
    
    console.log('About to send request to Vercel API route')
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      body: formData,
    })
    
    console.log('Request sent, waiting for response...')
    
    console.log('API Response Status:', response.status)
    console.log('API Response Headers:', response.headers)
    console.log('Response Size:', response.headers.get('content-length'))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
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
      // Handle text/JSON response from API route
      const responseData = await response.json()
      console.log('API Response Data:', responseData)
      
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
      errorMessage = 'Request timed out. The file processing is taking longer than expected. Your N8N workflow may still be running.'
    } else if (error.message.includes('HTTP error')) {
      errorMessage = `API Error: ${error.message}`
    } else if (error.message.includes('fetch')) {
      errorMessage = 'Could not connect to processing service'
    } else {
      errorMessage = error.message
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}


