"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, SortAsc, SortDesc, Clock, TrendingUp, Star, DollarSign } from "lucide-react"
import Link from "next/link"

interface DealFiltersProps {
  currentCategory?: string
  currentSort?: string
  onFilterChange?: (filters: any) => void
}

export function DealFilters({ currentCategory, currentSort, onFilterChange }: DealFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  
  const quickFilters = [
    { id: "high-discount", label: "50%+ Off", value: "discount_gte_50" },
    { id: "new-launch", label: "Launched This Week", value: "new_launch" },
    { id: "ending-soon", label: "Ending Soon", value: "ending_soon" },
    { id: "lifetime", label: "Lifetime Deals", value: "lifetime_deal" },
    { id: "popular", label: "Most Popular", value: "popular" },
    { id: "verified", label: "Verified Deals", value: "verified" }
  ]
  
  const sortOptions = [
    { label: "Newest Launches", value: "newest" },
    { label: "Best Discounts", value: "discount_desc" },
    { label: "Ending Soon", value: "ending_soon" },
    { label: "Most Popular", value: "popular" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" }
  ]
  
  const dealTypes = [
    { label: "Launch Special", value: "launch_special" },
    { label: "Lifetime Deal", value: "lifetime" },
    { label: "Monthly Discount", value: "monthly" },
    { label: "Bundle Offer", value: "bundle" }
  ]
  
  const toggleFilter = (filterId: string) => {
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(f => f !== filterId)
      : [...activeFilters, filterId]
    
    setActiveFilters(newFilters)
    onFilterChange?.(newFilters)
  }
  
  return (
    <div className="bg-white rounded-2xl border-2 border-border p-6 mb-8 shadow-professional">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
          <Filter className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Deal Discovery Filters</h3>
          <p className="text-sm text-foreground/70">Find exactly what you're looking for</p>
        </div>
      </div>
      
      {/* Sort Options */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-foreground mb-2">
          Sort by
        </label>
        <Select defaultValue={currentSort || "newest"}>
          <SelectTrigger className="w-full md:w-64 border-2 border-border rounded-xl">
            <SelectValue placeholder="Choose sorting..." />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Quick Filters */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-foreground mb-3">
          Quick Filters
        </label>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map(filter => (
            <Button
              key={filter.id}
              variant={activeFilters.includes(filter.id) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter(filter.id)}
              className={`rounded-full font-medium px-4 py-2 transition-all duration-200 ${activeFilters.includes(filter.id) ? "" : ""}`}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Deal Types */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-foreground mb-3">
          Deal Types
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {dealTypes.map(type => (
            <div
              key={type.value}
              className={`bg-muted text-foreground rounded-xl p-3 text-center cursor-pointer transition-all duration-200 hover:scale-105 border-2 border-border`}
            >
              <div className="font-semibold text-sm">
                {type.label}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="border-t-2 border-border pt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-foreground">Active Filters:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveFilters([])}
              className="text-foreground hover:bg-muted text-xs px-2 py-1"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(filterId => {
              const filter = quickFilters.find(f => f.id === filterId)
              return filter ? (
                <Badge
                  key={filterId}
                  variant="secondary"
                  className="bg-muted text-foreground px-3 py-1 rounded-full cursor-pointer border border-border"
                  onClick={() => toggleFilter(filterId)}
                >
                  {filter.label} ×
                </Badge>
              ) : null
            })}
          </div>
        </div>
      )}
      
      {/* Stats Display */}
      <div className="mt-6 pt-4 border-t-2 border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-muted rounded-xl p-3 border border-border">
            <div className="text-lg font-bold text-foreground">72%</div>
            <div className="text-xs text-foreground/70">Avg. Discount</div>
          </div>
          <div className="bg-muted rounded-xl p-3 border border-border">
            <div className="text-lg font-bold text-foreground">{Math.floor(Math.random() * 50) + 20}</div>
            <div className="text-xs text-foreground/70">New This Week</div>
          </div>
          <div className="bg-muted rounded-xl p-3 border border-border">
            <div className="text-lg font-bold text-foreground">{Math.floor(Math.random() * 15) + 5}</div>
            <div className="text-xs text-foreground/70">Ending Today</div>
          </div>
          <div className="bg-muted rounded-xl p-3 border border-border">
            <div className="text-lg font-bold text-foreground">4.8</div>
            <div className="text-xs text-foreground/70">Avg. Rating</div>
          </div>
        </div>
      </div>
    </div>
  )
}
