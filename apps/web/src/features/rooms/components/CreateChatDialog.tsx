'use client'

import { useState } from 'react'
import { Plus, Users, User as UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { useUsers } from '@/features/auth/hooks/useUsers'
import { usePresenceStore } from '@/store/usePresenceStore'
import { roomService } from '../api/roomService'
import { useQueryClient } from '@tanstack/react-query'

export function CreateChatDialog() {
  const [open, setOpen] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const { data: users = [], isLoading } = useUsers()
  const onlineUsers = usePresenceStore((s) => s.onlineUsers)
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleCreateDM = async (targetUserId: string) => {
    try {
      const room = await roomService.createDM(targetUserId)
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      setOpen(false)
      router.push(`/chat/${room.id}`)
    } catch (error) {
      console.error('Failed to create DM', error)
    }
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.size === 0) return
    try {
      const room = await roomService.createRoom(
        groupName.trim(),
        'group',
        Array.from(selectedUsers)
      )
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      setOpen(false)
      setGroupName('')
      setSelectedUsers(new Set())
      router.push(`/chat/${room.id}`)
    } catch (error) {
      console.error('Failed to create group', error)
    }
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) newSet.delete(userId)
      else newSet.add(userId)
      return newSet
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="direct" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct">Direct Message</TabsTrigger>
            <TabsTrigger value="group">Group Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="mt-4">
            <ScrollArea className="h-72 w-full pr-4">
              {isLoading ? (
                <div className="flex justify-center p-4">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="flex justify-center p-4 text-zinc-500">No users found</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {users.map((user) => {
                    const isOnline = onlineUsers.has(user.id)
                    return (
                      <button
                        key={user.id}
                        onClick={() => handleCreateDM(user.id)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors w-full text-left"
                      >
                        <div className="relative">
                          <Avatar>
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                              {user.displayName?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-950" />
                          )}
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="font-medium text-sm">{user.displayName}</span>
                          <span className="text-xs text-zinc-500">{user.email}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="group" className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Group Name</label>
              <Input
                placeholder="Awesome Group"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Members</label>
              <ScrollArea className="h-40 w-full rounded-md border p-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selectedUsers.has(user.id)}
                      onCheckedChange={() => toggleUserSelection(user.id)}
                    />
                    <label
                      htmlFor={`user-${user.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 flex items-center gap-2"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {user.displayName?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {user.displayName}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </div>

            <Button 
              className="w-full" 
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedUsers.size === 0}
            >
              <Users className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
