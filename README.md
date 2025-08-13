# Technical Spec_Engine Frontend

A modern React frontend application for uploading files and processing them through a technical specification extraction workflow. Features user authentication, drag-and-drop file upload, and real-time processing results.

## Features

- 🔐 **User Authentication** - Secure login/signup system
- 📁 **File Upload** - Drag & drop interface supporting PDF, DOC, DOCX, TXT
- ⚡ **Real-time Processing** - Direct integration with technical specification extraction workflow
- 📊 **Results Display** - View, copy, and download extracted content
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 🔒 **Secure** - JWT-based authentication with token management

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory and add your N8N webhook URL:

```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/YOUR_WEBHOOK_ID
```

### 3. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technical Specification Extraction Workflow Configuration

Your N8N workflow should:

1. **Accept POST requests** with multipart/form-data containing a `file` field
2. **Process the uploaded file** (extract text, analyze content, etc.)
3. **Return a response** in one of these formats:
   - Plain text: `"extracted content here"`
   - JSON object: `{"message": "extracted content", "status": "success"}`
   - JSON with text field: `{"text": "extracted content"}`

### Example Technical Specification Extraction Workflow

1. **Webhook Trigger** - Accepts file uploads
2. **Extract from File** - Processes PDF/DOC files 
3. **Message Model** - Formats the response
4. **Respond to Webhook** - Returns the result

## Project Structure

```
├── app/
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main page component
├── components/
│   ├── FileUpload.tsx     # File upload component
│   ├── LoginForm.tsx      # Authentication form
│   ├── Logo.tsx          # Company logo component
│   └── ResultDisplay.tsx  # Results display component
├── hooks/
│   └── useAuth.tsx       # Authentication hook
├── lib/
│   └── api.ts            # API client functions
├── public/
│   └── images/           # Static images (logo, background)
└── README.md
```

## Authentication

The app includes a simple authentication system with predefined credentials:

- **Login**: Use the provided username and password
- **Session Management**: Automatic token storage and logout
- **Protected Routes**: Dashboard requires authentication

**Default Credentials:**
- **Username:** admin
- **Password:** password123

> **Note**: This is a demo implementation with hardcoded credentials. For production, implement proper user management and database storage.

## File Upload

Supports multiple file formats:
- **PDF** (.pdf)
- **Microsoft Word** (.doc, .docx)
- **Text Files** (.txt)

Maximum file size: 10MB

## API Integration

The frontend communicates with your N8N webhook via:

```typescript
// Send file to N8N webhook
const formData = new FormData()
formData.append('file', file)

const response = await fetch(N8N_WEBHOOK_URL, {
  method: 'POST',
  body: formData
})
```

## Customization

### Styling
- Built with **Tailwind CSS**
- Custom components in `app/globals.css`
- Responsive design for mobile and desktop

### Adding File Types
Update the `accept` property in `components/FileUpload.tsx`:

```typescript
accept: {
  'application/pdf': ['.pdf'],
  'your/mime-type': ['.ext']
}
```

### Technical Specification Extraction Integration
Update the webhook URL in `lib/api.ts` or via environment variables.

## Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set production environment variables**:
   - Update `NEXT_PUBLIC_N8N_WEBHOOK_URL` to your production technical specification extraction instance
   - Configure proper CORS settings

3. **Deploy** to your preferred hosting platform (Vercel, Netlify, etc.)

## Security Notes

- Implement proper user storage (database) for production
- Add rate limiting for file uploads
- Validate file types and sizes server-side
- Use HTTPS in production

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your N8N instance allows requests from your frontend domain
2. **File Upload Fails**: Check file size limits and supported formats
3. **Authentication Issues**: Verify login credentials
4. **Technical Specification Extraction Connection**: Confirm webhook URL and workflow instance accessibility

### Debug Mode

Add console logging to track API calls:

```typescript
// In lib/api.ts
console.log('Sending request to:', N8N_WEBHOOK_URL)
console.log('Response:', response.data)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own applications.
