import { NextResponse } from 'next/server'
import sharp from 'sharp'

type LogoMode = 'watermark' | 'frame' | 'corner'

/**
 * Composite a logo onto a base image using Sharp.
 * Accepts JSON: { baseImage: base64, logoImage: base64, mode: LogoMode }
 * Returns: { resultImage: base64, mimeType }
 */
export async function POST(req: Request) {
  try {
    const { baseImage, logoImage, mode = 'corner' } = await req.json() as {
      baseImage: string
      logoImage: string
      mode: LogoMode
    }

    if (!baseImage || !logoImage) {
      return NextResponse.json({ error: 'baseImage and logoImage are required' }, { status: 400 })
    }

    const baseBuffer = Buffer.from(baseImage, 'base64')
    const logoBuffer = Buffer.from(logoImage, 'base64')

    const baseMeta = await sharp(baseBuffer).metadata()
    const baseW = baseMeta.width ?? 1024
    const baseH = baseMeta.height ?? 1024

    let resultBuffer: Buffer

    switch (mode) {
      case 'watermark': {
        // Logo at 30% width, centered, 50% opacity
        const logoW = Math.round(baseW * 0.3)
        const resizedLogo = await sharp(logoBuffer)
          .resize(logoW, undefined, { fit: 'inside' })
          .composite([{
            input: Buffer.from([0, 0, 0, 128]),
            raw: { width: 1, height: 1, channels: 4 },
            tile: true,
            blend: 'dest-in',
          }])
          .png()
          .toBuffer()

        const logoMeta = await sharp(resizedLogo).metadata()
        const logoH = logoMeta.height ?? logoW

        resultBuffer = await sharp(baseBuffer)
          .composite([{
            input: resizedLogo,
            left: Math.round((baseW - logoW) / 2),
            top: Math.round((baseH - logoH) / 2),
            blend: 'over',
          }])
          .png()
          .toBuffer()
        break
      }

      case 'frame': {
        // Add a border frame with the logo in bottom-right
        const framePx = Math.round(baseW * 0.04)
        const logoW = Math.round(baseW * 0.15)
        const resizedLogo = await sharp(logoBuffer)
          .resize(logoW, undefined, { fit: 'inside' })
          .png()
          .toBuffer()
        const logoMeta = await sharp(resizedLogo).metadata()
        const logoH = logoMeta.height ?? logoW

        // Extend canvas with a white/accent border
        const withFrame = await sharp(baseBuffer)
          .extend({
            top: framePx,
            bottom: framePx + logoH + framePx,
            left: framePx,
            right: framePx,
            background: { r: 200, g: 240, b: 96, alpha: 1 }, // accent colour
          })
          .composite([{
            input: resizedLogo,
            left: baseW - logoW,
            top: baseH + framePx + framePx,
            blend: 'over',
          }])
          .png()
          .toBuffer()

        resultBuffer = withFrame
        break
      }

      case 'corner':
      default: {
        // Logo at 18% width, bottom-right corner with small margin
        const logoW = Math.round(baseW * 0.18)
        const margin = Math.round(baseW * 0.025)
        const resizedLogo = await sharp(logoBuffer)
          .resize(logoW, undefined, { fit: 'inside' })
          .png()
          .toBuffer()
        const logoMeta = await sharp(resizedLogo).metadata()
        const logoH = logoMeta.height ?? logoW

        resultBuffer = await sharp(baseBuffer)
          .composite([{
            input: resizedLogo,
            left: baseW - logoW - margin,
            top: baseH - logoH - margin,
            blend: 'over',
          }])
          .png()
          .toBuffer()
        break
      }
    }

    const resultBase64 = resultBuffer.toString('base64')
    return NextResponse.json({ resultImage: resultBase64, mimeType: 'image/png' })
  } catch (error: unknown) {
    console.error('Image compose error:', error)
    const message = error instanceof Error ? error.message : 'Failed to compose image'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
