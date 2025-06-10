"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Zap, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function PromptOptimizer() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const [autoClear, setAutoClear] = useState(true)
  const [originalInputLength, setOriginalInputLength] = useState(0)

  const optimizePrompt = async () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to optimize.",
        variant: "destructive",
      })
      return
    }

    const currentInputLength = input.length
    setIsLoading(true)
    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      })

      if (!response.ok) {
        throw new Error("Failed to optimize prompt")
      }

      const data = await response.json()
      setOutput(data.optimizedPrompt)
      setOriginalInputLength(currentInputLength)
      if (autoClear) {
        setInput("")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to optimize prompt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Optimized prompt copied to clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      optimizePrompt()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Prompt Optimizer
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Reduce token usage while maintaining prompt effectiveness
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Input Section */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Original Prompt</CardTitle>
              <CardDescription>Enter your prompt to optimize for fewer tokens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your AI prompt here... (Cmd/Ctrl + Enter to optimize)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[300px] resize-none border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500">{input.length} characters</span>
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-clear" checked={autoClear} onCheckedChange={setAutoClear} />
                    <Label htmlFor="auto-clear" className="text-sm text-slate-600 dark:text-slate-400">
                      Auto clear
                    </Label>
                  </div>
                </div>
                <Button
                  onClick={optimizePrompt}
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Optimize
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Optimized Prompt</CardTitle>
              <CardDescription>Token-efficient version of your prompt</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  value={output}
                  readOnly
                  placeholder="Optimized prompt will appear here..."
                  className="min-h-[300px] resize-none border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
                />
                {output && (
                  <Button size="sm" variant="outline" onClick={copyToClipboard} className="absolute top-2 right-2">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{output.length} characters</span>
                {output && originalInputLength > 0 && (
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {(((originalInputLength - output.length) / originalInputLength) * 100).toFixed(1)}% reduction
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
