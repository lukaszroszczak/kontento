'use client'

import { useState } from 'react'
import { TopNav } from '@/components/nav/TopNav'
import { CreatorModal } from '@/components/creator/CreatorModal'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [creatorOpen, setCreatorOpen] = useState(false)

  return (
    <>
      <TopNav onNewPost={() => setCreatorOpen(true)} />

      <div className="relative z-[1] pt-16 min-h-screen">
        {children}
      </div>

      {creatorOpen && (
        <CreatorModal onClose={() => setCreatorOpen(false)} />
      )}
    </>
  )
}
