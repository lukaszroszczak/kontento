import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// PATCH /api/users/[id] — update user (admin or self)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const isSelf = session.user.id === id
  const isAdmin = session.user.role === 'admin'

  if (!isSelf && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, email, password, currentPassword, newPassword, role } = await req.json()

  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = name
  if (email !== undefined && isAdmin) data.email = email
  if (role !== undefined && isAdmin) data.role = role

  if (newPassword && isSelf) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password required' }, { status: 400 })
    }
    const user = await db.user.findUnique({ where: { id } })
    if (!user?.password) {
      return NextResponse.json({ error: 'No password set' }, { status: 400 })
    }
    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Nieprawidłowe aktualne hasło.' }, { status: 400 })
    }
    data.password = await bcrypt.hash(newPassword, 12)
  }

  if (password && isAdmin && !isSelf) {
    data.password = await bcrypt.hash(password, 12)
  }

  const user = await db.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })
  return NextResponse.json({ user })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  if (id === session.user.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  await db.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
