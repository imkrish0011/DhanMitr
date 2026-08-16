"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import { Moon, Sun, Laptop, Save, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [currency, setCurrency] = useState("INR");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500">Manage your preferences, account settings, and application themes.</p>
      </div>

      <div className="space-y-6">
        {/* Appearance / Theme */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance & Theme</CardTitle>
            <CardDescription>Customize the look and feel of DhanMITR.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
              className="gap-2"
            >
              <Sun className="h-4 w-4" /> Light
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              className="gap-2"
            >
              <Moon className="h-4 w-4" /> Dark
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              onClick={() => setTheme("system")}
              className="gap-2"
            >
              <Laptop className="h-4 w-4" /> System
            </Button>
          </CardContent>
        </Card>

        {/* Currency & Locale */}
        <Card>
          <CardHeader>
            <CardTitle>Currency & Regional Settings</CardTitle>
            <CardDescription>Select default currency for balance calculations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Base Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full mt-1 h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm max-w-xs"
              >
                <option value="INR">INR (₹) — Indian Rupee</option>
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Profile</CardTitle>
            <CardDescription>Signed in as {user?.email || "Guest"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{user?.name || "Demo User"}</p>
                <p className="text-xs text-slate-500">{user?.email || "guest@dhanmitr.ai"}</p>
              </div>
              <Button variant="destructive" size="sm" onClick={signOut} className="gap-1.5">
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
