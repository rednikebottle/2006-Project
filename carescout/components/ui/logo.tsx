import React from 'react'

interface LogoProps {
  className?: string
  showText?: boolean
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative h-8 w-8">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Badge Shape */}
          <path
            d="M16 4L26 10V22L16 28L6 22V10L16 4Z"
            fill="#E5F9F7"
            filter="url(#glow)"
          />
          <path
            d="M16 4L26 10V22L16 28L6 22V10L16 4Z"
            stroke="#14B8A6"
            strokeWidth="1.5"
            fill="none"
          />
          
          {/* Magnifying Glass with Heart */}
          <g filter="url(#glow)">
            <circle
              cx="16"
              cy="14"
              r="6"
              fill="white"
              stroke="#14B8A6"
              strokeWidth="1.5"
            />
            <path
              d="M20.5 18.5L24 22"
              stroke="#14B8A6"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Heart */}
            <path
              d="M16 16C16 16 14.5 14.5 13.5 14.5C12.5 14.5 11.5 15.5 11.5 16.5C11.5 18 16 19.5 16 19.5C16 19.5 20.5 18 20.5 16.5C20.5 15.5 19.5 14.5 18.5 14.5C17.5 14.5 16 16 16 16Z"
              fill="#FF9F9F"
              filter="url(#glow)"
            />
          </g>
        </svg>
      </div>
      {showText && (
        <span className="text-xl font-medium text-[#14B8A6]" style={{ filter: 'drop-shadow(0 0 2px rgba(20, 184, 166, 0.3))' }}>
          CareScout
        </span>
      )}
    </div>
  )
} 