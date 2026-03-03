import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

/** POST /api/register — public endpoint to create a new user account */
export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json()

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'E-mail i hasło są wymagane' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Hasło musi mieć co najmniej 6 znaków' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (existing) {
      return NextResponse.json({ error: 'Konto z tym adresem e-mail już istnieje' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)
    await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
        password: hashed,
        role: 'user',
      },
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error: unknown) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Błąd tworzenia konta' }, { status: 500 })
  }
}
