'use client'

import React from 'react'

export function WalkingIllustration() {
  return (
    <div className="relative flex w-full items-center justify-center overflow-hidden py-1">
      <svg
        viewBox="0 0 380 120"
        className="w-full max-w-[380px] h-[120px] select-none overflow-hidden"
        aria-label="A girl holding an umbrella and a boy walking together across the scene while Syllabix prepares your answer"
        role="img"
      >
        <defs>
          {/* Umbrella Gradient */}
          <linearGradient id="umbrella-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e8f" />
            <stop offset="50%" stopColor="#ee8a7a" />
            <stop offset="100%" stopColor="#dc6f5d" />
          </linearGradient>

          {/* Girl Coat Gradient */}
          <linearGradient id="girl-coat" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9886eb" />
            <stop offset="100%" stopColor="#7763d9" />
          </linearGradient>

          {/* Boy Coat Gradient */}
          <linearGradient id="boy-coat" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f4772" />
            <stop offset="100%" stopColor="#352e50" />
          </linearGradient>

          {/* Raindrop Gradient */}
          <linearGradient id="rain-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9d8ee5" stopOpacity="0" />
            <stop offset="100%" stopColor="#8775db" stopOpacity="0.45" />
          </linearGradient>

          {/* Scarf Gradient */}
          <linearGradient id="scarf-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffedea" />
            <stop offset="100%" stopColor="#fcd3cb" />
          </linearGradient>

          {/* Clipping path to prevent horizontal overflow outside the stage */}
          <clipPath id="stage-clip">
            <rect x="0" y="0" width="380" height="120" rx="12" />
          </clipPath>

          <style>{`
            /* ======================================================== */
            /* 1. HORIZONTAL TRANSLATION ACROSS THE SCENE (Left to Right)*/
            /* ======================================================== */
            @keyframes walkAcrossScene {
              0% {
                transform: translateX(0px);
                opacity: 1;
              }
              90% {
                transform: translateX(215px);
                opacity: 1;
              }
              95% {
                transform: translateX(226px);
                opacity: 0;
              }
              97% {
                transform: translateX(0px);
                opacity: 0;
              }
              100% {
                transform: translateX(0px);
                opacity: 1;
              }
            }

            /* ======================================================== */
            /* 2. NATURAL WALKING GAIT & LIMB CYCLES (1.0s loop = 2 steps)*/
            /* ======================================================== */
            @keyframes walkBobGirl {
              0%, 50%, 100% { transform: translateY(0px); }
              25%, 75% { transform: translateY(-2.4px); }
            }

            @keyframes walkBobBoy {
              0%, 50%, 100% { transform: translateY(0px); }
              25%, 75% { transform: translateY(-2.2px); }
            }

            @keyframes legFront {
              0%, 100% { transform: rotate(-18deg); }
              50% { transform: rotate(18deg); }
            }

            @keyframes legBack {
              0%, 100% { transform: rotate(18deg); }
              50% { transform: rotate(-18deg); }
            }

            @keyframes boyArmFront {
              0%, 100% { transform: rotate(14deg); }
              50% { transform: rotate(-14deg); }
            }

            @keyframes girlArmBack {
              0%, 100% { transform: rotate(-12deg); }
              50% { transform: rotate(12deg); }
            }

            @keyframes umbrellaSway {
              0%, 100% { transform: rotate(-2.5deg); }
              50% { transform: rotate(2deg); }
            }

            @keyframes puddlePulse {
              0%, 50%, 100% { transform: scaleX(0.9); opacity: 0.5; }
              25%, 75% { transform: scaleX(1.1); opacity: 0.8; }
            }

            @keyframes floatHeart {
              0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
              50% { transform: translateY(-3.5px) scale(1.1); opacity: 0.95; }
            }

            @keyframes scarfFlutter {
              0%, 100% { transform: rotate(-3deg); }
              50% { transform: rotate(5deg); }
            }

            /* Ambient Rain Animations */
            @keyframes rainFallA {
              0% { transform: translate(10px, -25px); opacity: 0; }
              20% { opacity: 0.55; }
              80% { opacity: 0.55; }
              100% { transform: translate(-15px, 115px); opacity: 0; }
            }

            @keyframes rainFallB {
              0% { transform: translate(12px, -30px); opacity: 0; }
              25% { opacity: 0.45; }
              80% { opacity: 0.45; }
              100% { transform: translate(-12px, 120px); opacity: 0; }
            }

            /* Class Bindings */
            .anim-walk-across {
              animation: walkAcrossScene 7.2s linear infinite;
            }

            .anim-girl-body {
              animation: walkBobGirl 1.0s ease-in-out infinite;
            }

            .anim-boy-body {
              animation: walkBobBoy 1.0s ease-in-out infinite 0.12s;
            }

            .anim-girl-leg-front {
              transform-origin: 127px 78px;
              animation: legFront 1.0s ease-in-out infinite;
            }

            .anim-girl-leg-back {
              transform-origin: 121px 78px;
              animation: legBack 1.0s ease-in-out infinite;
            }

            .anim-boy-leg-front {
              transform-origin: 49px 78px;
              animation: legFront 1.0s ease-in-out infinite 0.12s;
            }

            .anim-boy-leg-back {
              transform-origin: 41px 78px;
              animation: legBack 1.0s ease-in-out infinite 0.12s;
            }

            .anim-boy-arm {
              transform-origin: 47px 56px;
              animation: boyArmFront 1.0s ease-in-out infinite 0.12s;
            }

            .anim-girl-arm-back {
              transform-origin: 122px 56px;
              animation: girlArmBack 1.0s ease-in-out infinite;
            }

            .anim-umbrella {
              transform-origin: 124px 67px;
              animation: umbrellaSway 1.0s ease-in-out infinite;
            }

            .anim-puddle {
              animation: puddlePulse 1.0s ease-in-out infinite;
            }

            .anim-heart {
              transform-origin: 88px 46px;
              animation: floatHeart 2.0s ease-in-out infinite;
            }

            .anim-scarf {
              transform-origin: 39px 56px;
              animation: scarfFlutter 1.0s ease-in-out infinite;
            }

            .anim-rain-1 {
              animation: rainFallA 1.6s linear infinite;
            }
            .anim-rain-2 {
              animation: rainFallB 1.9s linear infinite 0.4s;
            }
            .anim-rain-3 {
              animation: rainFallA 1.7s linear infinite 0.8s;
            }
            .anim-rain-4 {
              animation: rainFallB 2.1s linear infinite 1.1s;
            }

            /* Reduced motion accessibility */
            @media (prefers-reduced-motion: reduce) {
              .anim-walk-across,
              .anim-girl-body,
              .anim-boy-body,
              .anim-girl-leg-front,
              .anim-girl-leg-back,
              .anim-boy-leg-front,
              .anim-boy-leg-back,
              .anim-boy-arm,
              .anim-girl-arm-back,
              .anim-umbrella,
              .anim-puddle,
              .anim-heart,
              .anim-scarf,
              .anim-rain-1,
              .anim-rain-2,
              .anim-rain-3,
              .anim-rain-4 {
                animation: none !important;
              }
            }
          `}</style>
        </defs>

        {/* Ambient Peaceful Rain Streaks (Stationary background atmosphere) */}
        <g stroke="url(#rain-grad)" strokeWidth="1.2" strokeLinecap="round">
          <line x1="45" y1="5" x2="38" y2="28" className="anim-rain-1" />
          <line x1="105" y1="-10" x2="98" y2="15" className="anim-rain-3" />
          <line x1="165" y1="2" x2="158" y2="25" className="anim-rain-2" />
          <line x1="225" y1="-8" x2="218" y2="18" className="anim-rain-4" />
          <line x1="285" y1="-5" x2="278" y2="20" className="anim-rain-1" />
          <line x1="335" y1="8" x2="328" y2="32" className="anim-rain-4" />
          <line x1="365" y1="-12" x2="358" y2="14" className="anim-rain-2" />
        </g>

        {/* Ground Line */}
        <line
          x1="10"
          y1="104"
          x2="370"
          y2="104"
          stroke="#ebe4f7"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />

        {/* ======================================================== */}
        {/* WALKING COUPLE GROUP (Translates horizontally left to right) */}
        {/* ======================================================== */}
        <g id="walking-couple" className="anim-walk-across" clipPath="url(#stage-clip)">
          {/* Soft Ground Shadows/Puddles that move with each character */}
          <ellipse
            cx="45"
            cy="104.5"
            rx="16"
            ry="2.8"
            fill="#ebe4f8"
            className="anim-puddle"
            style={{ transformOrigin: '45px 104.5px' }}
          />
          <ellipse
            cx="125"
            cy="104.5"
            rx="18"
            ry="3.0"
            fill="#ebe4f8"
            className="anim-puddle"
            style={{ transformOrigin: '125px 104.5px' }}
          />

          {/* Tiny Floating Warm Heart between them */}
          <g className="anim-heart">
            <path
              d="M 88 45 C 88 42, 85 39, 82 41 C 78 43, 79 48, 88 53 C 97 48, 98 43, 94 41 C 91 39, 88 42, 88 45 Z"
              fill="#ee8a7a"
              opacity="0.8"
            />
          </g>

          {/* -------------------------------------------------------- */}
          {/* CHARACTER 1: THE BOY (Walking behind at x=45)            */}
          {/* -------------------------------------------------------- */}
          <g id="boy-character">
            {/* Boy Legs */}
            <g className="anim-boy-body">
              {/* Back Leg */}
              <g className="anim-boy-leg-back">
                <line
                  x1="41"
                  y1="78"
                  x2="37"
                  y2="101"
                  stroke="#2d2645"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <ellipse cx="35" cy="103" rx="5" ry="2.5" fill="#1f1a32" />
              </g>

              {/* Front Leg */}
              <g className="anim-boy-leg-front">
                <line
                  x1="49"
                  y1="78"
                  x2="52"
                  y2="101"
                  stroke="#372f53"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <ellipse cx="54" cy="103" rx="5" ry="2.5" fill="#1f1a32" />
              </g>
            </g>

            {/* Boy Torso, Coat, Head, Arm */}
            <g className="anim-boy-body">
              {/* Fluttering Scarf tail behind */}
              <path
                d="M 39 56 Q 29 62 23 59 Q 29 66 38 62 Z"
                fill="url(#scarf-grad)"
                className="anim-scarf"
              />

              {/* Boy Coat */}
              <rect
                x="34"
                y="53"
                width="22"
                height="28"
                rx="6"
                fill="url(#boy-coat)"
              />
              <line x1="45" y1="55" x2="45" y2="78" stroke="#5d5483" strokeWidth="1" />

              {/* Scarf around neck */}
              <rect
                x="37"
                y="49"
                width="17"
                height="7"
                rx="3"
                fill="url(#scarf-grad)"
              />

              {/* Front Arm swinging naturally with walk cycle */}
              <g className="anim-boy-arm">
                <line
                  x1="47"
                  y1="56"
                  x2="51"
                  y2="69"
                  stroke="#4f4772"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <circle cx="51" cy="70" r="2.2" fill="#fdeee7" />
              </g>

              {/* Boy Head */}
              <circle cx="46" cy="40" r="10" fill="#fdeee7" />
              <circle cx="50" cy="42" r="2.2" fill="#fbb6a7" opacity="0.8" />
              <circle cx="51" cy="39" r="1.3" fill="#282344" />

              {/* Boy Hair */}
              <path
                d="M 36 40 C 35 32, 42 28, 51 28 C 57 28, 59 33, 57 38 C 55 37, 52 38, 50 35 C 47 37, 42 35, 40 38 C 38 39, 37 41, 36 40 Z"
                fill="#282344"
              />
            </g>
          </g>

          {/* -------------------------------------------------------- */}
          {/* CHARACTER 2: THE GIRL (Walking ahead at x=125)           */}
          {/* -------------------------------------------------------- */}
          <g id="girl-character">
            {/* Girl Legs */}
            <g className="anim-girl-body">
              {/* Back Leg */}
              <g className="anim-girl-leg-back">
                <line
                  x1="121"
                  y1="78"
                  x2="116"
                  y2="101"
                  stroke="#3f375c"
                  strokeWidth="3.6"
                  strokeLinecap="round"
                />
                <ellipse cx="114" cy="103" rx="4.8" ry="2.3" fill="#ee8a7a" />
              </g>

              {/* Front Leg */}
              <g className="anim-girl-leg-front">
                <line
                  x1="127"
                  y1="78"
                  x2="131"
                  y2="101"
                  stroke="#4a416b"
                  strokeWidth="3.6"
                  strokeLinecap="round"
                />
                <ellipse cx="133" cy="103" rx="4.8" ry="2.3" fill="#ee8a7a" />
              </g>
            </g>

            {/* Girl Coat, Head, Arms & Umbrella */}
            <g className="anim-girl-body">
              {/* Back Arm swinging naturally */}
              <g className="anim-girl-arm-back">
                <line
                  x1="122"
                  y1="56"
                  x2="117"
                  y2="68"
                  stroke="#6855be"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="116" cy="69" r="2" fill="#fdeee7" />
              </g>

              {/* Girl A-Line Coat */}
              <path
                d="M 119 53 L 133 53 L 138 78 C 138 79, 114 79, 114 78 Z"
                fill="url(#girl-coat)"
              />
              <path
                d="M 120 53 Q 126 57 132 53 Q 126 55 120 53 Z"
                fill="#ffffff"
              />

              {/* Girl Head */}
              <circle cx="125" cy="40" r="10" fill="#fdeee7" />
              <circle cx="129" cy="42" r="2.2" fill="#fbb6a7" opacity="0.85" />
              <circle cx="130" cy="39" r="1.3" fill="#282344" />

              {/* Girl Hair (Wavy Bob with coral hairpin) */}
              <path
                d="M 115 42 C 114 32, 121 28, 130 28 C 137 28, 139 33, 136 38 C 134 37, 131 37, 130 35 C 127 36, 123 35, 121 38 C 119 41, 116 45, 115 42 Z"
                fill="#2c2445"
              />
              <path
                d="M 116 38 Q 112 45 116 50 Q 119 46 117 40 Z"
                fill="#2c2445"
              />
              <circle cx="132" cy="33" r="2" fill="#ee8a7a" />

              {/* Girl Front Arm Holding Umbrella */}
              <path
                d="M 126 58 Q 128 64 124 67"
                stroke="#7763d9"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="124" cy="67" r="2.2" fill="#fdeee7" />

              {/* Umbrella Group (Sways subtly with each step) */}
              <g className="anim-umbrella">
                {/* Umbrella Shaft */}
                <line
                  x1="124"
                  y1="67"
                  x2="117"
                  y2="19"
                  stroke="#544877"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* J-Curve Handle */}
                <path
                  d="M 124 67 Q 125 72 121 72 Q 118 72 118 69"
                  stroke="#544877"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Umbrella Top Cap */}
                <line
                  x1="117"
                  y1="19"
                  x2="116"
                  y2="14"
                  stroke="#ee8a7a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Umbrella Canopy Shell */}
                <path
                  d="M 85 28 Q 117 12 151 28 Q 142 25 133 27 Q 124 25 115 27 Q 105 25 96 27 Q 91 26 85 28 Z"
                  fill="url(#umbrella-grad)"
                  stroke="#dc6f5d"
                  strokeWidth="0.8"
                />

                {/* Umbrella Rib Highlights */}
                <path
                  d="M 117 17 Q 116 22 115 27"
                  stroke="#ffece8"
                  strokeWidth="0.9"
                  strokeOpacity="0.75"
                  fill="none"
                />
                <path
                  d="M 117 17 Q 126 22 133 27"
                  stroke="#ffece8"
                  strokeWidth="0.9"
                  strokeOpacity="0.75"
                  fill="none"
                />
                <path
                  d="M 117 17 Q 106 22 96 27"
                  stroke="#ffece8"
                  strokeWidth="0.9"
                  strokeOpacity="0.75"
                  fill="none"
                />

                {/* Raindrops bouncing off umbrella */}
                <circle cx="103" cy="18" r="1.2" fill="#dcd5f7" opacity="0.7" />
                <circle cx="137" cy="22" r="1.2" fill="#dcd5f7" opacity="0.7" />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  )
}
