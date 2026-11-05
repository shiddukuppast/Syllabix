'use client'

import React from 'react'

interface PenguinIllustrationProps {
  isPreview?: boolean
}

export function PenguinIllustration({ isPreview = false }: PenguinIllustrationProps) {
  return (
    <div
      className={`relative flex w-full items-center justify-center overflow-hidden ${
        isPreview ? 'p-0' : 'py-1'
      }`}
    >
      <svg
        viewBox="0 0 520 130"
        className={`w-full select-none overflow-hidden ${
          isPreview ? 'max-w-[280px] h-[72px]' : 'w-full max-h-[136px]'
        }`}
        preserveAspectRatio="xMidYMid meet"
        aria-label="A determined little penguin climbing up a snowy mountain peak along the climbing trail"
        role="img"
      >
        <defs>
          {/* Alpine Twilight Sky Gradient */}
          <linearGradient id="pen-sky-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1b1533" />
            <stop offset="50%" stopColor="#281f4a" />
            <stop offset="100%" stopColor="#3d2f66" />
          </linearGradient>

          {/* Distant Mountain Silhouettes */}
          <linearGradient id="pen-far-peak" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#51427c" />
            <stop offset="100%" stopColor="#2c224f" />
          </linearGradient>

          {/* Main Foreground Mountain Slope */}
          <linearGradient id="pen-ridge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#ece5fa" />
            <stop offset="75%" stopColor="#d2c4f2" />
            <stop offset="100%" stopColor="#a997e0" />
          </linearGradient>

          {/* Mountain Rock Body Gradient */}
          <linearGradient id="pen-rock-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#433669" />
            <stop offset="100%" stopColor="#201938" />
          </linearGradient>

          {/* Scarf Gradient */}
          <linearGradient id="pen-scarf-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff9f8e" />
            <stop offset="100%" stopColor="#ee8a7a" />
          </linearGradient>

          {/* Flag Gradient */}
          <linearGradient id="pen-flag-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffb09c" />
            <stop offset="100%" stopColor="#ee7562" />
          </linearGradient>

          {/* Stage Clip */}
          <clipPath id="pen-stage-clip-520">
            <rect x="0" y="0" width="520" height="130" rx="14" />
          </clipPath>

          <style>{`
            /* ======================================================== */
            /* 1. CONTINUOUS CLIMBING TRANSLATION ACROSS MOUNTAIN SLOPE */
            /* Slope: y = 109 - (72/360) * x  -> 100% surface contact   */
            /* ======================================================== */
            @keyframes penguinRidgeClimb {
              0% {
                transform: translate(0px, 0px);
                opacity: 0;
              }
              3% {
                opacity: 1;
              }
              88% {
                transform: translate(360px, -72px);
                opacity: 1;
              }
              93% {
                transform: translate(372px, -74.4px);
                opacity: 0;
              }
              97% {
                transform: translate(0px, 0px);
                opacity: 0;
              }
              100% {
                transform: translate(0px, 0px);
                opacity: 1;
              }
            }

            /* Natural Waddling Climb (Feet stay planted alternately) */
            @keyframes penguinWaddleClimb {
              0%, 100% {
                transform: rotate(-13deg) translateY(0px);
              }
              25% {
                transform: rotate(-9deg) translateY(-2px);
              }
              50% {
                transform: rotate(-15deg) translateY(0px);
              }
              75% {
                transform: rotate(-11deg) translateY(-2px);
              }
            }

            /* Stepping Foot Movement (Step 1 & Step 2) */
            @keyframes stepFootBack {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translate(3px, -3.5px) rotate(-8deg); }
            }

            @keyframes stepFootFront {
              0%, 100% { transform: translate(3px, -3.5px) rotate(-8deg); }
              50% { transform: translateY(0px); }
            }

            /* Climbing Flipper Balances */
            @keyframes flipperReachFront {
              0%, 100% { transform: rotate(18deg); }
              50% { transform: rotate(-14deg); }
            }

            @keyframes flipperReachBack {
              0%, 100% { transform: rotate(-16deg); }
              50% { transform: rotate(14deg); }
            }

            /* Scarf Flutter */
            @keyframes scarfFlutterAlpine {
              0%, 100% { transform: rotate(-4deg); }
              50% { transform: rotate(12deg) scaleX(1.08); }
            }

            /* Flag Wave */
            @keyframes flagWaveSummit {
              0%, 100% { transform: scaleX(1) skewY(0deg); }
              50% { transform: scaleX(0.85) skewY(-4deg); }
            }

            /* Snow Fall */
            @keyframes snowFallDriftA {
              0% { transform: translate(0, -15px); opacity: 0; }
              20% { opacity: 0.85; }
              80% { opacity: 0.85; }
              100% { transform: translate(-25px, 140px); opacity: 0; }
            }

            @keyframes snowFallDriftB {
              0% { transform: translate(0, -15px); opacity: 0; }
              25% { opacity: 0.75; }
              75% { opacity: 0.75; }
              100% { transform: translate(-18px, 140px); opacity: 0; }
            }

            .anim-pen-track {
              animation: penguinRidgeClimb 8.8s cubic-bezier(0.38, 0, 0.22, 1) infinite;
            }

            .anim-pen-body-waddle {
              animation: penguinWaddleClimb 0.8s ease-in-out infinite;
              transform-origin: 0px 0px;
            }

            .anim-step-back {
              animation: stepFootBack 0.8s ease-in-out infinite;
              transform-origin: 0px 0px;
            }

            .anim-step-front {
              animation: stepFootFront 0.8s ease-in-out infinite;
              transform-origin: 0px 0px;
            }

            .anim-flipper-front {
              animation: flipperReachFront 0.8s ease-in-out infinite;
              transform-origin: 6px 4px;
            }

            .anim-flipper-back {
              animation: flipperReachBack 0.8s ease-in-out infinite;
              transform-origin: -4px 4px;
            }

            .anim-scarf-fly {
              animation: scarfFlutterAlpine 1.3s ease-in-out infinite;
              transform-origin: -4px 0px;
            }

            .anim-summit-flag {
              animation: flagWaveSummit 1.5s ease-in-out infinite;
              transform-origin: 0% 50%;
            }

            .anim-snow-drift-1 { animation: snowFallDriftA 5s linear infinite; }
            .anim-snow-drift-2 { animation: snowFallDriftB 6s linear infinite 1.5s; }
            .anim-snow-drift-3 { animation: snowFallDriftA 5.4s linear infinite 3s; }

            @media (prefers-reduced-motion: reduce) {
              .anim-pen-track,
              .anim-pen-body-waddle,
              .anim-step-back,
              .anim-step-front,
              .anim-flipper-front,
              .anim-flipper-back,
              .anim-scarf-fly,
              .anim-summit-flag,
              .anim-snow-drift-1,
              .anim-snow-drift-2,
              .anim-snow-drift-3 {
                animation: none !important;
              }
            }
          `}</style>
        </defs>

        <g clipPath="url(#pen-stage-clip-520)">
          {/* Alpine Sky Background */}
          <rect x="0" y="0" width="520" height="130" fill="url(#pen-sky-grad)" />

          {/* Distant Twinkling Stars */}
          <circle cx="45" cy="18" r="1.1" fill="#ffffff" opacity="0.65" />
          <circle cx="105" cy="28" r="1.3" fill="#ffffff" opacity="0.45" />
          <circle cx="175" cy="14" r="1.1" fill="#fcd3cb" opacity="0.55" />
          <circle cx="245" cy="22" r="1.4" fill="#ffffff" opacity="0.75" />
          <circle cx="315" cy="12" r="1.2" fill="#ffffff" opacity="0.5" />
          <circle cx="385" cy="20" r="1.3" fill="#e8dff8" opacity="0.65" />
          <circle cx="485" cy="16" r="1.1" fill="#ffffff" opacity="0.5" />

          {/* Distant Mountain Peak (Left) */}
          <polygon points="20,130 90,46 160,130" fill="url(#pen-far-peak)" opacity="0.75" />
          <polygon points="76,62 90,46 104,62 98,68 90,64 82,68" fill="#d9cefa" opacity="0.8" />

          {/* Distant Mountain Peak (Center-Right) */}
          <polygon points="220,130 300,34 380,130" fill="url(#pen-far-peak)" opacity="0.85" />
          <polygon points="284,52 300,34 316,52 308,58 300,54 292,58" fill="#e7dffc" opacity="0.9" />

          {/* Main Mountain Slope Body (Rock Mass below ridge) */}
          <path
            d="M -10 130 L 10 116 L 150 88 L 300 58 L 445 30 L 485 55 L 530 130 Z"
            fill="url(#pen-rock-body)"
          />

          {/* Snowy Mountain Climbing Ridge (Front Slope Path) */}
          <path
            d="M -10 130 L 10 116 L 150 88 L 300 58 L 445 30 L 452 34 L 300 64 L 150 94 L 10 122 L -10 130 Z"
            fill="url(#pen-ridge-grad)"
          />

          {/* Snow Highlights on Ridge Surface */}
          <path
            d="M 10 116 L 150 88 L 300 58 L 445 30"
            stroke="#ffffff"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Soft Climbing Trail Footprint Impressions */}
          <g opacity="0.45" stroke="#9484cc" strokeWidth="1.5" strokeLinecap="round">
            <line x1="60" y1="106" x2="63" y2="105.4" />
            <line x1="100" y1="98" x2="103" y2="97.4" />
            <line x1="140" y1="90" x2="143" y2="89.4" />
            <line x1="200" y1="78" x2="203" y2="77.4" />
            <line x1="260" y1="66" x2="263" y2="65.4" />
            <line x1="320" y1="54" x2="323" y2="53.4" />
            <line x1="380" y1="42" x2="383" y2="41.4" />
          </g>

          {/* Snowy Alpine Pine Trees on Lower Slope */}
          <g transform="translate(80, 93) scale(0.7)">
            <polygon points="10,0 2,14 18,14" fill="#2d224d" />
            <polygon points="10,8 3,21 17,21" fill="#241a40" />
            <path d="M 5 8 Q 10 5 15 8" stroke="#ffffff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M 5 15 Q 10 12 15 15" stroke="#ffffff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </g>

          <g transform="translate(195, 70) scale(0.6)">
            <polygon points="10,0 2,14 18,14" fill="#2d224d" />
            <polygon points="10,8 3,21 17,21" fill="#241a40" />
            <path d="M 5 8 Q 10 5 15 8" stroke="#ffffff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M 5 15 Q 10 12 15 15" stroke="#ffffff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </g>

          {/* Summit Goal: Flag at Peak (x: 445, y: 30) */}
          <g transform="translate(445, 12)">
            {/* Pole Base Rocks */}
            <ellipse cx="0" cy="18" rx="6" ry="2.5" fill="#4d3e75" />
            {/* Pole */}
            <line x1="0" y1="0" x2="0" y2="18" stroke="#8b74f5" strokeWidth="2.2" strokeLinecap="round" />
            {/* Finial Ball */}
            <circle cx="0" cy="0" r="2.2" fill="#fed7aa" />
            {/* Waving Summit Flag */}
            <path
              d="M 1 1 L 24 7 L 1 14 Z"
              fill="url(#pen-flag-grad)"
              className="anim-summit-flag"
            />
            {/* Little Star icon on flag */}
            <circle cx="8" cy="7.5" r="1.8" fill="#ffffff" />
          </g>

          {/* Gentle Falling Snow Particles */}
          <g className="anim-snow-drift-1">
            <circle cx="70" cy="20" r="1.5" fill="#ffffff" opacity="0.8" />
            <circle cx="210" cy="15" r="1.3" fill="#ffffff" opacity="0.7" />
            <circle cx="360" cy="25" r="1.5" fill="#ffffff" opacity="0.85" />
            <circle cx="470" cy="18" r="1.2" fill="#ffffff" opacity="0.65" />
          </g>
          <g className="anim-snow-drift-2">
            <circle cx="120" cy="10" r="1.4" fill="#ffffff" opacity="0.75" />
            <circle cx="280" cy="30" r="1.6" fill="#ffffff" opacity="0.8" />
            <circle cx="410" cy="18" r="1.3" fill="#ffffff" opacity="0.7" />
          </g>
          <g className="anim-snow-drift-3">
            <circle cx="95" cy="40" r="1.4" fill="#ffffff" opacity="0.7" />
            <circle cx="255" cy="45" r="1.3" fill="#ffffff" opacity="0.75" />
            <circle cx="490" cy="35" r="1.5" fill="#ffffff" opacity="0.8" />
          </g>

          {/* ======================================================== */}
          {/* THE DETERMINED CLIMBING PENGUIN                         */}
          {/* Base Position: x=45, y=109 (Directly grounded on ridge)  */}
          {/* ======================================================== */}
          <g className="anim-pen-track" transform="translate(45, 109)">
            {/* Contact Ground Shadow (Directly beneath feet on snow) */}
            <ellipse cx="0" cy="0" rx="14" ry="3.5" fill="#58488a" opacity="0.4" />

            {/* Waddling & Angle Alignment Group */}
            <g className="anim-pen-body-waddle">
              {/* Back Foot (Step cycle) */}
              <g className="anim-step-back" transform="translate(-7, 0)">
                <ellipse cx="0" cy="0" rx="5.5" ry="2.6" fill="#f97316" />
                {/* Claws gripping snow */}
                <circle cx="4" cy="0.5" r="0.9" fill="#ea580c" />
              </g>

              {/* Front Foot (Step cycle) */}
              <g className="anim-step-front" transform="translate(6, 0.5)">
                <ellipse cx="0" cy="0" rx="5.5" ry="2.6" fill="#ea580c" />
                <circle cx="4" cy="0.5" r="0.9" fill="#c2410c" />
              </g>

              {/* Back Flipper (Balancing uphill) */}
              <g className="anim-flipper-back" transform="translate(-10, -18)">
                <path
                  d="M 0 0 C -6 6, -8 15, -4 18 C -1 19, 2 14, 1 7 Z"
                  fill="#1a142c"
                />
              </g>

              {/* Main Penguin Body (Chubby, Prominent, ~42px tall) */}
              <ellipse cx="0" cy="-17" rx="14" ry="17" fill="#241d3b" />

              {/* White Belly Patch */}
              <path
                d="M -5 -27 C 5 -27, 13 -23, 11 -12 C 10 -4, 4 0, -2 0 C -8 0, -12 -5, -11 -13 C -11 -21, -8 -27, -5 -27 Z"
                fill="#ffffff"
              />

              {/* Front Flipper (Reaching forward up the slope) */}
              <g className="anim-flipper-front" transform="translate(8, -18)">
                <path
                  d="M 0 0 C 8 4, 11 12, 8 16 C 5 17, 2 12, 0 6 Z"
                  fill="#2b2346"
                />
              </g>

              {/* Cozy Red Winter Scarf */}
              <path
                d="M -9 -27 Q 1 -24 9 -27 Q 9 -22 1 -22 Q -9 -22 -9 -27 Z"
                fill="url(#pen-scarf-grad)"
              />

              {/* Fluttering Scarf Tail */}
              <g className="anim-scarf-fly" transform="translate(-8, -25)">
                <path
                  d="M 0 0 C -6 3, -10 9, -9 15 C -5 13, -2 8, 2 4 Z"
                  fill="#ee8a7a"
                />
                <line x1="-9" y1="15" x2="-11" y2="17" stroke="#ffe5df" strokeWidth="1.2" />
                <line x1="-7" y1="15.5" x2="-8" y2="18" stroke="#ffe5df" strokeWidth="1.2" />
              </g>

              {/* Penguin Head */}
              <circle cx="1" cy="-29" r="9" fill="#241d3b" />

              {/* Big Expressive Eye */}
              <circle cx="5" cy="-30" r="3" fill="#ffffff" />
              <circle cx="5.8" cy="-30" r="1.7" fill="#1e1838" />
              <circle cx="6.5" cy="-30.6" r="0.75" fill="#ffffff" />

              {/* Bright Orange Beak (Eagerly angled toward summit) */}
              <polygon points="8,-32 18,-29 8,-26" fill="#f97316" />
              <polygon points="8,-30 15,-29 8,-28" fill="#fb923c" />

              {/* Cute Blushing Cheek */}
              <ellipse cx="1" cy="-26" rx="2.5" ry="1.6" fill="#fca5a5" opacity="0.7" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  )
}
