"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_TRANSACTIONS } from "@/lib/mockData";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Transaction } from "../../../shared/types/typescript";
import { Plus, Search, Filter, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filtered = transactions.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-slate-500">Track and categorize your incomes, expenses, and investments.</p>
        </div>
        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Add Transaction
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["all", "income", "expense", "investment"].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Title & Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Account</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${tx.type === "income" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950" : "bg-slate-100 text-slate-600 dark:bg-slate-800"}`}>
                        {tx.type === "income" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      {tx.title}
                    </td>
                    <td className="px-6 py-4 capitalize text-slate-600 dark:text-slate-400">{tx.category}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(tx.date)}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{tx.account_name || "Primary"}</td>
                    <td className={`px-6 py-4 text-right font-bold ${tx.type === "income" ? "text-emerald-600" : "text-slate-900 dark:text-white"}`}>
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
