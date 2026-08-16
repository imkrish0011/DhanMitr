import React from "react";
import { Card, CardContent } from "./ui/card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  icon: React.ReactNode;
  variant?: "default" | "emerald" | "blue" | "purple";
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  icon,
  variant = "default",
}: MetricCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
            {icon}
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</h3>
          
          <div className="mt-2 flex items-center gap-2 text-xs">
            {change && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold rounded-full px-2 py-0.5",
                  change.isNeutral
                    ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    : change.isPositive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                )}
              >
                {change.isNeutral ? (
                  <Minus className="h-3 w-3" />
                ) : change.isPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {change.value}
              </span>
            )}
            {subtitle && <span className="text-slate-500 dark:text-slate-400">{subtitle}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
