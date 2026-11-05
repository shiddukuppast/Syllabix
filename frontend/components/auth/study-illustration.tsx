'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function StudyIllustration({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Ambient background glow behind the illustration */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#9d84f8]/20 via-[#fca5a5]/15 to-[#c084fc]/25 blur-2xl" />

      <svg
        viewBox="0 0 520 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-[460px] drop-shadow-xl"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="nightSkyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1f183e" />
            <stop offset="50%" stopColor="#2c2256" />
            <stop offset="100%" stopColor="#433276" />
          </linearGradient>

          <linearGradient id="deskGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f3ecfc" />
            <stop offset="100%" stopColor="#e3d6f5" />
          </linearGradient>

          <linearGradient id="lampGlow" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#fde68a" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="laptopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7763d9" />
            <stop offset="100%" stopColor="#a895fa" />
          </linearGradient>

          <linearGradient id="bookSpineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ee8a7a" />
            <stop offset="100%" stopColor="#f9b3a7" />
          </linearGradient>

          <linearGradient id="chairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3c3161" />
            <stop offset="100%" stopColor="#282046" />
          </linearGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Arched Study Window */}
        <path
          d="M 120 70 A 90 90 0 0 1 300 70 L 300 240 L 120 240 Z"
          fill="url(#nightSkyGrad)"
          stroke="#e8def7"
          strokeWidth="6"
        />

        {/* Window Pane Divider Lines */}
        <line x1="210" y1="20" x2="210" y2="240" stroke="#5d4c8e" strokeWidth="2.5" strokeDasharray="3 3" opacity="0.6" />
        <line x1="120" y1="130" x2="300" y2="130" stroke="#5d4c8e" strokeWidth="2.5" opacity="0.6" />

        {/* Crescent Moon */}
        <path
          d="M 255 45 A 16 16 0 1 0 275 72 A 20 20 0 0 1 255 45 Z"
          fill="#fef08a"
          filter="url(#softGlow)"
        />

        {/* Twinkling Stars in Sky */}
        <motion.circle
          cx="160"
          cy="60"
          r="2.5"
          fill="#ffffff"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="185"
          cy="95"
          r="1.8"
          fill="#fbcfe8"
          animate={{ opacity: [0.8, 0.2, 0.8] }}
          transition={{ duration: 3.1, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="240"
          cy="90"
          r="2.2"
          fill="#fef08a"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: 0.7 }}
        />
        <motion.circle
          cx="145"
          cy="160"
          r="1.5"
          fill="#ffffff"
          animate={{ opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: 1.2 }}
        />
        <motion.circle
          cx="275"
          cy="155"
          r="2"
          fill="#e9d5ff"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 3.4, repeat: Infinity, delay: 0.5 }}
        />

        {/* Window Sill */}
        <rect x="110" y="238" width="200" height="8" rx="4" fill="#ddd0f3" />

        {/* Small Potted Plant on Window Sill */}
        <path d="M 135 238 L 138 222 L 152 222 L 155 238 Z" fill="#e26d5a" />
        {/* Plant Leaves */}
        <path d="M 145 222 C 140 210, 132 212, 134 205 C 142 205, 146 215, 145 222 Z" fill="#2d9b75" />
        <path d="M 145 222 C 150 208, 158 210, 156 202 C 148 204, 145 215, 145 222 Z" fill="#3da47d" />
        <path d="M 145 222 C 145 204, 148 200, 145 198 C 142 202, 144 214, 145 222 Z" fill="#4ade80" />

        {/* Warm Golden Desk Lamp Cone Glow */}
        <polygon points="380,185 270,335 480,335" fill="url(#lampGlow)" />

        {/* Main Study Desk Surface */}
        <path
          d="M 50 300 L 470 300 L 460 325 L 60 325 Z"
          fill="url(#deskGrad)"
          stroke="#d8c7ee"
          strokeWidth="3"
        />
        {/* Desk Front Board */}
        <rect x="60" y="325" width="400" height="15" rx="3" fill="#cfbde8" />
        {/* Desk Legs */}
        <rect x="80" y="340" width="12" height="65" rx="4" fill="#a793c9" />
        <rect x="428" y="340" width="12" height="65" rx="4" fill="#a793c9" />

        {/* Ergonomic Study Chair Backrest behind Student */}
        <rect x="195" y="245" width="60" height="90" rx="14" fill="url(#chairGrad)" />
        <rect x="220" y="335" width="10" height="65" fill="#1e1834" />
        <line x1="200" y1="395" x2="250" y2="395" stroke="#1e1834" strokeWidth="6" strokeLinecap="round" />

        {/* Student Character studying peacefully */}
        {/* Body / Sweater */}
        <path
          d="M 190 320 C 190 280, 205 270, 225 270 C 245 270, 260 280, 260 320 Z"
          fill="#8b74f5"
        />
        {/* Neck */}
        <rect x="220" y="258" width="10" height="15" fill="#fcd34d" rx="4" />
        {/* Head tilted forward reading notes */}
        <ellipse cx="225" cy="245" rx="16" ry="18" fill="#fcd34d" />
        {/* Hair */}
        <path
          d="M 210 242 C 210 230, 222 225, 235 228 C 243 230, 245 240, 243 248 C 235 245, 220 248, 210 242 Z"
          fill="#2e214f"
        />
        {/* Spectacles / Glasses arm */}
        <path d="M 228 244 L 235 243" stroke="#7763d9" strokeWidth="2" strokeLinecap="round" />
        {/* Arm resting on desk holding pencil */}
        <path
          d="M 245 295 C 255 300, 275 302, 290 300"
          stroke="#8b74f5"
          strokeWidth="11"
          strokeLinecap="round"
        />
        {/* Hand */}
        <circle cx="292" cy="299" r="6" fill="#fcd34d" />
        {/* Pencil */}
        <line x1="288" y1="304" x2="300" y2="294" stroke="#e26d5a" strokeWidth="3" strokeLinecap="round" />

        {/* Stack of University Textbooks on Left Desk */}
        {/* Bottom Book */}
        <rect x="85" y="286" width="65" height="14" rx="3" fill="#2d9b75" />
        <rect x="87" y="289" width="61" height="8" rx="1" fill="#ffffff" opacity="0.8" />
        {/* Middle Book */}
        <rect x="88" y="273" width="60" height="13" rx="3" fill="url(#bookSpineGrad)" />
        <rect x="90" y="276" width="56" height="7" rx="1" fill="#ffffff" opacity="0.8" />
        {/* Top Book */}
        <rect x="92" y="261" width="54" height="12" rx="3" fill="#7763d9" />
        <rect x="94" y="264" width="50" height="6" rx="1" fill="#ffffff" opacity="0.8" />
        {/* Bookmark ribbon hanging down */}
        <path d="M 120 273 L 120 294 L 124 290 L 128 294 L 128 273 Z" fill="#fbbf24" />

        {/* Open Study Notebook in front of Student */}
        <path d="M 260 300 L 295 296 L 330 300 L 325 315 L 295 311 L 265 315 Z" fill="#ffffff" stroke="#ded4f2" strokeWidth="1.5" />
        {/* Notebook Lines */}
        <line x1="270" y1="304" x2="290" y2="302" stroke="#cfc1eb" strokeWidth="1.5" />
        <line x1="270" y1="308" x2="290" y2="306" stroke="#cfc1eb" strokeWidth="1.5" />
        <line x1="300" y1="302" x2="320" y2="304" stroke="#cfc1eb" strokeWidth="1.5" />
        <line x1="300" y1="306" x2="320" y2="308" stroke="#cfc1eb" strokeWidth="1.5" />

        {/* Steaming Ceramic Coffee/Tea Mug */}
        <rect x="160" y="288" width="16" height="17" rx="4" fill="#ffffff" stroke="#ddd3f2" strokeWidth="1.5" />
        {/* Handle */}
        <path d="M 176 292 C 181 292, 181 300, 176 300" stroke="#ddd3f2" strokeWidth="2" fill="none" />
        {/* Mug decorative pastel heart */}
        <circle cx="168" cy="297" r="2.5" fill="#fca5a5" />
        {/* Floating Steam Swirls */}
        <motion.path
          d="M 165 284 C 163 277, 168 274, 166 268"
          stroke="#bca5f5"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          animate={{ opacity: [0.2, 0.8, 0], y: [-1, -6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.path
          d="M 170 285 C 172 278, 167 275, 169 269"
          stroke="#fca5a5"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          animate={{ opacity: [0.2, 0.8, 0], y: [-1, -6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
        />

        {/* Laptop on Right Desk with Glowing Syllabix Screen */}
        {/* Screen Base/Hinge */}
        <rect x="330" y="298" width="46" height="4" rx="2" fill="#2d224d" />
        {/* Angled Laptop Screen */}
        <path
          d="M 334 298 L 340 252 L 376 252 L 372 298 Z"
          fill="url(#laptopGrad)"
          stroke="#20183b"
          strokeWidth="2"
        />
        {/* Inner Screen Display with glow */}
        <path
          d="M 337 295 L 342 255 L 373 255 L 369 295 Z"
          fill="#1b1433"
        />
        {/* Code / Study Notes lines on screen */}
        <line x1="344" y1="262" x2="368" y2="262" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="343" y1="268" x2="362" y2="268" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="342" y1="274" x2="367" y2="274" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="341" y1="280" x2="358" y2="280" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" />
        {/* Screen ambient backlight */}
        <polygon points="340,252 376,252 388,300 328,300" fill="#a78bfa" opacity="0.12" />

        {/* Elegant Modern Desk Lamp */}
        {/* Weighted Round Base */}
        <ellipse cx="400" cy="298" rx="14" ry="4" fill="#e26d5a" />
        {/* Curved Metal Neck */}
        <path
          d="M 400 296 C 400 240, 395 210, 375 195"
          stroke="#d95340"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Lamp Shade Dome */}
        <path
          d="M 365 200 C 362 186, 386 180, 388 195 Z"
          fill="#e26d5a"
        />
        {/* Bright Glowing Bulb */}
        <ellipse cx="377" cy="196" rx="5" ry="3" fill="#ffffff" filter="url(#softGlow)" />
      </svg>
    </div>
  )
}

