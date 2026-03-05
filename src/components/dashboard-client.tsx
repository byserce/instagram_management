"use client"

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import type { BotStatus, Post } from '@/lib/types'
import { Play, Loader2, Check, X, FileText, Image as ImageIcon, AlertTriangle } from 'lucide-react'
import { PlaceHolderImages } from '@/lib/placeholder-images'

// Mock data and functions to simulate the API
const MOCK_POST: Post = {
  text: '🚀 Exploring the future of AI in 2024! From generative models to ethical considerations, this year is proving to be a landmark for artificial intelligence. What are your thoughts? #AI #TechTrends #Innovation2024',
  imageUrl: PlaceHolderImages.find(p => p.id === 'post-preview')?.imageUrl || 'https://picsum.photos/seed/trendpilot/1080/1080',
}

const getStatusColor = (status: BotStatus) => {
  switch (status) {
    case 'RUNNING':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'IDLE':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    case 'WAITING_TREND_APPROVAL':
    case 'WAITING_POST_APPROVAL':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'ERROR':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    default:
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  }
}

export default function DashboardClient() {
  const [status, setStatus] = useState<BotStatus>('IDLE')
  const [logs, setLogs] = useState<string[]>([`[${new Date().toLocaleTimeString()}] Dashboard initialized.`])
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState({
    start: false,
    approveTrend: false,
    approvePost: false,
    rejectPost: false,
  })
  const { toast } = useToast()
  const logsEndRef = useRef<HTMLDivElement>(null)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Simulate status and log polling
  useEffect(() => {
    let statusInterval: NodeJS.Timeout
    if (status === 'RUNNING') {
      statusInterval = setInterval(() => {
        addLog('Searching for new trends...')
      }, 5000)
    }
    return () => clearInterval(statusInterval)
  }, [status])

  const handleStartBot = () => {
    setIsLoading(prev => ({ ...prev, start: true }))
    setStatus('STARTING')
    addLog('Bot start command issued...')
    toast({ title: '🚀 Bot Starting' })

    setTimeout(() => {
      setStatus('RUNNING')
      setIsLoading(prev => ({ ...prev, start: false }))
      addLog('Bot is now running and monitoring for trends.')
      toast({ title: '✅ Bot Started Successfully' })

      setTimeout(() => {
        setStatus('WAITING_TREND_APPROVAL')
        addLog("🔥 New trend found: 'AI in 2024'. Waiting for approval.")
      }, 7000)
    }, 2000)
  }

  const handleApproveTrend = () => {
    setIsLoading(prev => ({ ...prev, approveTrend: true }))
    setStatus('APPROVING_TREND')
    addLog('Trend approved. Generating post content...')
    toast({ title: '👍 Trend Approved' })

    setTimeout(() => {
      setStatus('GENERATING_POST')
      setTimeout(() => {
        setPost(MOCK_POST)
        setStatus('WAITING_POST_APPROVAL')
        addLog('📝 Post generated. Waiting for final post approval.')
        setIsLoading(prev => ({ ...prev, approveTrend: false }))
      }, 3000)
    }, 1500)
  }

  const handleApprovePost = () => {
    setIsLoading(prev => ({ ...prev, approvePost: true }))
    setStatus('APPROVING_POST')
    addLog('Post approved. Publishing to social channels...')
    toast({ title: '🎉 Post Approved & Publishing' })

    setTimeout(() => {
      setPost(null)
      setStatus('RUNNING')
      setIsLoading(prev => ({ ...prev, approvePost: false }))
      addLog('Post published successfully. Returning to trend monitoring.')
      toast({ title: '✅ Post Published' })
    }, 2500)
  }

  const handleRejectPost = () => {
    setIsLoading(prev => ({ ...prev, rejectPost: true }))
    setStatus('REJECTING_POST')
    addLog('Post rejected by user. Discarding post and returning to monitoring.')
    toast({ title: '🗑️ Post Rejected', variant: 'destructive' })

    setTimeout(() => {
      setPost(null)
      setStatus('RUNNING')
      setIsLoading(prev => ({ ...prev, rejectPost: false }))
      addLog('Resuming trend monitoring.')
    }, 2000)
  }

  return (
    <div className="grid auto-rows-max gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle>Bot Control</CardTitle>
          <CardDescription>Manage and monitor the automation bot's status.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-2">
            <span>Status:</span>
            <Badge variant="outline" className={`font-mono ${getStatusColor(status)}`}>{status}</Badge>
          </div>
          <Button onClick={handleStartBot} disabled={status !== 'IDLE' || isLoading.start}>
            {isLoading.start ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Play />
            )}
            Start Bot
          </Button>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Live Terminal</CardTitle>
          <CardDescription>Real-time logs from the automation bot.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 w-full rounded-md bg-muted/50 p-4 font-code text-sm">
            {logs.map((log, index) => (
              <p key={index} className="text-foreground/80">{log}</p>
            ))}
            <div ref={logsEndRef} />
          </ScrollArea>
        </CardContent>
      </Card>

      {status === 'WAITING_TREND_APPROVAL' && (
        <Card className="lg:col-span-full">
          <CardHeader>
            <CardTitle className="text-yellow-400">Trend Approval Required</CardTitle>
            <CardDescription>The bot has identified a new trend and requires your approval to proceed.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">Trend: "AI in 2024"</p>
          </CardContent>
          <CardFooter className="gap-4">
            <Button onClick={handleApproveTrend} disabled={isLoading.approveTrend}>
              {isLoading.approveTrend ? <Loader2 className="animate-spin" /> : <Check />}
              Approve Trend
            </Button>
            <Button variant="destructive" onClick={() => {
              setStatus('IDLE');
              addLog('Trend rejected by user.');
              toast({ title: 'Trend Rejected', variant: 'destructive' })
            }}>
              <X />
              Reject
            </Button>
          </CardFooter>
        </Card>
      )}

      {status === 'WAITING_POST_APPROVAL' && post && (
        <Card className="lg:col-span-full">
          <CardHeader>
            <CardTitle className="text-yellow-400">Post Preview & Approval</CardTitle>
            <CardDescription>Review the generated post before it's published.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-semibold"><ImageIcon /> Image Preview</h3>
              <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-lg border">
                <Image src={post.imageUrl} alt="Post Preview" fill className="object-cover" data-ai-hint="social media post" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-semibold"><FileText /> Post Text</h3>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="whitespace-pre-wrap text-sm">{post.text}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="gap-4">
            <Button onClick={handleApprovePost} disabled={isLoading.approvePost || isLoading.rejectPost} className="bg-green-600 hover:bg-green-700">
              {isLoading.approvePost ? <Loader2 className="animate-spin" /> : <Check />}
              Approve & Publish Post
            </Button>
            <Button variant="destructive" onClick={handleRejectPost} disabled={isLoading.approvePost || isLoading.rejectPost}>
              {isLoading.rejectPost ? <Loader2 className="animate-spin" /> : <X />}
              Reject Post
            </Button>
          </CardFooter>
        </Card>
      )}

      {status === 'ERROR' && (
        <Card className="lg:col-span-full border-red-500/50 bg-red-900/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400"><AlertTriangle /> Error State</CardTitle>
                <CardDescription className="text-red-400/80">The bot has encountered an error. Check the logs for more details.</CardDescription>
            </CardHeader>
            <CardFooter>
                <Button onClick={() => setStatus('IDLE')}>
                    Reset Bot
                </Button>
            </CardFooter>
        </Card>
      )}
    </div>
  )
}
