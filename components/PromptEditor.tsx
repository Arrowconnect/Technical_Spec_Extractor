'use client'

import { useState } from 'react'
import { Settings, RotateCcw } from 'lucide-react'

interface PromptEditorProps {
  onPromptChange: (prompt: string) => void
}

export default function PromptEditor({ onPromptChange }: PromptEditorProps) {
  const [promptMode, setPromptMode] = useState<'default' | 'custom'>('default')
  
  const defaultPrompt = `Prompt:

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
}`

  const [customPrompt, setCustomPrompt] = useState(defaultPrompt)

  const handlePromptChange = (newPrompt: string) => {
    setCustomPrompt(newPrompt)
    onPromptChange(newPrompt)
  }

  const handleModeChange = (mode: 'default' | 'custom') => {
    setPromptMode(mode)
    if (mode === 'default') {
      onPromptChange(defaultPrompt)
    } else {
      onPromptChange(customPrompt)
    }
  }

  const handleReset = () => {
    setCustomPrompt(defaultPrompt)
    onPromptChange(defaultPrompt)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="card p-6">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-6">
          <Settings className="h-6 w-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Prompt Configuration</h3>
        </div>

        {/* Mode Selection Buttons */}
        <div className="flex space-x-3 mb-6">
          <button
            onClick={() => handleModeChange('default')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              promptMode === 'default'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Default
          </button>
          <button
            onClick={() => handleModeChange('custom')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              promptMode === 'custom'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Custom
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-1"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Prompt Display/Editor */}
        <div className="bg-white border border-gray-300 rounded-lg">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-300">
            <h4 className="text-sm font-semibold text-gray-700">Prompt</h4>
          </div>
          {promptMode === 'default' ? (
            <div className="p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                {defaultPrompt}
              </pre>
            </div>
          ) : (
            <textarea
              value={customPrompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              className="w-full p-4 text-sm text-gray-700 border-0 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono leading-relaxed"
              rows={20}
              placeholder="Enter your custom prompt here..."
            />
          )}
        </div>

        {/* Info Text */}
        <div className="mt-4 text-sm text-gray-600">
          {promptMode === 'default' ? (
            <p>Using the default technical specifications extraction prompt. Switch to "Custom" to modify.</p>
          ) : (
            <p>Custom prompt mode. You can modify the prompt to extract different specifications or add new categories.</p>
          )}
        </div>
      </div>
    </div>
  )
}
