"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

export interface SpendingSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: SpendingSegment[];
  total: number;
  size?: number;
  onSelectSegment?: (segment: SpendingSegment | null) => void;
}

export function DonutChart({ segments, total, size = 220, onSelectSegment }: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const baseOuterR = size / 2 - 8;
    const baseInnerR = baseOuterR * 0.62;
    let startAngle = -Math.PI / 2;

    segments.forEach((seg, idx) => {
      const isHovered = hoveredIdx === idx;
      const sliceAngle = total > 0 ? (seg.value / total) * Math.PI * 2 : 0;
      const endAngle = startAngle + sliceAngle;

      const outerR = isHovered ? baseOuterR + 4 : baseOuterR;
      const innerR = isHovered ? baseInnerR - 2 : baseInnerR;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, endAngle);
      ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
      ctx.closePath();

      if (isHovered) {
        ctx.shadowColor = seg.color;
        ctx.shadowBlur = 12;
      }
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.restore();

      startAngle = endAngle;
    });

    // Center cutout
    ctx.beginPath();
    ctx.arc(cx, cy, baseInnerR - 1, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }, [segments, total, size, hoveredIdx]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const cx = size / 2;
    const cy = size / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const baseOuterR = size / 2 - 8;
    const baseInnerR = baseOuterR * 0.62;

    if (dist >= baseInnerR - 4 && dist <= baseOuterR + 6) {
      let angle = Math.atan2(dy, dx) + Math.PI / 2;
      if (angle < 0) angle += Math.PI * 2;

      let currentStart = 0;
      let foundIdx: number | null = null;

      for (let i = 0; i < segments.length; i++) {
        const sliceAngle = total > 0 ? (segments[i].value / total) * Math.PI * 2 : 0;
        if (angle >= currentStart && angle < currentStart + sliceAngle) {
          foundIdx = i;
          break;
        }
        currentStart += sliceAngle;
      }

      setHoveredIdx(foundIdx);
      if (onSelectSegment) onSelectSegment(foundIdx !== null ? segments[foundIdx] : null);
    } else {
      setHoveredIdx(null);
      if (onSelectSegment) onSelectSegment(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
    setMousePos(null);
    if (onSelectSegment) onSelectSegment(null);
  };

  const activeItem = hoveredIdx !== null ? segments[hoveredIdx] : null;

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center justify-center select-none cursor-pointer"
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
        {activeItem ? (
          <>
            <span className="text-xs font-bold text-slate-500 line-clamp-1">{activeItem.label}</span>
            <span className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
              ₹{activeItem.value.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-emerald-600">
              {((activeItem.value / total) * 100).toFixed(1)}%
            </span>
          </>
        ) : (
          <>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900">
              ₹{total.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Total Spent
            </span>
          </>
        )}
      </div>
    </div>
  );
}

interface LineChartProps {
  incomeData: number[];
  expenseData: number[];
  labels: string[];
  surplus: number;
  width?: number;
  height?: number;
}

export function CashFlowLineChart({
  incomeData,
  expenseData,
  labels,
  surplus,
  width = 460,
  height = 220,
}: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // Padding configured to give ample headroom for tooltips and badges
    const padL = 44, padR = 68, padT = 32, padB = 30;
    const chartW = width - padL - padR;
    const chartH = height - padT - padB;

    const allVals = [...incomeData, ...expenseData];
    const maxVal = Math.max(...allVals, 80000) * 1.12;
    const yTicks = [0, 20000, 40000, 60000, 80000];

    // Grid lines & Y labels
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px system-ui, sans-serif";
    ctx.textAlign = "right";

    yTicks.forEach((val) => {
      const y = padT + chartH - (val / maxVal) * chartH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + chartW, y);
      ctx.stroke();
      ctx.fillText(`₹${(val / 1000).toFixed(0)}K`, padL - 6, y + 3);
    });

    // X labels
    ctx.textAlign = "center";
    labels.forEach((label, i) => {
      const x = padL + (i / (labels.length - 1)) * chartW;
      const isHovered = hoveredIdx === i;
      ctx.fillStyle = isHovered ? "#0f172a" : "#94a3b8";
      ctx.font = isHovered ? "bold 11px system-ui, sans-serif" : "10px system-ui, sans-serif";
      ctx.fillText(label, x, height - 8);
    });

    // Helper to calculate coordinates
    const getPoints = (data: number[]) => {
      return data.map((val, i) => ({
        x: padL + (i / (data.length - 1)) * chartW,
        y: padT + chartH - (val / maxVal) * chartH,
      }));
    };

    const incomePoints = getPoints(incomeData);
    const expensePoints = getPoints(expenseData);

    // Fill income gradient area
    if (incomePoints.length > 0) {
      const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
      grad.addColorStop(0, "rgba(16, 185, 129, 0.20)");
      grad.addColorStop(0.7, "rgba(16, 185, 129, 0.04)");
      grad.addColorStop(1, "rgba(16, 185, 129, 0.0)");

      ctx.beginPath();
      ctx.moveTo(incomePoints[0].x, padT + chartH);
      incomePoints.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(incomePoints[incomePoints.length - 1].x, padT + chartH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Draw Income Line
    ctx.beginPath();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.setLineDash([]);
    incomePoints.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Draw Expense Dashed Line
    ctx.beginPath();
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);
    expensePoints.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Hover vertical guideline & focus points
    if (hoveredIdx !== null && hoveredIdx >= 0 && hoveredIdx < labels.length) {
      const ip = incomePoints[hoveredIdx];
      const ep = expensePoints[hoveredIdx];

      ctx.save();
      ctx.strokeStyle = "rgba(15, 23, 42, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(ip.x, padT);
      ctx.lineTo(ip.x, padT + chartH);
      ctx.stroke();
      ctx.restore();

      // Income point glow
      ctx.beginPath();
      ctx.arc(ip.x, ip.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#10b981";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ip.x, ip.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      // Expense point glow
      ctx.beginPath();
      ctx.arc(ep.x, ep.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#64748b";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ep.x, ep.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    } else {
      // Default end dot on income
      const last = incomePoints[incomePoints.length - 1];
      ctx.beginPath();
      ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#10b981";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(last.x, last.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    }

    // Surplus Badge at top-right
    const lastP = incomePoints[incomePoints.length - 1];
    const badgeW = 58, badgeH = 30;
    const bx = lastP.x + 8;
    const by = lastP.y - badgeH / 2;

    ctx.fillStyle = "#ecfdf5";
    ctx.strokeStyle = "#a7f3d0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(bx, by, badgeW, badgeH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#047857";
    ctx.font = "bold 10px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`₹${(surplus / 1000).toFixed(0)},${String(surplus % 1000).padStart(3, "0")}`, bx + badgeW / 2, by + 13);
    ctx.fillStyle = "#059669";
    ctx.font = "9px system-ui, sans-serif";
    ctx.fillText("Surplus", bx + badgeW / 2, by + 24);
  }, [incomeData, expenseData, labels, surplus, width, height, hoveredIdx]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const padL = 44, padR = 68;
    const chartW = width - padL - padR;

    if (x >= padL - 10 && x <= padL + chartW + 10) {
      const step = chartW / (labels.length - 1);
      const idx = Math.round((x - padL) / step);
      if (idx >= 0 && idx < labels.length) {
        setHoveredIdx(idx);
      }
    } else {
      setHoveredIdx(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
    setMousePos(null);
  };

  const activeMonth = hoveredIdx !== null ? labels[hoveredIdx] : null;
  const activeIncome = hoveredIdx !== null ? incomeData[hoveredIdx] : null;
  const activeExpense = hoveredIdx !== null ? expenseData[hoveredIdx] : null;
  const activeSurplus = activeIncome && activeExpense ? activeIncome - activeExpense : null;

  // Smart Tooltip Positioning:
  // If mouse Y is in upper half (y < 120), flip tooltip BELOW the point so it never overlaps or gets cut off!
  const isUpperHalf = mousePos ? mousePos.y < 120 : false;
  const tooltipX = mousePos ? Math.min(Math.max(mousePos.x, 90), width - 90) : 0;
  const tooltipY = mousePos
    ? isUpperHalf
      ? mousePos.y + 16 // Render BELOW cursor
      : mousePos.y - 12 // Render ABOVE cursor
    : 0;

  return (
    <div
      ref={containerRef}
      className="relative select-none cursor-crosshair w-full flex justify-center pt-2"
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", maxWidth: width, height }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      {/* Floating Smart Tooltip with Auto-Flip and No Clipping */}
      {hoveredIdx !== null && activeMonth && activeIncome && activeExpense && mousePos && (
        <div
          className={`absolute z-30 pointer-events-none bg-slate-900/95 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-2xl space-y-1 backdrop-blur-md border border-slate-700/80 -translate-x-1/2 transition-transform duration-75 ${
            isUpperHalf ? "translate-y-0" : "-translate-y-full"
          }`}
          style={{
            left: tooltipX,
            top: tooltipY,
          }}
        >
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            {activeMonth} 2026 Cash Flow
          </span>
          <div className="flex items-center justify-between gap-4 text-[11px]">
            <span className="text-emerald-400 font-medium">Income:</span>
            <span className="font-extrabold text-white">₹{activeIncome.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-[11px]">
            <span className="text-slate-400 font-medium">Expense:</span>
            <span className="font-extrabold text-slate-200">₹{activeExpense.toLocaleString()}</span>
          </div>
          <div className="border-t border-slate-700/80 pt-1 flex items-center justify-between gap-4 text-[11px]">
            <span className="text-emerald-300 font-bold">Surplus:</span>
            <span className="font-extrabold text-emerald-400">₹{activeSurplus?.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
