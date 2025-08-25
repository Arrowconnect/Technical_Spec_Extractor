const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// N8N webhook endpoint
const N8N_WEBHOOK_URL = 'https://ganapathy-n8n.duckdns.org/webhook/b918489b-0898-4b69-a91d-eb7277ab9dca'

export interface ProcessFileResponse {
  success: boolean
  result?: string
  error?: string
  blob?: Blob
  filename?: string
}

export async function processFile(file: File, token: string, prompt: string): Promise<ProcessFileResponse> {
  try {
    console.log('Sending file to N8N webhook:', N8N_WEBHOOK_URL)
    console.log('File details:', { name: file.name, size: file.size, type: file.type })
    
    // Test if N8N webhook is accessible
    try {
      const testResponse = await fetch(N8N_WEBHOOK_URL, { method: 'GET' })
      console.log('N8N webhook test response:', testResponse.status)
    } catch (testError) {
      console.warn('N8N webhook test failed:', testError)
    }
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('prompt', prompt)
    
    // Using fetch instead of axios to avoid timeout issues
    console.log('About to send request to:', N8N_WEBHOOK_URL)
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      // No timeout specified - let it run indefinitely
    })
    
    console.log('Request sent, waiting for response...')
    
    console.log('N8N Response Status:', response.status)
    console.log('N8N Response Headers:', response.headers)
    console.log('Response Size:', response.headers.get('content-length'))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('N8N Error Response:', errorText)
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
      const responseData = await response.text()
      console.log('N8N Response Data:', responseData)
      
      // Try to parse as JSON, fallback to text
      let result = responseData
      try {
        const parsed = JSON.parse(responseData)
        if (typeof parsed === 'object') {
          result = JSON.stringify(parsed, null, 2)
        }
      } catch (e) {
        // Keep as text if not JSON
      }
      
      return {
        success: true,
        result: result
      }
    }
  } catch (error: any) {
    console.error('Error processing file:', error)
    
    // Better error handling
    let errorMessage = 'Failed to process file'
    
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      errorMessage = 'Request timed out. The file processing is taking longer than expected. Your N8N workflow may still be running.'
    } else if (error.message.includes('HTTP error')) {
      errorMessage = `N8N Error: ${error.message}`
    } else if (error.message.includes('fetch')) {
      errorMessage = 'Could not connect to N8N webhook - make sure N8N is running'
    } else {
      errorMessage = error.message
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}


