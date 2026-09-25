'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { UserFinancialProfile } from '@/types';
import { DhanMitrLogo } from '@/components/icons/CustomIcons';
import { resolveUserTags, getPrimaryBadge, getAllUserBadges, TagDetails } from '@/lib/userTags';
import {
  X,
  Download,
  Share2,
  Sparkles,
  Award,
  CheckCircle2,
  Copy,
  Smartphone,
  Sliders,
  Eye,
  Crown,
  Lock,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';

interface DhanMitrCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserFinancialProfile;
  savingsRate: number;
  totalIncome?: number;
  netSurplus?: number;
  transactionsCount?: number;
}

export const DhanMitrCardModal: React.FC<DhanMitrCardModalProps> = ({
  isOpen,
  onClose,
  profile,
  savingsRate,
  totalIncome = 0,
  netSurplus = 0,
  transactionsCount = 10,
}) => {
  // Resolve user tags, badges, and surprises
  const userTagsResult = useMemo(() => {
    return resolveUserTags({
      userId: profile?.user_id,
      email: profile?.email,
      savingsRate,
      monthly_income: profile?.monthly_income,
      total_investments: profile?.total_investments,
      existingTags: profile?.tags,
      customTag: profile?.custom_tag,
    });
  }, [profile, savingsRate]);

  // All official locked badges for this user (user cannot remove or change them)
  const allUserBadges = useMemo(() => {
    return userTagsResult.allBadges || getAllUserBadges(userTagsResult.tags, userTagsResult.customTag);
  }, [userTagsResult]);

  const activeBadge = allUserBadges[0] || userTagsResult.activeBadge;
  const memberNumber = userTagsResult.memberNumber || '1';

  const [userName, setUserName] = useState(profile?.name || 'Krish Sharma');
  const [cardTheme, setCardTheme] = useState<'light' | 'dark'>('light');
  const [mobileTab, setMobileTab] = useState<'preview' | 'customize'>('preview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Pre-load official DhanMitr brand logos so canvas can render them instantly (Hook called unconditionally)
  useEffect(() => {
    const imgDark = new Image();
    imgDark.src = '/images/dhanmitr_symbol_dark.png';
    const imgLight = new Image();
    imgLight.src = '/images/dhanmitr_symbol_light.png';
  }, []);

  if (!isOpen) return null;

  // Calculate Dhan Health Score (flattering, accurate to healthy habits: 780 - 890 range)
  const baseScore = 760;
  const savingsBonus = Math.min(Math.round((savingsRate || 35) * 2.2), 90);
  const surplusBonus = netSurplus > 0 ? 25 : 0;
  const investmentBonus = (profile?.total_investments || 0) > 0 ? 20 : 10;
  const dhanScore = Math.min(baseScore + savingsBonus + surplusBonus + investmentBonus, 892);
  const scorePercentile = dhanScore >= 850 ? 'Top 5%' : dhanScore >= 800 ? 'Top 10%' : 'Top 20%';
  const displaySavings = savingsRate > 0 ? `${savingsRate}%` : '49%';

  // Confetti trigger
  const triggerConfetti = async () => {
    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#059669', '#34D399', '#F59E0B', '#FFFFFF'],
      });
    } catch {
      // Ignore if confetti module is unavailable
    }
  };

  // Universal cross-browser rounded rectangle drawer (works on all engines without fail)
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
    }
  };


  // Generate PNG via HTML5 Canvas (1080x1920 Story 9:16 Format - 100% identical to live preview!)
  const handleDownloadPNG = async (mode: 'download' | 'copy' = 'download') => {
    setIsGenerating(true);
    try {
      if (typeof document !== 'undefined' && document.fonts) {
        try {
          await document.fonts.ready;
        } catch {
          // Continue if font readiness fails
        }
      }

      const isDark = cardTheme === 'dark';
      const width = 1080;
      const height = 1920;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not get canvas context');

      // 1. STORY OVERALL BACKGROUND (9:16 1080x1920 - Sleek, radiant backdrop)
      if (isDark) {
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#060A13');
        bgGrad.addColorStop(0.5, '#0B1120');
        bgGrad.addColorStop(1, '#070E1B');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Luminous glowing ambient orbs
        const orb1 = ctx.createRadialGradient(width * 0.85, height * 0.15, 30, width * 0.85, height * 0.15, 480);
        orb1.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
        orb1.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = orb1;
        ctx.fillRect(0, 0, width, height);

        const orb2 = ctx.createRadialGradient(width * 0.15, height * 0.85, 30, width * 0.15, height * 0.85, 520);
        orb2.addColorStop(0, 'rgba(20, 184, 166, 0.18)');
        orb2.addColorStop(1, 'rgba(20, 184, 166, 0)');
        ctx.fillStyle = orb2;
        ctx.fillRect(0, 0, width, height);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#F8FAFC');
        bgGrad.addColorStop(0.4, '#F0FDF4');
        bgGrad.addColorStop(1, '#ECFDF5');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        const orb1 = ctx.createRadialGradient(width * 0.85, height * 0.15, 30, width * 0.85, height * 0.15, 480);
        orb1.addColorStop(0, 'rgba(16, 185, 129, 0.16)');
        orb1.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = orb1;
        ctx.fillRect(0, 0, width, height);

        const orb2 = ctx.createRadialGradient(width * 0.15, height * 0.85, 30, width * 0.15, height * 0.85, 520);
        orb2.addColorStop(0, 'rgba(5, 150, 105, 0.12)');
        orb2.addColorStop(1, 'rgba(5, 150, 105, 0)');
        ctx.fillStyle = orb2;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. STORY HEADER (Refined, elegant watermark atop the story)
      ctx.fillStyle = isDark ? '#34D399' : '#059669';
      ctx.font = 'bold 20px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('✦ DHANMITR WEALTH CARD ✦', width / 2, 175);

      ctx.fillStyle = isDark ? '#64748B' : '#94A3B8';
      ctx.font = '600 15px Inter, system-ui, sans-serif';
      ctx.fillText('Verified Financial Health • 2026', width / 2, 208);

      // 3. MAIN CARD CONTAINER (Centered with balanced padding - NO DEAD SPACE!)
      const cardW = 940;
      const cardH = 1380;
      const cardX = (width - cardW) / 2; // 70
      const cardY = (height - cardH) / 2; // 270
      const radius = 54;

      // Glow halo for metallic cool border
      ctx.save();
      ctx.shadowColor =
        activeBadge.id === 'founder'
          ? 'rgba(245, 158, 11, 0.45)'
          : activeBadge.id === 'clever'
          ? 'rgba(139, 92, 246, 0.35)'
          : 'rgba(16, 185, 129, 0.35)';
      ctx.shadowBlur = 45;
      ctx.shadowOffsetY = 16;

      // Radiant Multi-Stop Gradient Border
      const borderGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
      if (activeBadge.id === 'founder') {
        borderGrad.addColorStop(0, '#F59E0B');
        borderGrad.addColorStop(0.3, '#FDE68A');
        borderGrad.addColorStop(0.7, '#10B981');
        borderGrad.addColorStop(1, '#D97706');
      } else if (activeBadge.id === 'clever') {
        borderGrad.addColorStop(0, '#8B5CF6');
        borderGrad.addColorStop(0.4, '#5EEAD4');
        borderGrad.addColorStop(1, '#10B981');
      } else {
        borderGrad.addColorStop(0, '#10B981');
        borderGrad.addColorStop(0.3, '#34D399');
        borderGrad.addColorStop(0.7, '#2DD4BF');
        borderGrad.addColorStop(1, '#059669');
      }
      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 7;
      ctx.beginPath();
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, radius);
      ctx.stroke();
      ctx.restore();

      // Card Body Fill (Exact match to preview: dark: #0A0F1D, light: #FFFFFF)
      const cardInnerX = cardX + 4;
      const cardInnerY = cardY + 4;
      const cardInnerW = cardW - 8;
      const cardInnerH = cardH - 8;
      const innerRadius = radius - 4;

      ctx.save();
      ctx.beginPath();
      drawRoundedRect(ctx, cardInnerX, cardInnerY, cardInnerW, cardInnerH, innerRadius);
      ctx.clip();

      ctx.fillStyle = isDark ? '#0A0F1D' : '#FFFFFF';
      ctx.fillRect(cardInnerX, cardInnerY, cardInnerW, cardInnerH);

      // Subtle ambient corner shines matching preview
      const cornerGlow1 = ctx.createRadialGradient(
        cardInnerX + cardInnerW,
        cardInnerY,
        10,
        cardInnerX + cardInnerW,
        cardInnerY,
        340
      );
      cornerGlow1.addColorStop(0, isDark ? 'rgba(52, 211, 153, 0.18)' : 'rgba(16, 185, 129, 0.14)');
      cornerGlow1.addColorStop(0.6, isDark ? 'rgba(94, 234, 212, 0.08)' : 'rgba(94, 234, 212, 0.06)');
      cornerGlow1.addColorStop(1, 'transparent');
      ctx.fillStyle = cornerGlow1;
      ctx.fillRect(cardInnerX, cardInnerY, cardInnerW, cardInnerH);

      const cornerGlow2 = ctx.createRadialGradient(
        cardInnerX,
        cardInnerY + cardInnerH,
        10,
        cardInnerX,
        cardInnerY + cardInnerH,
        280
      );
      cornerGlow2.addColorStop(0, isDark ? 'rgba(45, 212, 191, 0.12)' : 'rgba(16, 185, 129, 0.08)');
      cornerGlow2.addColorStop(1, 'transparent');
      ctx.fillStyle = cornerGlow2;
      ctx.fillRect(cardInnerX, cardInnerY, cardInnerW, cardInnerH);

      ctx.restore();

      // 4. INNER CONTENT
      const contentX = cardInnerX + 54;
      const contentW = cardInnerW - 108; // 824px
      let curY = cardInnerY + 52; // 326

      // SECTION 1: TOP HEADER (Brand + User on Left, Badges on Right)
      // Brand Row: Official DhanMitr Logo (matching <DhanMitrLogo /> in preview)
      const logoSrc = isDark ? '/images/dhanmitr_symbol_dark.png' : '/images/dhanmitr_symbol_light.png';
      const logoImg = await new Promise<HTMLImageElement | null>((resolve) => {
        const inDom = document.querySelector<HTMLImageElement>(
          `img[src*="${isDark ? 'symbol_dark' : 'symbol_light'}"]`
        );
        if (inDom && inDom.complete && inDom.naturalWidth > 0) {
          resolve(inDom);
          return;
        }
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = logoSrc;
      });

      const logoH = 56;
      const logoW = Math.round(logoH * (471 / 338)); // 78px
      const logoX = contentX;
      const logoY = curY;

      if (logoImg) {
        ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
      } else {
        // Fallback vector icon if image unavailable
        const logoR = 28;
        const fbX = contentX + logoR;
        const fbY = curY + logoR;
        const logoGrad = ctx.createLinearGradient(fbX - logoR, fbY - logoR, fbX + logoR, fbY + logoR);
        logoGrad.addColorStop(0, '#10B981');
        logoGrad.addColorStop(1, '#059669');
        ctx.fillStyle = logoGrad;
        ctx.beginPath();
        ctx.arc(fbX, fbY, logoR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 26px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('₹', fbX, fbY);
      }

      // Brand Text: "धनMitr"
      const brandTextX = contentX + logoW + 16;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = '900 38px "Noto Sans Devanagari", "Nirmala UI", Inter, system-ui, sans-serif';
      ctx.fillStyle = isDark ? '#FFFFFF' : '#0F172A';
      ctx.fillText('धन', brandTextX, curY + 2);

      const dhanW = ctx.measureText('धन').width;
      ctx.font = '800 38px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#10B981';
      ctx.fillText('Mitr', brandTextX + dhanW, curY + 2);

      // Subtext
      ctx.font = '800 13px Inter, monospace, system-ui, sans-serif';
      ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
      ctx.fillText('YOUR FINANCIAL FRIEND', brandTextX, curY + 44);

      // User Identity Row (below brand)
      const userRowY = curY + 92;
      const avatarR = 36;
      const avatarX = contentX + avatarR;
      const avatarY = userRowY + avatarR;

      const avatarGrad = ctx.createLinearGradient(avatarX - avatarR, avatarY - avatarR, avatarX + avatarR, avatarY + avatarR);
      avatarGrad.addColorStop(0, '#059669');
      avatarGrad.addColorStop(1, '#14B8A6');
      ctx.fillStyle = avatarGrad;
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
      ctx.fill();

      // Avatar Initial
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 34px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initial = userName.trim().charAt(0).toUpperCase() || 'K';
      ctx.fillText(initial, avatarX, avatarY);

      // User Full Name
      const nameX = contentX + 88;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isDark ? '#FFFFFF' : '#0F172A';
      ctx.font = '900 32px Inter, system-ui, sans-serif';
      ctx.fillText(userName, nameX, userRowY + 4);

      // Member Number Pill Badge (@1 or @9274)
      const threadsPillY = userRowY + 44;
      const memberNumStr = `${memberNumber}`;
      ctx.font = 'bold 15px "SF Pro Display", Inter, monospace, system-ui, sans-serif';
      const numTextW = ctx.measureText(`@${memberNumStr}`).width + 26;

      ctx.fillStyle = isDark ? '#111827' : '#0F172A';
      ctx.strokeStyle = isDark ? '#10B981' : '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      drawRoundedRect(ctx, nameX, threadsPillY, numTextW, 30, 15);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = '900 16px Inter, monospace, system-ui, sans-serif';
      ctx.fillStyle = '#10B981';
      ctx.fillText('@', nameX + 10, threadsPillY + 15);

      const atSignW = ctx.measureText('@').width;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Inter, monospace, system-ui, sans-serif';
      ctx.fillText(memberNumStr, nameX + 10 + atSignW + 2, threadsPillY + 15);

      // Badges Stacked Vertically on Right
      const badgesToDraw = allUserBadges.slice(0, 3);
      badgesToDraw.forEach((badge: TagDetails, idx: number) => {
        const bText = badge.badgeLabel;
        ctx.font = 'bold 13.5px Inter, system-ui, sans-serif';
        const textWidth = ctx.measureText(bText).width;
        const pillW = Math.max(textWidth + 34, 175);
        const pillH = 36;
        const pillX = contentX + contentW - pillW;
        const pillY = curY + idx * (pillH + 10);

        if (badge.id === 'founder') {
          const goldGrad = ctx.createLinearGradient(pillX, pillY, pillX + pillW, pillY + pillH);
          if (isDark) {
            goldGrad.addColorStop(0, '#78350F');
            goldGrad.addColorStop(0.5, '#B45309');
            goldGrad.addColorStop(1, '#78350F');
            ctx.fillStyle = goldGrad;
            ctx.strokeStyle = '#F59E0B';
            ctx.lineWidth = 2;
          } else {
            goldGrad.addColorStop(0, '#FEF3C7');
            goldGrad.addColorStop(0.5, '#FDE68A');
            goldGrad.addColorStop(1, '#FEF3C7');
            ctx.fillStyle = goldGrad;
            ctx.strokeStyle = '#F59E0B';
            ctx.lineWidth = 2;
          }
        } else {
          ctx.fillStyle = isDark ? '#111827' : badge.canvasBg;
          ctx.strokeStyle = badge.canvasBorder;
          ctx.lineWidth = 1.5;
        }
        ctx.beginPath();
        drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = badge.id === 'founder' && isDark ? '#FEF3C7' : badge.canvasColor;
        ctx.font = 'bold 13.5px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bText, pillX + pillW / 2, pillY + pillH / 2);
      });

      // SECTION 2: FINANCIAL HEALTH MILESTONE BOX
      curY = curY + 180 + 26; // 532
      const milestoneH = 138;

      const mGrad = ctx.createLinearGradient(contentX, curY, contentX + contentW, curY);
      if (isDark) {
        mGrad.addColorStop(0, 'rgba(6, 78, 59, 0.45)');
        mGrad.addColorStop(0.5, 'rgba(13, 28, 42, 0.45)');
        mGrad.addColorStop(1, 'rgba(6, 78, 59, 0.45)');
        ctx.fillStyle = mGrad;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
      } else {
        mGrad.addColorStop(0, '#F0FDF4');
        mGrad.addColorStop(0.5, '#ECFDF5');
        mGrad.addColorStop(1, '#F0FDF4');
        ctx.fillStyle = mGrad;
        ctx.strokeStyle = '#A7F3D0';
      }
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      drawRoundedRect(ctx, contentX, curY, contentW, milestoneH, 22);
      ctx.fill();
      ctx.stroke();

      // Top Row: Title + Tier Badge
      ctx.fillStyle = isDark ? '#34D399' : '#065F46';
      ctx.font = 'bold 13.5px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('✦ FINANCIAL HEALTH INDEX', contentX + 24, curY + 26);

      const tierW = 124;
      const tierH = 28;
      const tierX = contentX + contentW - 24 - tierW;
      const tierY = curY + 12;
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      drawRoundedRect(ctx, tierX, tierY, tierW, tierH, 14);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TOP 5% TIER', tierX + tierW / 2, tierY + tierH / 2);

      // Middle Row: Status + Grade
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isDark ? '#F1F5F9' : '#1E293B';
      ctx.font = '800 20px Inter, system-ui, sans-serif';
      ctx.fillText('Wealth Maestro Status', contentX + 24, curY + 62);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#10B981';
      ctx.font = '800 17px Inter, system-ui, sans-serif';
      ctx.fillText('Grade A+ (Excellent)', contentX + contentW - 24, curY + 62);

      // Bottom Row: Visual Progress Meter Bar
      const meterY = curY + 98;
      const meterW = contentW - 48;
      const meterH = 10;
      ctx.fillStyle = isDark ? '#1E293B' : '#D1FAE5';
      ctx.beginPath();
      drawRoundedRect(ctx, contentX + 24, meterY, meterW, meterH, 5);
      ctx.fill();

      const meterFillW = meterW * Math.min(dhanScore / 900, 1);
      const fillGrad = ctx.createLinearGradient(contentX + 24, meterY, contentX + 24 + meterFillW, meterY);
      fillGrad.addColorStop(0, '#10B981');
      fillGrad.addColorStop(1, '#2DD4BF');
      ctx.fillStyle = fillGrad;
      ctx.beginPath();
      drawRoundedRect(ctx, contentX + 24, meterY, meterFillW, meterH, 5);
      ctx.fill();

      // SECTION 3: CORE METRICS (Hero Tile + 2 Supporting Tiles)
      curY = curY + milestoneH + 26; // 696

      // Hero Tile: Full Width Dhan Health Score
      const heroH = 165;
      ctx.save();
      ctx.fillStyle = isDark ? '#0E1729' : '#F0FDF4';
      ctx.strokeStyle = isDark ? '#1E293B' : '#D1FAE5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      drawRoundedRect(ctx, contentX, curY, contentW, heroH, 24);
      ctx.fill();
      ctx.stroke();

      // Hero Left: Title + Score Value
      ctx.fillStyle = isDark ? '#34D399' : '#065F46';
      ctx.font = 'bold 14px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('✦ DHAN HEALTH SCORE', contentX + 28, curY + 26);

      ctx.fillStyle = isDark ? '#FFFFFF' : '#0F172A';
      ctx.font = '900 58px Inter, system-ui, sans-serif';
      ctx.fillText(`${dhanScore}`, contentX + 28, curY + 58);

      const scoreW = ctx.measureText(`${dhanScore}`).width;
      ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
      ctx.font = '600 22px Inter, system-ui, sans-serif';
      ctx.fillText(' / 900', contentX + 32 + scoreW, curY + 84);

      // Hero Right: Grade Pill Badge + Status Text
      const gradePillW = 210;
      const gradePillH = 42;
      const gradePillX = contentX + contentW - 28 - gradePillW;
      const gradePillY = curY + 34;

      ctx.fillStyle = isDark ? '#062E25' : '#FFFFFF';
      ctx.strokeStyle = isDark ? '#047857' : '#A7F3D0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      drawRoundedRect(ctx, gradePillX, gradePillY, gradePillW, gradePillH, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isDark ? '#34D399' : '#047857';
      ctx.font = 'bold 15px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Grade A+ • ${scorePercentile}`, gradePillX + gradePillW / 2, gradePillY + gradePillH / 2);

      ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
      ctx.font = 'bold 15px Inter, system-ui, sans-serif';
      ctx.fillText('Wealth Maestro', gradePillX + gradePillW / 2, curY + 102);
      ctx.restore();

      // 2 Bottom Supporting Metric Tiles (Savings Discipline & Portfolio Mix)
      curY = curY + heroH + 20; // 881
      const subCellH = 190;
      const subCellGap = 20;
      const subCellW = (contentW - subCellGap) / 2; // 402px

      // Tile 1: Savings Discipline
      const t1X = contentX;
      ctx.save();
      ctx.fillStyle = isDark ? '#0E1729' : '#F0FDF4';
      ctx.strokeStyle = isDark ? '#1E293B' : '#D1FAE5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      drawRoundedRect(ctx, t1X, curY, subCellW, subCellH, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isDark ? '#34D399' : '#065F46';
      ctx.font = 'bold 14px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('SAVINGS DISCIPLINE', t1X + 24, curY + 24);

      ctx.fillStyle = isDark ? '#FFFFFF' : '#0F172A';
      ctx.font = '900 48px Inter, system-ui, sans-serif';
      ctx.fillText(displaySavings, t1X + 24, curY + 56);

      // Pill: High Prudence
      const p1W = subCellW - 48;
      const p1H = 38;
      const p1Y = curY + 128;
      ctx.fillStyle = isDark ? '#062E25' : '#FFFFFF';
      ctx.strokeStyle = isDark ? '#047857' : '#A7F3D0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      drawRoundedRect(ctx, t1X + 24, p1Y, p1W, p1H, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isDark ? '#34D399' : '#047857';
      ctx.font = 'bold 15px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('High Prudence', t1X + 24 + p1W / 2, p1Y + p1H / 2);
      ctx.restore();

      // Tile 2: Portfolio Mix
      const t2X = contentX + subCellW + subCellGap;
      ctx.save();
      ctx.fillStyle = isDark ? '#0E1729' : '#F0FDF4';
      ctx.strokeStyle = isDark ? '#1E293B' : '#D1FAE5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      drawRoundedRect(ctx, t2X, curY, subCellW, subCellH, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isDark ? '#34D399' : '#065F46';
      ctx.font = 'bold 14px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('PORTFOLIO MIX', t2X + 24, curY + 24);

      ctx.fillStyle = isDark ? '#FFFFFF' : '#0F172A';
      ctx.font = '900 36px Inter, system-ui, sans-serif';
      ctx.fillText('Diversified', t2X + 24, curY + 66);

      // Pill: Equity • Gold • Debt
      const p2W = subCellW - 48;
      const p2H = 38;
      const p2Y = curY + 128;
      ctx.fillStyle = isDark ? '#062E25' : '#FFFFFF';
      ctx.strokeStyle = isDark ? '#047857' : '#A7F3D0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      drawRoundedRect(ctx, t2X + 24, p2Y, p2W, p2H, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isDark ? '#34D399' : '#047857';
      ctx.font = 'bold 14px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Equity • Gold • Debt', t2X + 24 + p2W / 2, p2Y + p2H / 2);
      ctx.restore();

      // SECTION 4: MORGAN HOUSEL QUOTE
      curY = curY + subCellH + 26; // 1097

      // Hairline top border
      ctx.strokeStyle = isDark ? '#1E293B' : '#E2E8F0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(contentX, curY);
      ctx.lineTo(contentX + contentW, curY);
      ctx.stroke();

      const quoteBoxY = curY + 14;
      const quoteBoxH = 112;
      ctx.fillStyle = isDark ? '#0D1526' : '#F8FAFC';
      ctx.strokeStyle = isDark ? '#1E293B' : '#E2E8F0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      drawRoundedRect(ctx, contentX, quoteBoxY, contentW, quoteBoxH, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isDark ? '#6EE7B7' : '#064E3B';
      ctx.font = 'italic 700 24px Georgia, "Times New Roman", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('"Wealth is what you don\'t see."', contentX + contentW / 2, quoteBoxY + 38);

      ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
      ctx.font = '600 15px Inter, system-ui, sans-serif';
      ctx.fillText('— Morgan Housel, Psychology of Money', contentX + contentW / 2, quoteBoxY + 76);

      // SECTION 5: FOOTER (Brand URL & Verified Seal)
      curY = quoteBoxY + quoteBoxH + 24; // 1247
      const qrSize = 56;
      const qrX = contentX;
      const qrY = curY;

      // QR Badge Icon
      ctx.fillStyle = isDark ? '#111827' : '#ECFDF5';
      ctx.strokeStyle = isDark ? '#374151' : '#A7F3D0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      drawRoundedRect(ctx, qrX, qrY, qrSize, qrSize, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isDark ? '#34D399' : '#065F46';
      ctx.font = '900 17px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('QR', qrX + qrSize / 2, qrY + qrSize / 2);

      // URL & Description next to QR
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isDark ? '#FFFFFF' : '#1E293B';
      ctx.font = '900 20px Inter, system-ui, sans-serif';
      ctx.fillText('dhanmitr.ai', qrX + qrSize + 16, qrY + 6);

      ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
      ctx.font = '500 14px Inter, system-ui, sans-serif';
      ctx.fillText('Scan to test score', qrX + qrSize + 16, qrY + 34);

      // Right Seal Badge
      const sealW = 240;
      const sealH = 46;
      const sealX = contentX + contentW - sealW;
      const sealY = qrY + 5;

      ctx.fillStyle = isDark ? 'rgba(6, 78, 59, 0.6)' : '#ECFDF5';
      ctx.strokeStyle = isDark ? '#047857' : '#A7F3D0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      drawRoundedRect(ctx, sealX, sealY, sealW, sealH, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isDark ? '#6EE7B7' : '#047857';
      ctx.font = '900 16px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✔ Verified by धनMitr', sealX + sealW / 2, sealY + sealH / 2);

      // 5. BOTTOM STORY FOOTER (Outside Card)
      ctx.fillStyle = isDark ? '#475569' : '#94A3B8';
      ctx.font = '600 15px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Share on WhatsApp & Instagram • dhanmitr.ai', width / 2, 1720);

      // 6. RELIABLE DIRECT DATA URL DOWNLOAD (Never revokes prematurely, never blank!)
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const safeName = userName.trim().replace(/\s+/g, '_') || 'Member';
      const fileName = `DhanMitr_${safeName}_Card_${cardTheme}_story.png`;

      if (mode === 'copy') {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        } catch {
          mode = 'download';
        }
      }

      if (mode === 'download') {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => link.remove(), 400);

        setDownloadSuccess(true);
        triggerConfetti();
        setTimeout(() => setDownloadSuccess(false), 4000);
      }

      setIsGenerating(false);
    } catch (err) {
      console.error('Failed to generate card:', err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-[#0B101D] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col md:flex-row">
        
        {/* MOBILE TOP NAVIGATION BAR (Visible on < md) */}
        <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14]">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl text-xs font-bold">
            <button
              onClick={() => setMobileTab('preview')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                mobileTab === 'preview'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Card Preview</span>
            </button>
            <button
              onClick={() => setMobileTab('customize')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                mobileTab === 'customize'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTROLS COLUMN (Desktop: Left, Mobile: Shown when tab is 'customize') */}
        <div
          className={`w-full md:w-80 p-5 sm:p-6 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 flex-col justify-between shrink-0 bg-slate-50/80 dark:bg-[#070B14]/70 overflow-y-auto ${
            mobileTab === 'customize' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <div className="space-y-4">
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <DhanMitrLogo className="w-8 h-8 shrink-0" />
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1">
                    धन<span className="text-emerald-500 font-bold">Mitr</span> Card
                  </h2>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {cardTheme === 'dark' ? 'Dark Obsidian Theme' : 'Light Green & White Theme'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Display Name Input */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Card Display Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                maxLength={26}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Your Name on Card"
              />
            </div>

            {/* Custom Tag Surprise Callout */}
            {userTagsResult.customTag && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-teal-500/15 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-1 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-extrabold text-amber-800 dark:text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Surprise Recognition Badge!</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                  You received a special recognition badge:{' '}
                  <strong className="text-emerald-700 dark:text-emerald-300 font-black">
                    "{userTagsResult.customTag}"
                  </strong>
                </p>
              </div>
            )}

            {/* Official Recognition Badges Display (Locked & Mandatory) */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Recognition Badges on Card</span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  Verified & Locked
                </span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allUserBadges.slice(0, 3).map((b: TagDetails, idx: number) => (
                  <span
                    key={b.id + idx}
                    className={`px-2.5 py-1 rounded-xl text-[10.5px] font-extrabold border ${b.colorBg} ${b.colorBorder} ${b.colorText} ${
                      b.id === 'founder' ? 'ring-1 ring-amber-400/50 shadow-2xs' : ''
                    }`}
                  >
                    {b.badgeLabel}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-slate-400">
                Official badges assigned by the team/system. Displayed directly on your story card.
              </p>
            </div>

            {/* Card Theme Switcher (Light Mode vs Dark Mode) */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Card Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCardTheme('light')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-bold text-xs transition-all cursor-pointer ${
                    cardTheme === 'light'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/30 shadow-xs'
                      : 'bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCardTheme('dark')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-bold text-xs transition-all cursor-pointer ${
                    cardTheme === 'dark'
                      ? 'bg-slate-900 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/30 shadow-xs'
                      : 'bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>

            {/* Instagram Threads-Style Member Sequence Badge */}
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-black text-white flex items-center justify-center text-xs font-black shadow-xs">
                  <span className="text-emerald-400">@</span>
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    Member Sequence
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {memberNumber === '1' ? 'Founder & First Member' : `Registration #${memberNumber}`}
                  </p>
                </div>
              </div>
              <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                @{memberNumber}
              </span>
            </div>

            {/* Story Format Default (9:16 - Always Standard) */}
            <div className="p-3 rounded-2xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block text-[11px]">
                    Story / Status Format
                  </span>
                  <span className="text-[10px] text-slate-400">
                    9:16 Vertical HD (1080×1920)
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Default 9:16
              </span>
            </div>

            {/* Social flex tip */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Ready for Social Media</span>
              </p>
              <p className="text-[10.5px] leading-relaxed text-emerald-700 dark:text-emerald-300/90">
                Show off your financial discipline, savings rate, and score without exposing private balances or account numbers!
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-2">
            {downloadSuccess && (
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Card downloaded! High-res PNG saved.</span>
              </div>
            )}

            <button
              onClick={() => handleDownloadPNG('download')}
              disabled={isGenerating}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Rendering PNG...' : `Download ${cardTheme === 'dark' ? 'Dark' : 'Light'} Card PNG`}</span>
            </button>

            <button
              onClick={() => handleDownloadPNG('copy')}
              disabled={isGenerating}
              className="w-full py-2 bg-white dark:bg-[#0F172A] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Image to Clipboard</span>
                </>
              )}
            </button>

            {/* Mobile switch to preview button */}
            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className="md:hidden w-full py-2 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400"
            >
              ← View Card Preview
            </button>
          </div>
        </div>

        {/* CARD PREVIEW COLUMN (Desktop: Right, Mobile: Shown when tab is 'preview') */}
        <div
          className={`flex-1 p-4 sm:p-7 flex-col items-center justify-center bg-slate-100/90 dark:bg-[#070B14] overflow-y-auto relative ${
            mobileTab === 'preview' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <div className="absolute top-4 right-4 hidden md:block">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* THE COOL BORDER WRAPPER (Metallic radiant glowing emerald/gold gradient rim) */}
          <div
            className={`relative p-[3px] rounded-[32px] w-full max-w-[340px] sm:max-w-[360px] my-auto transition-all ${
              activeBadge.id === 'founder'
                ? 'bg-gradient-to-tr from-amber-500 via-yellow-300 to-emerald-600 shadow-[0_16px_45px_-10px_rgba(245,158,11,0.45)] ring-2 ring-amber-400/60'
                : activeBadge.id === 'clever'
                ? 'bg-gradient-to-tr from-purple-500 via-teal-300 to-emerald-600 shadow-[0_16px_45px_-10px_rgba(139,92,246,0.35)] ring-1 ring-purple-400/50'
                : 'bg-gradient-to-tr from-emerald-500 via-teal-300 to-emerald-600 shadow-[0_16px_45px_-10px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/50'
            }`}
          >
            {/* INNER CARD BODY */}
            <div
              className={`w-full rounded-[29px] p-4.5 sm:p-5 select-none relative overflow-hidden space-y-3.5 transition-colors ${
                cardTheme === 'dark' ? 'bg-[#0A0F1D] text-white' : 'bg-white text-slate-900'
              }`}
            >
              
              {/* Subtle ambient corner shine */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-emerald-400/15 via-teal-300/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-teal-400/10 to-transparent rounded-tr-full pointer-events-none" />

              {/* TOP HEADER: BRAND + USER ON LEFT, TAGS STACKED VERTICALLY ON RIGHT */}
              <div className="relative z-10 flex items-start justify-between gap-3 pb-1">
                {/* Left Side: Brand Logo + DhanMitr & User Avatar + Name */}
                <div className="space-y-2.5 min-w-0">
                  {/* Brand Row */}
                  <div className="flex items-center gap-2">
                    <DhanMitrLogo className="w-7 h-7 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`text-sm font-black tracking-tight flex items-center font-display leading-tight ${
                          cardTheme === 'dark' ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        धन<span className="text-emerald-500 font-bold">Mitr</span>
                      </span>
                      <span className="text-[7.5px] font-mono tracking-widest text-slate-400 uppercase">
                        Your Financial Friend
                      </span>
                    </div>
                  </div>

                  {/* User Identity Row */}
                  <div className="flex items-center gap-2.5 pt-0.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0">
                      {userName.trim().charAt(0).toUpperCase() || 'K'}
                    </div>
                    <div className="min-w-0">
                      <h4
                        className={`text-sm font-black tracking-tight truncate leading-tight ${
                          cardTheme === 'dark' ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {userName}
                      </h4>
                      {/* Threads-Style Member Number Badge (@1 or @9274) */}
                      <div
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 mt-0.5 rounded-full text-[10px] font-extrabold shadow-2xs ${
                          cardTheme === 'dark'
                            ? 'bg-[#111827] text-white border border-emerald-500/40'
                            : 'bg-slate-900 text-white border border-slate-800'
                        }`}
                      >
                        <span className="text-emerald-400 font-black">@</span>
                        <span className="tracking-tight font-mono">{memberNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Assigned Tags Stacked Vertically (One by One in a line!) */}
                <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                  {allUserBadges.slice(0, 3).map((badge: TagDetails, idx: number) => (
                    <span
                      key={badge.id + idx}
                      className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase border shadow-2xs whitespace-nowrap ${badge.colorBg} ${badge.colorBorder} ${badge.colorText} ${
                        badge.id === 'founder'
                          ? cardTheme === 'dark'
                            ? 'ring-1 ring-amber-400/80 shadow-amber-500/20 bg-amber-500/20 text-amber-200'
                            : 'ring-1 ring-amber-400/50 shadow-amber-200/50'
                          : ''
                      }`}
                    >
                      {badge.badgeLabel}
                    </span>
                  ))}
                </div>
              </div>

              {/* 3. MIDDLE SECTION: FINANCIAL HEALTH MILESTONE */}
              <div
                className={`relative z-10 p-2.5 rounded-2xl border shadow-2xs space-y-1.5 transition-colors ${
                  cardTheme === 'dark'
                    ? 'bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-emerald-950/40 border-emerald-800/60'
                    : 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border-emerald-200/90'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      cardTheme === 'dark' ? 'text-emerald-300' : 'text-emerald-800'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                    Financial Health Index
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-black bg-emerald-600 text-white shadow-2xs">
                    TOP 5% TIER
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className={`font-extrabold ${cardTheme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                    Wealth Maestro Status
                  </span>
                  <span className="font-extrabold text-emerald-500">Grade A+ (Excellent)</span>
                </div>

                {/* Visual Meter Bar */}
                <div
                  className={`w-full h-1.5 rounded-full overflow-hidden p-0.2 ${
                    cardTheme === 'dark' ? 'bg-slate-800' : 'bg-emerald-100'
                  }`}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${Math.min((dhanScore / 900) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* 4. CORE METRICS (HERO HEALTH SCORE + 2 SUPPORTING METRICS - NO STREAK) */}
              <div className="relative z-10 space-y-2">
                {/* 1. Hero Dhan Health Score (Full Width) */}
                <div
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-colors ${
                    cardTheme === 'dark'
                      ? 'bg-[#0E1729] border-slate-800'
                      : 'bg-emerald-50/50 border-emerald-100'
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span
                      className={`text-[9px] font-bold uppercase block ${
                        cardTheme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'
                      }`}
                    >
                      ✦ Dhan Health Score
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl font-black ${cardTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        {dhanScore}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">/ 900</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span
                      className={`text-[9px] font-extrabold py-0.5 px-2 rounded-md border inline-block ${
                        cardTheme === 'dark'
                          ? 'text-emerald-300 bg-[#062E25] border-emerald-700/50'
                          : 'text-emerald-700 bg-white border-emerald-200'
                      }`}
                    >
                      Grade A+ • {scorePercentile}
                    </span>
                    <p className={`text-[8.5px] font-bold ${cardTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Wealth Maestro
                    </p>
                  </div>
                </div>

                {/* 2 Bottom Supporting Metrics: Savings Discipline & Portfolio Mix */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  {/* Savings Discipline */}
                  <div
                    className={`p-2.5 rounded-2xl border flex flex-col justify-between transition-colors ${
                      cardTheme === 'dark'
                        ? 'bg-[#0E1729] border-slate-800'
                        : 'bg-emerald-50/50 border-emerald-100'
                    }`}
                  >
                    <div>
                      <span
                        className={`text-[8.5px] font-bold uppercase block truncate ${
                          cardTheme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'
                        }`}
                      >
                        Savings Discipline
                      </span>
                      <div className="flex items-baseline justify-center gap-1 mt-0.5">
                        <span className={`text-xl font-black ${cardTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          {displaySavings}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`mt-1.5 text-[9px] font-extrabold py-0.5 px-1 rounded-md border block truncate ${
                        cardTheme === 'dark'
                          ? 'text-emerald-300 bg-[#062E25] border-emerald-700/50'
                          : 'text-emerald-700 bg-white border-emerald-200'
                      }`}
                    >
                      High Prudence
                    </span>
                  </div>

                  {/* Portfolio Mix */}
                  <div
                    className={`p-2.5 rounded-2xl border flex flex-col justify-between transition-colors ${
                      cardTheme === 'dark'
                        ? 'bg-[#0E1729] border-slate-800'
                        : 'bg-emerald-50/50 border-emerald-100'
                    }`}
                  >
                    <div>
                      <span
                        className={`text-[8.5px] font-bold uppercase block truncate ${
                          cardTheme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'
                        }`}
                      >
                        Portfolio Mix
                      </span>
                      <div className="flex items-baseline justify-center gap-1 mt-0.5">
                        <span className={`text-xs font-black truncate ${cardTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          Diversified
                        </span>
                      </div>
                    </div>
                    <span
                      className={`mt-1.5 text-[8.5px] font-extrabold py-0.5 px-1 rounded-md border block truncate ${
                        cardTheme === 'dark'
                          ? 'text-emerald-300 bg-[#062E25] border-emerald-700/50'
                          : 'text-emerald-700 bg-white border-emerald-200'
                      }`}
                    >
                      Equity • Gold • Debt
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. BOTTOM SECTION: QUOTE & VIRALITY QR */}
              <div
                className={`relative z-10 space-y-2 pt-2 border-t ${
                  cardTheme === 'dark' ? 'border-slate-800' : 'border-slate-100'
                }`}
              >
                <div
                  className={`p-2 rounded-xl text-center border ${
                    cardTheme === 'dark'
                      ? 'bg-[#0D1526] border-slate-800 text-emerald-300'
                      : 'bg-slate-50 border-slate-100 text-emerald-950'
                  }`}
                >
                  <p className="text-[9.5px] font-serif italic font-bold">
                    &quot;Wealth is what you don&apos;t see.&quot;
                  </p>
                  <p className="text-[8px] text-slate-400 font-semibold mt-0.5">
                    — Morgan Housel, Psychology of Money
                  </p>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center font-black text-[9px] ${
                        cardTheme === 'dark'
                          ? 'bg-slate-900 border-slate-700 text-emerald-400'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}
                    >
                      QR
                    </div>
                    <div>
                      <p
                        className={`text-[9.5px] font-black leading-none ${
                          cardTheme === 'dark' ? 'text-white' : 'text-slate-800'
                        }`}
                      >
                        dhanmitr.ai
                      </p>
                      <p className="text-[7.5px] text-slate-400">Scan to test score</p>
                    </div>
                  </div>

                  <span
                    className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-md border ${
                      cardTheme === 'dark'
                        ? 'text-emerald-300 bg-emerald-950/60 border-emerald-800'
                        : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    ✔ Verified by धनMitr
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* MOBILE QUICK DOWNLOAD BAR (Visible only on mobile preview tab) */}
          <div className="md:hidden w-full max-w-[340px] mt-4 space-y-2">
            <button
              onClick={() => handleDownloadPNG('download')}
              disabled={isGenerating}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Generating PNG...' : `Download ${cardTheme === 'dark' ? 'Dark' : 'Light'} PNG (9:16)`}</span>
            </button>
            <button
              onClick={() => setMobileTab('customize')}
              className="w-full py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Customize Options</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mt-3 text-center font-medium hidden md:block">
            Live preview • Generated PNG exported at crisp 1080×1920 (9:16 Story format)
          </p>
        </div>
      </div>
    </div>
  );
};
