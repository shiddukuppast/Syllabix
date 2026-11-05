'use client'

import React from 'react'

interface WarriorIllustrationProps {
  isPreview?: boolean
}

export function WarriorIllustration({ isPreview = false }: WarriorIllustrationProps) {
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
        aria-label="A heroic lone warrior dynamically fighting against shadow adversaries"
        role="img"
      >
        <defs>
          {/* Night Battlefield Sky Gradient */}
          <linearGradient id="war-sky-520" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#100b21" />
            <stop offset="50%" stopColor="#191233" />
            <stop offset="100%" stopColor="#241947" />
          </linearGradient>

          {/* Glowing Blade Gradient */}
          <linearGradient id="war-blade-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#e9d5ff" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>

          {/* Energy Slash Arc Gradient (Left) */}
          <linearGradient id="war-slash-l" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#c084fc" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#7e22ce" stopOpacity="0" />
          </linearGradient>

          {/* Energy Slash Arc Gradient (Right) */}
          <linearGradient id="war-slash-r" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#c084fc" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#7e22ce" stopOpacity="0" />
          </linearGradient>

          {/* Cape Gradient */}
          <linearGradient id="war-cape-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>

          {/* Stone Ground Gradient */}
          <linearGradient id="war-ground-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#372c57" />
            <stop offset="100%" stopColor="#19142b" />
          </linearGradient>

          {/* Stage Clip Path */}
          <clipPath id="war-stage-clip-520">
            <rect x="0" y="0" width="520" height="130" rx="14" />
          </clipPath>

          <style>{`
            /* ======================================================== */
            /* 1. WARRIOR COMBAT CHOREOGRAPHY CYCLE (4.4s loop)         */
            /* ======================================================== */
            @keyframes warriorCombatFull {
              0% {
                /* Central Guard Stance */
                transform: translateX(0px);
              }
              12% {
                /* Advance & Lunge toward Left Enemy */
                transform: translateX(-24px);
              }
              22% {
                /* Recoil strike & return to center */
                transform: translateX(-6px);
              }
              38% {
                /* Swift pivot & Lunge toward Right Enemy */
                transform: translateX(26px) scaleX(-1);
              }
              52% {
                /* Back to center */
                transform: translateX(0px) scaleX(1);
              }
              65% {
                /* Surge upward for ground slam finisher */
                transform: translateY(-8px) scale(1.04);
              }
              72% {
                /* Slam down onto ground */
                transform: translateY(2px) scale(1);
              }
              82%, 100% {
                /* Heroic battle-ready stance */
                transform: translate(0px, 0px) scale(1);
              }
            }

            /* Sword Swing Motion */
            @keyframes warriorSwordCombo {
              0%, 8% {
                transform: rotate(-20deg);
              }
              14% {
                /* Left sweeping slash */
                transform: rotate(-115deg) scale(1.2);
              }
              22% {
                transform: rotate(-25deg);
              }
              36% {
                transform: rotate(40deg);
              }
              42% {
                /* Right spinning slash */
                transform: rotate(-120deg) scale(1.25);
              }
              54% {
                transform: rotate(-25deg);
              }
              65% {
                /* Raised high above head */
                transform: rotate(-170deg) scale(1.15);
              }
              72% {
                /* Plunge downward into ground */
                transform: rotate(-30deg) scale(1.25);
              }
              84%, 100% {
                transform: rotate(-25deg);
              }
            }

            /* Energy Slash Arcs */
            @keyframes leftSlashFx520 {
              0%, 11% { opacity: 0; transform: scale(0.6) rotate(-20deg); }
              14% { opacity: 1; transform: scale(1.15) rotate(0deg); }
              22% { opacity: 0; transform: scale(1.3) rotate(15deg); }
              100% { opacity: 0; }
            }

            @keyframes rightSlashFx520 {
              0%, 39% { opacity: 0; transform: scale(0.6) rotate(15deg); }
              43% { opacity: 1; transform: scale(1.2) rotate(0deg); }
              51% { opacity: 0; transform: scale(1.35) rotate(-15deg); }
              100% { opacity: 0; }
            }

            @keyframes groundPulseShockwave {
              0%, 70% { opacity: 0; transform: scaleX(0.2) scaleY(0.4); }
              73% { opacity: 0.95; transform: scaleX(1) scaleY(1); }
              83% { opacity: 0; transform: scaleX(1.8) scaleY(1.3); }
              100% { opacity: 0; }
            }

            /* Left Enemy Action: Advances from left, slashed, recoils */
            @keyframes enemyLeftCombat {
              0% { transform: translateX(0px); opacity: 0.85; }
              10% { transform: translateX(38px); opacity: 1; }
              15% { transform: translateX(-35px) rotate(-16deg); opacity: 0.45; }
              30% { transform: translateX(-15px) rotate(0deg); opacity: 0.8; }
              65% { transform: translateX(15px); opacity: 0.85; }
              73% { transform: translateX(-45px); opacity: 0.3; }
              86%, 100% { transform: translateX(0px); opacity: 0.85; }
            }

            /* Right Enemy Action: Advances from right, slashed, recoils */
            @keyframes enemyRightCombat {
              0% { transform: translateX(0px); opacity: 0.85; }
              35% { transform: translateX(-40px); opacity: 1; }
              43% { transform: translateX(38px) rotate(14deg); opacity: 0.45; }
              60% { transform: translateX(10px) rotate(0deg); opacity: 0.8; }
              65% { transform: translateX(-20px); opacity: 0.85; }
              73% { transform: translateX(50px); opacity: 0.3; }
              86%, 100% { transform: translateX(0px); opacity: 0.85; }
            }

            /* Cape Flutter */
            @keyframes warriorCapeWind {
              0%, 100% { transform: rotate(0deg) skewX(0deg); }
              50% { transform: rotate(9deg) skewX(-5deg); }
            }

            /* Sparks */
            @keyframes sparkBurstL520 {
              0%, 12% { opacity: 0; transform: scale(0); }
              15% { opacity: 1; transform: scale(1.3); }
              22% { opacity: 0; transform: scale(1.9); }
              100% { opacity: 0; }
            }

            @keyframes sparkBurstR520 {
              0%, 41% { opacity: 0; transform: scale(0); }
              44% { opacity: 1; transform: scale(1.3); }
              52% { opacity: 0; transform: scale(1.9); }
              100% { opacity: 0; }
            }

            /* Floating Atmospheric Embers */
            @keyframes emberDriftA {
              0% { transform: translate(0, 0); opacity: 0; }
              30% { opacity: 0.85; }
              70% { opacity: 0.85; }
              100% { transform: translate(35px, -70px); opacity: 0; }
            }

            @keyframes emberDriftB {
              0% { transform: translate(0, 0); opacity: 0; }
              30% { opacity: 0.75; }
              70% { opacity: 0.75; }
              100% { transform: translate(-30px, -65px); opacity: 0; }
            }

            .anim-warrior-hero {
              animation: warriorCombatFull 4.4s cubic-bezier(0.36, 0, 0.24, 1) infinite;
              transform-origin: 260px 104px;
            }

            .anim-warrior-sword {
              animation: warriorSwordCombo 4.4s cubic-bezier(0.36, 0, 0.24, 1) infinite;
              transform-origin: 254px 84px;
            }

            .anim-slash-left-fx {
              animation: leftSlashFx520 4.4s ease-out infinite;
              transform-origin: 215px 82px;
            }

            .anim-slash-right-fx {
              animation: rightSlashFx520 4.4s ease-out infinite;
              transform-origin: 305px 82px;
            }

            .anim-ground-pulse-fx {
              animation: groundPulseShockwave 4.4s ease-out infinite;
              transform-origin: 260px 104px;
            }

            .anim-enemy-left-combat {
              animation: enemyLeftCombat 4.4s cubic-bezier(0.36, 0, 0.24, 1) infinite;
            }

            .anim-enemy-right-combat {
              animation: enemyRightCombat 4.4s cubic-bezier(0.36, 0, 0.24, 1) infinite;
            }

            .anim-warrior-cape {
              animation: warriorCapeWind 1.7s ease-in-out infinite;
              transform-origin: 250px 72px;
            }

            .anim-sparks-l {
              animation: sparkBurstL520 4.4s ease-out infinite;
              transform-origin: 205px 82px;
            }

            .anim-sparks-r {
              animation: sparkBurstR520 4.4s ease-out infinite;
              transform-origin: 315px 82px;
            }

            .anim-ember-1 { animation: emberDriftA 4.5s linear infinite; }
            .anim-ember-2 { animation: emberDriftB 5.5s linear infinite 1.5s; }
            .anim-ember-3 { animation: emberDriftA 5s linear infinite 2.8s; }

            @media (prefers-reduced-motion: reduce) {
              .anim-warrior-hero,
              .anim-warrior-sword,
              .anim-slash-left-fx,
              .anim-slash-right-fx,
              .anim-ground-pulse-fx,
              .anim-enemy-left-combat,
              .anim-enemy-right-combat,
              .anim-warrior-cape,
              .anim-sparks-l,
              .anim-sparks-r,
              .anim-ember-1,
              .anim-ember-2,
              .anim-ember-3 {
                animation: none !important;
              }
            }
          `}</style>
        </defs>

        <g clipPath="url(#war-stage-clip-520)">
          {/* Deep Twilight Battlefield Sky */}
          <rect x="0" y="0" width="520" height="130" fill="url(#war-sky-520)" />

          {/* Distant Ancient Ruins Silhouettes */}
          <g opacity="0.18" fill="#584882">
            <rect x="50" y="48" width="16" height="56" rx="2" />
            <polygon points="46,48 58,38 70,48" />
            <rect x="130" y="60" width="22" height="44" rx="2" />
            <rect x="365" y="52" width="20" height="52" rx="2" />
            <rect x="440" y="44" width="18" height="60" rx="2" />
            <polygon points="436,44 449,34 462,44" />
          </g>

          {/* Mysterious Dusk Moon Glow in Background */}
          <circle cx="260" cy="38" r="24" fill="#a78bfa" opacity="0.18" />
          <circle cx="260" cy="38" r="12" fill="#ede9fe" opacity="0.25" />

          {/* Floating Mystical Embers */}
          <g className="anim-ember-1">
            <circle cx="110" cy="95" r="1.5" fill="#fca5a5" opacity="0.8" />
            <circle cx="380" cy="90" r="1.3" fill="#fcd34d" opacity="0.75" />
          </g>
          <g className="anim-ember-2">
            <circle cx="180" cy="100" r="1.4" fill="#fcd34d" opacity="0.7" />
            <circle cx="320" cy="92" r="1.6" fill="#c084fc" opacity="0.85" />
          </g>
          <g className="anim-ember-3">
            <circle cx="240" cy="98" r="1.3" fill="#fca5a5" opacity="0.75" />
            <circle cx="440" cy="95" r="1.4" fill="#fcd34d" opacity="0.8" />
          </g>

          {/* Ancient Stone Ground Platform */}
          <line x1="0" y1="104" x2="520" y2="104" stroke="#5d4b85" strokeWidth="2" />
          <rect x="0" y="105" width="520" height="25" fill="url(#war-ground-grad)" />

          {/* Glowing Runic Ground Lines */}
          <g opacity="0.35" stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round">
            <line x1="80" y1="107" x2="140" y2="107" />
            <line x1="220" y1="107" x2="300" y2="107" />
            <line x1="380" y1="107" x2="440" y2="107" />
          </g>

          {/* Ground Slam Finisher Shockwave (Phase 3) */}
          <ellipse
            cx="260"
            cy="104"
            rx="85"
            ry="6"
            fill="none"
            stroke="#c084fc"
            strokeWidth="3"
            className="anim-ground-pulse-fx"
          />

          {/* ======================================================== */}
          {/* LEFT SHADOW ENEMY (Approaching from far left x=90)       */}
          {/* ======================================================== */}
          <g className="anim-enemy-left-combat" transform="translate(90, 68)">
            {/* Ground Shadow */}
            <ellipse cx="14" cy="36" rx="14" ry="2.6" fill="#000000" opacity="0.35" />

            {/* Shadow Fiend Body (Dark purple silhouette) */}
            <path
              d="M 5 12 C 5 6, 21 6, 21 12 C 24 20, 22 30, 20 34 C 15 35, 9 35, 6 34 C 4 30, 4 20, 5 12 Z"
              fill="#22173d"
            />
            {/* Horned Hood / Helmet */}
            <circle cx="13" cy="6" r="7" fill="#1b1230" />
            <polygon points="7,2 5,-4 10,1" fill="#1b1230" />
            <polygon points="19,2 21,-4 16,1" fill="#1b1230" />

            {/* Glowing Menacing Eyes */}
            <circle cx="16" cy="6" r="1.3" fill="#ef4444" />
            <circle cx="16.3" cy="5.8" r="0.6" fill="#fef08a" />

            {/* Enemy Curved Dagger / Blade */}
            <path
              d="M 20 20 Q 28 16 35 12 Q 33 21 24 23 Z"
              fill="#4c1d95"
              stroke="#a855f7"
              strokeWidth="0.8"
            />
          </g>

          {/* Impact Sparks on Left Strike */}
          <g className="anim-sparks-l">
            <line x1="205" y1="82" x2="192" y2="72" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" />
            <line x1="205" y1="82" x2="190" y2="88" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="205" y1="82" x2="198" y2="95" stroke="#f43f5e" strokeWidth="1.6" strokeLinecap="round" />
          </g>

          {/* Left Energy Slash Arc FX */}
          <path
            d="M 160 84 C 180 50, 240 50, 260 82"
            stroke="url(#war-slash-l)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            className="anim-slash-left-fx"
          />

          {/* ======================================================== */}
          {/* RIGHT SHADOW ENEMY (Approaching from far right x=410)    */}
          {/* ======================================================== */}
          <g className="anim-enemy-right-combat" transform="translate(410, 66)">
            {/* Ground Shadow */}
            <ellipse cx="14" cy="38" rx="15" ry="2.8" fill="#000000" opacity="0.35" />

            {/* Heavy Armored Shadow Body */}
            <path
              d="M 4 14 C 4 7, 24 7, 24 14 C 27 22, 26 32, 23 36 C 17 37, 10 37, 5 36 C 2 32, 2 22, 4 14 Z"
              fill="#22173d"
            />
            {/* Horned Brute Helmet */}
            <circle cx="14" cy="7" r="7.5" fill="#1b1230" />
            <polygon points="9,2 7,-5 12,0" fill="#1b1230" />
            <polygon points="19,2 21,-5 16,0" fill="#1b1230" />

            {/* Glowing Menacing Eyes */}
            <circle cx="10" cy="7" r="1.3" fill="#f97316" />
            <circle cx="9.7" cy="6.8" r="0.6" fill="#fef08a" />

            {/* Heavy Dark Shield */}
            <path
              d="M 4 16 L -4 19 L -4 30 L 4 33 Z"
              fill="#312252"
              stroke="#7e22ce"
              strokeWidth="1"
            />

            {/* Sword Blade */}
            <line x1="2" y1="18" x2="-14" y2="12" stroke="#6b21a8" strokeWidth="2.4" strokeLinecap="round" />
          </g>

          {/* Impact Sparks on Right Strike */}
          <g className="anim-sparks-r">
            <line x1="315" y1="82" x2="328" y2="72" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" />
            <line x1="315" y1="82" x2="330" y2="88" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="315" y1="82" x2="322" y2="95" stroke="#f43f5e" strokeWidth="1.6" strokeLinecap="round" />
          </g>

          {/* Right Energy Slash Arc FX */}
          <path
            d="M 260 82 C 280 50, 340 50, 360 84"
            stroke="url(#war-slash-r)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            className="anim-slash-right-fx"
          />

          {/* ======================================================== */}
          {/* THE LONE WARRIOR HERO (Center x=260, y=56)               */}
          {/* ======================================================== */}
          <g className="anim-warrior-hero" transform="translate(260, 56)">
            {/* Ground Contact Shadow */}
            <ellipse cx="0" cy="48" rx="18" ry="3.5" fill="#43326b" opacity="0.45" />

            {/* Flowing Violet Hero Cape (Behind Body) */}
            <g className="anim-warrior-cape" transform="translate(-10, 14)">
              <path
                d="M 0 0 C -12 10, -18 24, -14 36 C -6 32, -2 24, 4 14 Z"
                fill="url(#war-cape-grad)"
                opacity="0.9"
              />
            </g>

            {/* Armored Legs & Stance */}
            <g transform="translate(0, 32)">
              {/* Left Boot */}
              <rect x="-9" y="0" width="7" height="16" rx="3" fill="#2d224d" />
              <path d="M -9 12 L -1 12 C 0 12, 1 14, 0 16 L -10 16 Z" fill="#1b1433" />

              {/* Right Boot */}
              <rect x="2" y="0" width="7" height="16" rx="3" fill="#382c5e" />
              <path d="M 2 12 L 10 12 C 11 12, 12 14, 11 16 L 1 16 Z" fill="#1b1433" />
            </g>

            {/* Armored Torso / Breastplate */}
            <path
              d="M -9 12 C -8 7, 8 7, 9 12 C 12 21, 10 32, 8 35 C 4 36, -4 36, -8 35 C -10 32, -11 21, -9 12 Z"
              fill="#3e3066"
            />

            {/* Glowing Chest Emblem / Rune */}
            <circle cx="0" cy="20" r="3" fill="#c084fc" opacity="0.9" />
            <circle cx="0" cy="20" r="1.5" fill="#ffffff" />

            {/* Pauldrons (Shoulder Armor) */}
            <ellipse cx="-9" cy="12" rx="4.5" ry="3" fill="#58458a" />
            <ellipse cx="9" cy="12" rx="4.5" ry="3" fill="#58458a" />

            {/* Knight Helmet / Hero Head */}
            <circle cx="0" cy="4" r="8" fill="#2d224d" />
            <polygon points="-5,1 0,-6 5,1" fill="#4c3b7a" />

            {/* Heroic Glowing Visor Slit */}
            <line x1="-3" y1="4" x2="3" y2="4" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-1.5" y1="4" x2="1.5" y2="4" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" />

            {/* Sword Arm & Glowing Broadsword */}
            <g className="anim-warrior-sword" transform="translate(0, 0)">
              {/* Arm holding hilt */}
              <rect x="-3" y="14" width="6" height="12" rx="2.5" fill="#4c3b7a" transform="rotate(-30)" />

              {/* Sword Crossguard */}
              <rect x="4" y="22" width="12" height="3" rx="1.5" fill="#fcd34d" transform="rotate(-30 10 23.5)" />

              {/* Sword Pommel */}
              <circle cx="5" cy="26" r="2" fill="#fcd34d" />

              {/* Glowing Broadsword Blade */}
              <path
                d="M 12 21 L 46 2 L 48 5 L 14 24 Z"
                fill="url(#war-blade-grad)"
                filter="drop-shadow(0 0 4px #c084fc)"
              />
              <line x1="14" y1="22" x2="44" y2="4" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  )
}
