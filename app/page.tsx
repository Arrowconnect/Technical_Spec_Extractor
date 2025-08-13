'use client'

import { useState } from 'react'
import { useAuth, AuthProvider } from '@/hooks/useAuth'
import LoginForm from '@/components/LoginForm'
import FileUpload from '@/components/FileUpload'
import PromptEditor from '@/components/PromptEditor'
import ResultDisplay from '@/components/ResultDisplay'
import Logo from '@/components/Logo'

function AppContent() {
  const { user, isLoading, logout } = useAuth()
  const [result, setResult] = useState<string | null>(null)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [pdfFilename, setPdfFilename] = useState<string>('')
  const [currentPrompt, setCurrentPrompt] = useState<string>(`Prompt:

Extract ALL technical specifications from this combined document across these 25 categories. Use EXACT values, units, and preserve original context:

1 MATERIAL_SIZE_GRADES_MANUFACTURING
2 YEAR_RESTRICTIONS
3 CLIENT_APPROVED_VENDOR_LIST
4 CERTIFICATES
5 HEAT_TREATMENT
6 SURFACE_TREATMENT
7 CHEMICAL_REQUIREMENTS
8 PMI_REQUIREMENTS
9 MECHANICAL_REQUIREMENTS
9.1. TENSILE
9.2. IMPACT_OR_CHARPY
9.3. HARDNESS
9.4. OTHER_MECHANICAL_REQUIREMENTS
10 NDT_REQUIREMENTS
10.1. UT (Ultrasonic Testing)
10.2. RT (Radiographic Testing)
10.3. MPI_OR_MT (Magnetic Particle Inspection/Testing)
10.4. EMI (Electromagnetic Inspection)
10.5. LPT (Liquid Penetrant Testing)
10.6. OTHER_NDT_REQUIREMENTS
11 DWT_TEST (Drop Weight Tear Test)
12 IGC_TEST (Intergranular Corrosion Test)
13 CORROSION_TEST
14 SOUR_SERVICES_NACE
15 GRAIN_SIZE
16 DIMENSION
16.1. OUTER_DIAMETER
16.2. THICKNESS
16.3. OUT_OF_ROUNDNESS_OR_OVALITY
16.4. SPECNESS
16.5. OTHER_DIMENSION
17 MARKING
18 PAINTING_COATING
19 THREADING
20 COLOUR_CODING
21 PACKING_PRESERVATION
22 THIRD_PARTY_INSPECTION_REQUIREMENT
 23 OTHER_TECHNICAL_SPECIFICATIONS

 For each category found, return in this JSON format:
 {
   "category_name": {
     "data_points": [
       {
         "specification": "exact value with units",
         "context": "what it refers to",
         "standard": "referenced standard",
         "source": "page/section location"
       }
     ]
   }
 }`)

  const handleResult = (newResult: string, blob?: Blob, filename?: string) => {
    setResult(newResult)
    setPdfBlob(blob || null)
    setPdfFilename(filename || '')
  }

  const handleNewUpload = () => {
    setResult(null)
    setPdfBlob(null)
    setPdfFilename('')
  }

  const handlePromptChange = (prompt: string) => {
    setCurrentPrompt(prompt)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-gray-50">

      
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Logo size="md" />
              <div className="border-l border-white/30 h-10 mx-3"></div>
              <h1 className="text-2xl font-bold text-white">Technical Spec_Engine</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-white/90">
                <span>Welcome, {user.name || user.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={logout}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/30"
                >
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-10">
          {/* Welcome Section */}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Welcome to Technical Spec_Engine
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Upload your documents and extract technical specifications using our powerful workflow. 
              Supports PDF, DOC, DOCX, and TXT files with advanced processing capabilities.
            </p>
          </div>

          {/* Upload and Prompt Section */}
          {!result && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Panel - File Upload */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Upload Document</h3>
                </div>
                <FileUpload onResult={handleResult} prompt={currentPrompt} />
              </div>

              {/* Right Panel - Prompt Editor */}
              <div className="space-y-6">
                <PromptEditor onPromptChange={handlePromptChange} />
              </div>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Processing Complete
                </h3>
                <button
                  onClick={handleNewUpload}
                  className="btn-primary"
                >
                  Upload Another File
                </button>
              </div>
              <ResultDisplay result={result} pdfBlob={pdfBlob} filename={pdfFilename} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}