'use client'

import React from 'react'
import Image from 'next/image'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* ARROW Logo Image */}
      <div className={`relative ${sizeClasses[size]}`}>
        <Image
          src="/images/arrow-logo.png"
          alt="ARROW Logo"
          width={128}
          height={128}
          className="w-full h-full object-contain drop-shadow-lg"
          priority
        />
      </div>
      
      {/* Company Name and Tagline - Only show if showText is true */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold text-gray-900">ARROW</span>
          <span className="text-xs text-gray-600 tracking-wider">IN STOCK. ON TIME.</span>
        </div>
      )}
    </div>
  )
}
