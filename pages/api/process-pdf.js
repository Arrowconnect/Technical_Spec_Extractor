import formidable from 'formidable';
import fs from 'fs';

// Disable Next.js default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://n8n.arrowpipes.site/webhook/b918489b-0898-4b69-a91d-eb7277ab9dca';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('Processing file upload through Vercel API route...');

    // Parse multipart form data - Vercel has ~10MB practical limit
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB - safer limit for Vercel
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const prompt = Array.isArray(fields.prompt) ? fields.prompt[0] : fields.prompt;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Check file size before processing
    if (file.size > 10 * 1024 * 1024) {
      res.status(413).json({ 
        error: 'File too large. Maximum size is 10MB for Vercel processing.',
        maxSize: '10MB',
        fileSize: `${Math.round(file.size / 1024 / 1024 * 100) / 100}MB`
      });
      return;
    }

    console.log('File received:', { name: file.originalFilename, size: file.size });

    // Create FormData for N8N request
    const formData = new FormData();
    
    // Read file and create blob
    const fileBuffer = fs.readFileSync(file.filepath);
    const blob = new Blob([fileBuffer], { type: file.mimetype || 'application/pdf' });
    
    formData.append('file', blob, file.originalFilename);
    if (prompt) {
      formData.append('prompt', prompt);
    }

    console.log('Sending request to N8N:', N8N_WEBHOOK_URL);

    // Forward request to N8N
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    });

    console.log('N8N Response Status:', n8nResponse.status);

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('N8N Error:', errorText);
      res.status(n8nResponse.status).json({ 
        error: `N8N Error: ${n8nResponse.status} - ${errorText}` 
      });
      return;
    }

    const contentType = n8nResponse.headers.get('content-type') || '';
    console.log('N8N Response Content-Type:', contentType);

    if (contentType.includes('application/pdf') || contentType.includes('octet-stream')) {
      // Handle PDF response
      const buffer = await n8nResponse.arrayBuffer();
      console.log('Received PDF buffer:', buffer.byteLength, 'bytes');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalFilename.replace('.pdf', '_processed.pdf')}"`);
      res.send(Buffer.from(buffer));
    } else {
      // Handle text/JSON response
      const responseData = await n8nResponse.text();
      console.log('N8N Response Data:', responseData.substring(0, 200) + '...');
      
      // Try to parse as JSON
      try {
        const jsonData = JSON.parse(responseData);
        res.status(200).json({ success: true, result: jsonData });
      } catch (e) {
        res.status(200).json({ success: true, result: responseData });
      }
    }

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

  } catch (error) {
    console.error('API Route Error:', error);
    
    let errorMessage = 'Failed to process file';
    if (error.message.includes('fetch')) {
      errorMessage = 'Could not connect to N8N webhook - make sure N8N is running';
    } else {
      errorMessage = error.message;
    }

    res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
}