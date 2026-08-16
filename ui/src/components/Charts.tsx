"use client";

import React, { useRef, useEffect } from "react";

interface DonutChartProps {
  segments: { label: string; value: number; color: string }[];
  total: number;
  size?: number;
}

export function DonutChart({ segments, total, size = 200 }: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 4;
    const innerR = outerR * 0.62;
    let startAngle = -Math.PI / 2;

    segments.forEach((seg) => {
      const sliceAngle = (seg.value / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, endAngle);
      ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();

      startAngle = endAngle;
    });

    // Center white circle
    ctx.beginPath();
    ctx.arc(cx, cy, innerR - 1, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }, [segments, total, size]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl sm:text-2xl font-extrabold text-slate-900">₹{total.toLocaleString()}</span>
        <span className="text-[10px] text-slate-400 font-medium">Total Spent</span>
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

export function CashFlowLineChart({ incomeData, expenseData, labels, surplus, width = 400, height = 200 }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const padL = 42, padR = 56, padT = 16, padB = 28;
    const chartW = width - padL - padR;
    const chartH = height - padT - padB;

    const allVals = [...incomeData, ...expenseData];
    const maxVal = Math.max(...allVals) * 1.15;
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
      ctx.fillText(label, x, height - 8);
    });

    const drawLine = (data: number[], color: string, dashed: boolean, fillGrad: boolean) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      if (dashed) ctx.setLineDash([6, 4]);
      else ctx.setLineDash([]);

      const points: { x: number; y: number }[] = [];
      data.forEach((val, i) => {
        const x = padL + (i / (data.length - 1)) * chartW;
        const y = padT + chartH - (val / maxVal) * chartH;
        points.push({ x, y });
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Fill area under curve
      if (fillGrad && points.length > 0) {
        const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
        grad.addColorStop(0, "rgba(16, 185, 129, 0.15)");
        grad.addColorStop(1, "rgba(16, 185, 129, 0.01)");
        ctx.beginPath();
        ctx.moveTo(points[0].x, padT + chartH);
        points.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, padT + chartH);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // End dot
      if (points.length > 0) {
        const last = points[points.length - 1];
        ctx.beginPath();
        ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(last.x, last.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }

      return points;
    };

    drawLine(incomeData, "#10b981", false, true);
    drawLine(expenseData, "#94a3b8", true, false);

    // Surplus label at top right
    const lastIncome = incomeData[incomeData.length - 1];
    const lastX = padL + chartW;
    const lastY = padT + chartH - (lastIncome / maxVal) * chartH;

    ctx.fillStyle = "#ecfdf5";
    const labelW = 52, labelH = 28, labelPad = 8;
    const lx = lastX + labelPad;
    const ly = lastY - labelH / 2;

    // Rounded rect
    ctx.beginPath();
    const rr = 6;
    ctx.moveTo(lx + rr, ly);
    ctx.lineTo(lx + labelW - rr, ly);
    ctx.quadraticCurveTo(lx + labelW, ly, lx + labelW, ly + rr);
    ctx.lineTo(lx + labelW, ly + labelH - rr);
    ctx.quadraticCurveTo(lx + labelW, ly + labelH, lx + labelW - rr, ly + labelH);
    ctx.lineTo(lx + rr, ly + labelH);
    ctx.quadraticCurveTo(lx, ly + labelH, lx, ly + labelH - rr);
    ctx.lineTo(lx, ly + rr);
    ctx.quadraticCurveTo(lx, ly, lx + rr, ly);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#059669";
    ctx.font = "bold 10px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`₹${(surplus / 1000).toFixed(0)},${String(surplus % 1000).padStart(3, "0")}`, lx + labelW / 2, ly + 12);
    ctx.fillStyle = "#10b981";
    ctx.font = "9px system-ui, sans-serif";
    ctx.fillText("Surplus", lx + labelW / 2, ly + 23);

  }, [incomeData, expenseData, labels, surplus, width, height]);

  return <canvas ref={canvasRef} style={{ width, height }} className="w-full max-w-full" />;
}
