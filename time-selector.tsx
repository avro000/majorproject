import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronUp, ChevronDown, RotateCcwIcon } from "lucide-react"

interface TimeValue {
  hours: number
  minutes: number
  seconds: number
}

interface TimeSelectorProps {
  onTimeChange: (totalSeconds: number) => void
  initialTime?: TimeValue
}

export function TimeSelector({ onTimeChange, initialTime = { hours: 0, minutes: 30, seconds: 0 } }: TimeSelectorProps) {
  const [time, setTime] = useState<TimeValue>(initialTime)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const hoursRef = useRef<HTMLInputElement>(null)
  const minutesRef = useRef<HTMLInputElement>(null)
  const secondsRef = useRef<HTMLInputElement>(null)

  const formatTime = (value: number): string => {
    return value.toString().padStart(2, "0")
  }

  const updateTime = (field: keyof TimeValue, value: number) => {
    const newTime = { ...time }

    if (field === "hours") {
      newTime.hours = Math.max(0, Math.min(23, value))
    } else {
      newTime[field] = Math.max(0, Math.min(59, value))
    }

    setTime(newTime)

    // Calculate total seconds and notify parent
    const totalSeconds = newTime.hours * 3600 + newTime.minutes * 60 + newTime.seconds
    onTimeChange(totalSeconds)
  }

  const increment = (field: keyof TimeValue) => {
    updateTime(field, time[field] + 1)
  }

  const decrement = (field: keyof TimeValue) => {
    updateTime(field, time[field] - 1)
  }

  const handleInputChange = (field: keyof TimeValue, value: string) => {
    const numValue = Number.parseInt(value) || 0
    updateTime(field, numValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent, field: keyof TimeValue) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      increment(field)
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      decrement(field)
    } else if (e.key === "Tab") {
      return
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (field === "hours") minutesRef.current?.focus()
      else if (field === "minutes") secondsRef.current?.focus()
      else secondsRef.current?.blur()
    }
  }

  const getTotalTime = (): string => {
    const totalSeconds = time.hours * 3600 + time.minutes * 60 + time.seconds
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  const presetTimes = [
    { label: "5 min", time: { hours: 0, minutes: 5, seconds: 0 } },
    { label: "10 min", time: { hours: 0, minutes: 10, seconds: 0 } },
    { label: "15 min", time: { hours: 0, minutes: 15, seconds: 0 } },
    { label: "30 min", time: { hours: 0, minutes: 30, seconds: 0 } },
    { label: "1 hour", time: { hours: 1, minutes: 0, seconds: 0 } },
  ]

  const setPresetTime = (presetTime: TimeValue) => {
    setTime(presetTime)
    const totalSeconds = presetTime.hours * 3600 + presetTime.minutes * 60 + presetTime.seconds
    onTimeChange(totalSeconds)
  }

  return (
    <div className="space-y-4">
      <div className="p-4">
        <div className="flex items-center justify-center gap-4">
          {/* Hours */}
          <div className="flex flex-col items-center space-y-5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
              onClick={() => increment("hours")}
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <div className="relative">
              <Input
                ref={hoursRef}
                type="text"
                required
                value={formatTime(time.hours)}
                onChange={(e) => handleInputChange("hours", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "hours")}
                onFocus={() => setFocusedField("hours")}
                onBlur={() => setFocusedField(null)}
                className={`w-12 h-10 text-center text-lg font-mono border-2 transition-all duration-200 ${focusedField === "hours"
                    ? "border-blue-400 ring-2 ring-blue-200 bg-white dark:bg-gray-900"
                    : "border-gray-200 bg-white/70 dark:bg-gray-900/70"
                  }`}
                maxLength={2}
              />
              <div className="absolute -bottom-5.5 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-medium">
                HH
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
              onClick={() => decrement("hours")}
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>

          <div className="text-xl font-bold text-gray-400 mt-2">:</div>

          {/* Minutes */}
          <div className="flex flex-col items-center space-y-5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
              onClick={() => increment("minutes")}
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <div className="relative">
              <Input
                ref={minutesRef}
                type="text"
                required
                value={formatTime(time.minutes)}
                onChange={(e) => handleInputChange("minutes", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "minutes")}
                onFocus={() => setFocusedField("minutes")}
                onBlur={() => setFocusedField(null)}
                className={`w-12 h-10 text-center text-lg font-mono border-2 transition-all duration-200 ${focusedField === "minutes"
                    ? "border-blue-400 ring-2 ring-blue-200 bg-white dark:bg-gray-900"
                    : "border-gray-200 bg-white/70 dark:bg-gray-900/70"
                  }`}
                maxLength={2}
              />
              <div className="absolute -bottom-5.5 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-medium">
                MM
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
              onClick={() => decrement("minutes")}
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>

          <div className="text-xl font-bold text-gray-400 mt-2">:</div>

          {/* Seconds */}
          <div className="flex flex-col items-center space-y-5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
              onClick={() => increment("seconds")}
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <div className="relative">
              <Input
                ref={secondsRef}
                type="text"
                required
                value={formatTime(time.seconds)}
                onChange={(e) => handleInputChange("seconds", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "seconds")}
                onFocus={() => setFocusedField("seconds")}
                onBlur={() => setFocusedField(null)}
                className={`w-12 h-10 text-center text-lg font-mono border-2 transition-all duration-200 ${focusedField === "seconds"
                    ? "border-blue-400 ring-2 ring-blue-200 bg-white dark:bg-gray-900"
                    : "border-gray-200 bg-white/70 dark:bg-gray-900/70"
                  }`}
                maxLength={2}
              />
              <div className="absolute -bottom-5.5 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-medium">
                SS
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
              onClick={() => decrement("seconds")}
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 bg-white/60 dark:bg-gray-800/60 rounded-lg py-1 px-3 inline-block">
            {getTotalTime()}
          </div>
        </div>
      </div>

      {/* Preset Times */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Presets</div>
        <div className="flex flex-wrap gap-2">
          {presetTimes.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPresetTime(preset.time)}
              className="text-xs hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <div>
          <Button
            type="button"
            variant="destructive"
            className="flex-1"
            onClick={() => {
              setTime({ hours: 0, minutes: 0, seconds: 0 })
              onTimeChange(0)
            }}
          >
            <RotateCcwIcon />
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
