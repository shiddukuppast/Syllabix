'use client'

import React from 'react'

interface WalkingIllustrationProps {
  isPreview?: boolean
}

export function WalkingIllustration({ isPreview = false }: WalkingIllustrationProps) {
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
        aria-label="A girl holding an umbrella and a boy walking together across the rainy scene"
        role="img"
      >
        <defs>
          {/* Umbrella Gradient */}
          <linearGradient id="walk-umbrella-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#faa596" />
            <stop offset="50%" stopColor="#ee8a7a" />
            <stop offset="100%" stopColor="#db6856" />
          </linearGradient>

          {/* Girl Coat Gradient */}
          <linearGradient id="walk-girl-coat" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9a8af2" />
            <stop offset="100%" stopColor="#7763d9" />
          </linearGradient>

          {/* Boy Coat Gradient */}
          <linearGradient id="walk-boy-coat" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#433b63" />
            <stop offset="100%" stopColor="#2b2545" />
          </linearGradient>

          {/* Scarf Gradient */}
          <linearGradient id="walk-scarf" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fff2ef" />
            <stop offset="100%" stopColor="#fcd3cb" />
          </linearGradient>

          {/* Raindrop Gradient */}
          <linearGradient id="walk-rain-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a394ec" stopOpacity="0" />
            <stop offset="100%" stopColor="#8775db" stopOpacity="0.55" />
          </linearGradient>

          {/* Stage Clip Path */}
          <clipPath id="walk-stage-clip">
            <rect x="0" y="0" width="520" height="130" rx="14" />
          </clipPath>

          <style>{`
            /* ======================================================== */
            /* 1. HORIZONTAL TRANSLATION ACROSS THE FULL SCENE         */
            /* ======================================================== */
            @keyframes walkAcrossWideTrack {
              0% {
                transform: translateX(0px);
                opacity: 0;
              }
              3% {
                opacity: 1;
              }
              88% {
                transform: translateX(390px);
                opacity: 1;
              }
              94% {
                transform: translateX(410px);
                opacity: 0;
              }
              98% {
                transform: translateX(0px);
                opacity: 0;
              }
              100% {
                transform: translateX(0px);
                opacity: 1;
              }
            }

            /* Natural Walking Step Cycles (Dual Phase) */
            @keyframes walkBobbing {
              0%, 50%, 100% { transform: translateY(0px); }
              25%, 75% { transform: translateY(-2.6px); }
            }

            @keyframes legFrontSwing {
              0%, 100% { transform: rotate(-22deg); }
              50% { transform: rotate(22deg); }
            }

            @keyframes legBackSwing {
              0%, 100% { transform: rotate(22deg); }
              50% { transform: rotate(-22deg); }
            }

            @keyframes armGirlSwing {
              0%, 100% { transform: rotate(-10deg); }
              50% { transform: rotate(14deg); }
            }

            @keyframes umbrellaSwayMotion {
              0%, 100% { transform: rotate(-3deg); }
              50% { transform: rotate(3.5deg); }
            }

            @keyframes armBoyFront {
              0%, 100% { transform: rotate(-18deg); }
              50% { transform: rotate(18deg); }
            }

            @keyframes armBoyBack {
              0%, 100% { transform: rotate(18deg); }
              50% { transform: rotate(-18deg); }
            }

            @keyframes scarfFlutterGirl {
              0%, 100% { transform: rotate(0deg) skewX(0deg); }
              50% { transform: rotate(8deg) skewX(-6deg); }
            }

            /* Rain Animation */
            @keyframes rainfallLoopA {
              0% { transform: translate(0, -20px); opacity: 0; }
              20% { opacity: 0.7; }
              80% { opacity: 0.7; }
              100% { transform: translate(-14px, 135px); opacity: 0; }
            }

            @keyframes rainfallLoopB {
              0% { transform: translate(0, -20px); opacity: 0; }
              20% { opacity: 0.6; }
              80% { opacity: 0.6; }
              100% { transform: translate(-12px, 135px); opacity: 0; }
            }

            @keyframes puddleRipplePulse {
              0% { r: 1.5; opacity: 0.8; stroke-width: 1.2; }
              70% { r: 9; opacity: 0.3; stroke-width: 0.8; }
              100% { r: 14; opacity: 0; stroke-width: 0.2; }
            }

            .anim-walkers-track {
              animation: walkAcrossWideTrack 9s cubic-bezier(0.35, 0, 0.25, 1) infinite;
            }

            .anim-girl-bob {
              animation: walkBobbing 0.9s ease-in-out infinite;
              transform-origin: 50% 100%;
            }

            .anim-boy-bob {
              animation: walkBobbing 0.9s ease-in-out infinite 0.12s;
              transform-origin: 50% 100%;
            }

            .anim-leg-front-g {
              animation: legFrontSwing 0.9s ease-in-out infinite;
              transform-origin: 10px 0px;
            }

            .anim-leg-back-g {
              animation: legBackSwing 0.9s ease-in-out infinite;
              transform-origin: 10px 0px;
            }

            .anim-leg-front-b {
              animation: legFrontSwing 0.9s ease-in-out infinite 0.12s;
              transform-origin: 10px 0px;
            }

            .anim-leg-back-b {
              animation: legBackSwing 0.9s ease-in-out infinite 0.12s;
              transform-origin: 10px 0px;
            }

            .anim-arm-boy-f {
              animation: armBoyFront 0.9s ease-in-out infinite 0.12s;
              transform-origin: 6px 2px;
            }

            .anim-arm-boy-b {
              animation: armBoyBack 0.9s ease-in-out infinite 0.12s;
              transform-origin: 6px 2px;
            }

            .anim-umbrella-sway {
              animation: umbrellaSwayMotion 0.9s ease-in-out infinite;
              transform-origin: 22px 28px;
            }

            .anim-scarf-g {
              animation: scarfFlutterGirl 1.4s ease-in-out infinite;
              transform-origin: 2px 2px;
            }

            .anim-rain-1 { animation: rainfallLoopA 2.2s linear infinite; }
            .anim-rain-2 { animation: rainfallLoopB 2.4s linear infinite 0.6s; }
            .anim-rain-3 { animation: rainfallLoopA 2.1s linear infinite 1.2s; }
            .anim-rain-4 { animation: rainfallLoopB 2.5s linear infinite 1.8s; }

            .anim-puddle-1 { animation: puddleRipplePulse 2.8s ease-out infinite; }
            .anim-puddle-2 { animation: puddleRipplePulse 2.8s ease-out infinite 1.4s; }

            @media (prefers-reduced-motion: reduce) {
              .anim-walkers-track,
              .anim-girl-bob,
              .anim-boy-bob,
              .anim-leg-front-g,
              .anim-leg-back-g,
              .anim-leg-front-b,
              .anim-leg-back-b,
              .anim-arm-boy-f,
              .anim-arm-boy-b,
              .anim-umbrella-sway,
              .anim-scarf-g,
              .anim-rain-1,
              .anim-rain-2,
              .anim-rain-3,
              .anim-rain-4,
              .anim-puddle-1,
              .anim-puddle-2 {
                animation: none !important;
              }
            }
          `}</style>
        </defs>

        <g clipPath="url(#walk-stage-clip)">
          {/* Peaceful Rainy Sky Backdrop */}
          <rect x="0" y="0" width="520" height="130" fill="#f8f6fc" />

          {/* Distant Soft Town Silhouette */}
          <g opacity="0.14" fill="#69599e">
            <rect x="40" y="60" width="45" height="46" rx="2" />
            <polygon points="40,60 62,42 85,60" />
            <rect x="110" y="52" width="55" height="54" rx="2" />
            <rect x="190" y="68" width="60" height="38" rx="2" />
            <rect x="275" y="48" width="50" height="58" rx="2" />
            <polygon points="275,48 300,32 325,48" />
            <rect x="350" y="58" width="48" height="48" rx="2" />
            <rect x="420" y="64" width="55" height="42" rx="2" />
          </g>

          {/* Warm Vintage Street Lampposts */}
          <g opacity="0.35" stroke="#5d5380" strokeWidth="1.5" strokeLinecap="round">
            <line x1="75" y1="52" x2="75" y2="106" />
            <line x1="71" y1="52" x2="79" y2="52" />
            <circle cx="75" cy="48" r="3" fill="#fed7aa" stroke="none" />
            {/* Soft Warm Lamp Glow */}
            <circle cx="75" cy="48" r="14" fill="#fed7aa" opacity="0.25" stroke="none" />

            <line x1="445" y1="52" x2="445" y2="106" />
            <line x1="441" y1="52" x2="449" y2="52" />
            <circle cx="445" cy="48" r="3" fill="#fed7aa" stroke="none" />
            <circle cx="445" cy="48" r="14" fill="#fed7aa" opacity="0.25" stroke="none" />
          </g>

          {/* Wet Ground / Pavement Surface */}
          <line x1="0" y1="106" x2="520" y2="106" stroke="#ded8ed" strokeWidth="2" />
          <rect x="0" y="107" width="520" height="23" fill="#f0ecf7" />

          {/* Rain Puddle Reflections & Ripples */}
          <g transform="translate(130, 107)">
            <ellipse cx="0" cy="0" rx="22" ry="2.5" fill="#e5ddf5" opacity="0.75" />
            <circle cx="2" cy="0" r="2" fill="none" stroke="#7763d9" className="anim-puddle-1" />
          </g>

          <g transform="translate(360, 107)">
            <ellipse cx="0" cy="0" rx="26" ry="2.8" fill="#e5ddf5" opacity="0.75" />
            <circle cx="-3" cy="0" r="2" fill="none" stroke="#7763d9" className="anim-puddle-2" />
          </g>

          {/* Gentle Diagonal Rainfall */}
          <g className="anim-rain-1">
            <line x1="45" y1="10" x2="35" y2="30" stroke="url(#walk-rain-grad)" strokeWidth="1.2" />
            <line x1="165" y1="15" x2="155" y2="35" stroke="url(#walk-rain-grad)" strokeWidth="1.2" />
            <line x1="285" y1="8" x2="275" y2="28" stroke="url(#walk-rain-grad)" strokeWidth="1.2" />
            <line x1="405" y1="18" x2="395" y2="38" stroke="url(#walk-rain-grad)" strokeWidth="1.2" />
          </g>
          <g className="anim-rain-2">
            <line x1="95" y1="5" x2="85" y2="25" stroke="url(#walk-rain-grad)" strokeWidth="1.3" />
            <line x1="225" y1="20" x2="215" y2="40" stroke="url(#walk-rain-grad)" strokeWidth="1.3" />
            <line x1="345" y1="12" x2="335" y2="32" stroke="url(#walk-rain-grad)" strokeWidth="1.3" />
            <line x1="475" y1="10" x2="465" y2="30" stroke="url(#walk-rain-grad)" strokeWidth="1.3" />
          </g>
          <g className="anim-rain-3">
            <line x1="125" y1="25" x2="115" y2="45" stroke="url(#walk-rain-grad)" strokeWidth="1.2" />
            <line x1="255" y1="15" x2="245" y2="35" stroke="url(#walk-rain-grad)" strokeWidth="1.2" />
            <line x1="385" y1="22" x2="375" y2="42" stroke="url(#walk-rain-grad)" strokeWidth="1.2" />
          </g>

          {/* ======================================================== */}
          {/* WALKING CHARACTERS (Translating across the 520px track)  */}
          {/* ======================================================== */}
          <g className="anim-walkers-track">
            {/* ------------------------------------------------------ */}
            {/* BOY WALKING (Following behind on the left)              */}
            {/* ------------------------------------------------------ */}
            <g transform="translate(25, 52)">
              {/* Contact Ground Shadow */}
              <ellipse cx="12" cy="54" rx="14" ry="2.5" fill="#695b8d" opacity="0.25" />

              {/* Boy Bobbing Group */}
              <g className="anim-boy-bob">
                {/* Back Leg */}
                <g className="anim-leg-back-b" transform="translate(10, 36)">
                  <rect x="-3" y="0" width="6" height="15" rx="3" fill="#2c2545" />
                  {/* Foot / Boot */}
                  <path d="M -3 13 L 5 13 C 6 13, 7 15, 6 17 L -4 17 Z" fill="#1b172c" />
                </g>

                {/* Front Leg */}
                <g className="anim-leg-front-b" transform="translate(14, 36)">
                  <rect x="-3" y="0" width="6" height="15" rx="3" fill="#352e50" />
                  <path d="M -3 13 L 6 13 C 7 13, 8 15, 7 17 L -4 17 Z" fill="#1b172c" />
                </g>

                {/* Back Arm */}
                <g className="anim-arm-boy-b" transform="translate(7, 18)">
                  <rect x="-2.5" y="0" width="5" height="14" rx="2.5" fill="#2b2545" />
                </g>

                {/* Boy Coat Body */}
                <path
                  d="M 5 14 C 7 13, 17 13, 19 14 C 21 21, 20 34, 18 37 C 14 38, 9 38, 6 37 C 4 34, 4 21, 5 14 Z"
                  fill="url(#walk-boy-coat)"
                />

                {/* Coat Button & Seam Details */}
                <line x1="12" y1="16" x2="12" y2="36" stroke="#231d38" strokeWidth="1" />
                <circle cx="12" cy="20" r="1" fill="#fed7aa" />
                <circle cx="12" cy="26" r="1" fill="#fed7aa" />

                {/* Front Arm */}
                <g className="anim-arm-boy-f" transform="translate(16, 18)">
                  <rect x="-2.5" y="0" width="5.5" height="15" rx="2.5" fill="#352e50" />
                  {/* Hand in coat pocket stance */}
                  <circle cx="0" cy="14" r="2.2" fill="#fcd3cb" />
                </g>

                {/* Head & Face */}
                <circle cx="12" cy="7" r="7.5" fill="#fcd3cb" />

                {/* Boy Hair (Tousled Short Cut) */}
                <path
                  d="M 5 6 C 5 -1, 19 -1, 20 6 C 18 5, 16 6, 15 5 C 13 6, 11 5, 9 6 C 7 5, 6 6, 5 6 Z"
                  fill="#2b243d"
                />

                {/* Profile eye & smile */}
                <circle cx="15.5" cy="7" r="1" fill="#1f1830" />
                <path d="M 15 10 Q 16.5 11.5 18 10" stroke="#a36e63" strokeWidth="0.8" fill="none" />
              </g>
            </g>

            {/* ------------------------------------------------------ */}
            {/* GIRL WALKING (Holding umbrella ahead on the right)      */}
            {/* ------------------------------------------------------ */}
            <g transform="translate(85, 34)">
              {/* Contact Ground Shadow */}
              <ellipse cx="14" cy="72" rx="15" ry="2.6" fill="#695b8d" opacity="0.25" />

              {/* Girl Bobbing Group */}
              <g className="anim-girl-bob">
                {/* Back Leg */}
                <g className="anim-leg-back-g" transform="translate(11, 54)">
                  <rect x="-3" y="0" width="5.5" height="17" rx="2.5" fill="#58489c" />
                  <path d="M -3 15 L 5 15 C 6 15, 7 17, 6 19 L -4 19 Z" fill="#282046" />
                </g>

                {/* Front Leg */}
                <g className="anim-leg-front-g" transform="translate(16, 54)">
                  <rect x="-3" y="0" width="5.5" height="17" rx="2.5" fill="#6a58b5" />
                  <path d="M -3 15 L 6 15 C 7 15, 8 17, 7 19 L -4 19 Z" fill="#282046" />
                </g>

                {/* Girl Coat / Dress */}
                <path
                  d="M 7 32 C 10 31, 18 31, 21 32 C 24 40, 25 51, 24 55 C 19 57, 9 57, 4 55 C 3 51, 4 40, 7 32 Z"
                  fill="url(#walk-girl-coat)"
                />

                {/* Warm Cozy Knitted Scarf */}
                <path
                  d="M 8 28 Q 14 31 20 28 Q 20 33 14 33 Q 8 32 8 28 Z"
                  fill="url(#walk-scarf)"
                />

                {/* Fluttering Scarf Tail */}
                <g className="anim-scarf-g" transform="translate(7, 30)">
                  <path d="M 0 0 C -4 3, -7 8, -6 14 C -3 13, -1 9, 2 5 Z" fill="#fcd3cb" />
                </g>

                {/* Arm Holding Umbrella Handle */}
                <g transform="translate(18, 33)">
                  <rect
                    x="-2.5"
                    y="0"
                    width="5"
                    height="14"
                    rx="2.5"
                    fill="#7763d9"
                    transform="rotate(-28)"
                  />
                  {/* Hand clasping umbrella */}
                  <circle cx="5" cy="11" r="2.4" fill="#fcd3cb" />
                </g>

                {/* Girl Head & Ponytail */}
                <circle cx="14" cy="24" r="7.5" fill="#fcd3cb" />

                {/* Flowing Hair */}
                <path
                  d="M 7 24 C 7 16, 21 16, 22 24 C 20 23, 18 24, 16 23 C 14 24, 12 23, 10 24 Z"
                  fill="#543729"
                />
                {/* Ponytail swinging behind */}
                <path
                  d="M 8 21 C 2 21, -1 27, 1 33 C 3 31, 5 28, 8 25 Z"
                  fill="#452c20"
                />

                {/* Profile eye & cute blush */}
                <circle cx="17.5" cy="24" r="1" fill="#1f1830" />
                <ellipse cx="15.5" cy="26" rx="1.6" ry="1" fill="#f87171" opacity="0.65" />

                {/* ================================================== */}
                {/* UMBRELLA (Firmly attached to girl's hand)         */}
                {/* ================================================== */}
                <g className="anim-umbrella-sway" transform="translate(1, 0)">
                  {/* Umbrella Shaft */}
                  <line
                    x1="22"
                    y1="45"
                    x2="22"
                    y2="13"
                    stroke="#433868"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  {/* Curved Handle J-hook */}
                  <path
                    d="M 22 45 C 22 49, 18 49, 18 46"
                    stroke="#433868"
                    strokeWidth="2.2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Umbrella Top Ferrule */}
                  <line x1="22" y1="13" x2="22" y2="9" stroke="#db6856" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Wide Umbrella Canopy */}
                  <path
                    d="M -7 20 C -2 10, 10 5, 22 5 C 34 5, 46 10, 51 20 C 44 18, 38 19, 32 18 C 26 19, 20 18, 12 18 C 6 19, 0 18, -7 20 Z"
                    fill="url(#walk-umbrella-grad)"
                    filter="drop-shadow(0 2px 4px rgba(60, 40, 90, 0.15))"
                  />

                  {/* Canopy Rib Highlights */}
                  <path
                    d="M 22 5 Q 12 12 12 18"
                    stroke="#fed7aa"
                    strokeWidth="1.2"
                    fill="none"
                    opacity="0.75"
                  />
                  <path
                    d="M 22 5 Q 32 12 32 18"
                    stroke="#fed7aa"
                    strokeWidth="1.2"
                    fill="none"
                    opacity="0.75"
                  />
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  )
}
