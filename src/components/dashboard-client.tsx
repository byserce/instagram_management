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

const API_BASE_URL = 'http://127.0.0.1:8000';

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
  const [logs, setLogs] = useState<string[]>([])
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState({
    start: false,
    approveTrend: false,
    rejectTrend: false,
    approvePost: false,
    rejectPost: false,
  })
  const { toast } = useToast()
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Poll for status and logs from the backend
  useEffect(() => {
    const fetchStatusAndLogs = async () => {
      try {
        // Fetch Status
        const statusRes = await fetch(`${API_BASE_URL}/status`);
        if (statusRes.ok) {
          const statusData: { status: BotStatus } = await statusRes.json();
          setStatus(statusData.status || 'UNKNOWN');
        } else {
          // Don't throw, just log, to prevent UI freeze on transient network errors
          console.error('Failed to fetch status');
        }

        // Fetch Logs
        const logsRes = await fetch(`${API_BASE_URL}/logs`);
        if (logsRes.ok) {
          const logsData: string[] = await logsRes.json();
          setLogs(logsData || []);
        } else {
          console.error('Failed to fetch logs');
        }
      } catch (error) {
        console.error("Polling error:", error);
        setStatus('ERROR'); // If we can't poll at all, server is likely down
      }
    };

    const intervalId = setInterval(fetchStatusAndLogs, 2000);
    fetchStatusAndLogs(); // Initial fetch

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  // Fetch post content when the bot is waiting for post approval
  useEffect(() => {
    const fetchPost = async () => {
      if (status === 'WAITING_POST_APPROVAL' && !post) {
        try {
          const response = await fetch(`${API_BASE_URL}/current-post`);
          if (!response.ok) {
            throw new Error('Failed to fetch post preview.');
          }
          const data: Post = await response.json();
          setPost(data);
          toast({ title: '📝 Post Ready for Review' });
        } catch (error) {
          console.error(error);
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          toast({ title: 'API Error', description: errorMessage, variant: 'destructive' });
          setStatus('ERROR');
        }
      }
    };
    fetchPost();
  }, [status, post, toast]);

  const handleStartBot = async () => {
    setIsLoading(prev => ({ ...prev, start: true }))
    toast({ title: '🚀 Sending start command...' })
    try {
      const response = await fetch(`${API_BASE_URL}/start`, { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to start bot' }));
        throw new Error(errorData.detail);
      }
      toast({ title: '✅ Bot Start Command Sent' });
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({ title: 'API Error', description: errorMessage, variant: 'destructive' });
      setStatus('ERROR');
    } finally {
      setIsLoading(prev => ({ ...prev, start: false }))
    }
  }

  const handleApproveTrend = async () => {
    setIsLoading(prev => ({ ...prev, approveTrend: true }))
    toast({ title: '👍 Approving Trend...' })
    try {
      const response = await fetch(`${API_BASE_URL}/approve-trend`, { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to approve trend' }));
        throw new Error(errorData.detail);
      }
      toast({ title: '✅ Trend Approved' });
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast({ title: 'API Error', description: errorMessage, variant: 'destructive' });
        setStatus('ERROR');
    } finally {
      setIsLoading(prev => ({ ...prev, approveTrend: false }))
    }
  }

  const handleRejectTrend = async () => {
    setIsLoading(prev => ({ ...prev, rejectTrend: true }));
    toast({ title: '👎 Rejecting Trend...', variant: 'destructive' });
    try {
      // NOTE: Assumed endpoint
      const response = await fetch(`${API_BASE_URL}/reject-trend`, { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to reject trend' }));
        throw new Error(errorData.detail);
      }
      toast({ title: '🗑️ Trend Rejected' });
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast({ title: 'API Error', description: errorMessage, variant: 'destructive' });
        setStatus('ERROR');
    } finally {
      setIsLoading(prev => ({ ...prev, rejectTrend: false }));
    }
  };

  const handleApprovePost = async () => {
    setIsLoading(prev => ({ ...prev, approvePost: true }))
    toast({ title: '🎉 Publishing Post...' })
    try {
      const response = await fetch(`${API_BASE_URL}/approve-post`, { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to approve post' }));
        throw new Error(errorData.detail);
      }
      setPost(null)
      toast({ title: '✅ Post Published!' })
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast({ title: 'API Error', description: errorMessage, variant: 'destructive' });
        setStatus('ERROR');
    } finally {
      setIsLoading(prev => ({ ...prev, approvePost: false }))
    }
  }

  const handleRejectPost = async () => {
    setIsLoading(prev => ({ ...prev, rejectPost: true }))
    toast({ title: '🗑️ Rejecting Post...', variant: 'destructive' })
    try {
      // NOTE: Assumed endpoint
      const response = await fetch(`${API_BASE_URL}/reject-post`, { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to reject post' }));
        throw new Error(errorData.detail);
      }
      setPost(null)
      toast({ title: '🗑️ Post Rejected' })
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast({ title: 'API Error', description: errorMessage, variant: 'destructive' });
        setStatus('ERROR');
    } finally {
      setIsLoading(prev => ({ ...prev, rejectPost: false }))
    }
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
            <Button onClick={handleApproveTrend} disabled={isLoading.approveTrend || isLoading.rejectTrend}>
              {isLoading.approveTrend ? <Loader2 className="animate-spin" /> : <Check />}
              Approve Trend
            </Button>
            <Button variant="destructive" onClick={handleRejectTrend} disabled={isLoading.approveTrend || isLoading.rejectTrend}>
              {isLoading.rejectTrend ? <Loader2 className="animate-spin" /> : <X />}
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
                <Image src={post.imageUrl} alt="Post Preview" fill className="object-cover" />
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
                <CardDescription className="text-red-400/80">The bot has encountered an error or the backend is unreachable. Check the logs for more details.</CardDescription>
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
