import { AdStage } from '@/components/ad/AdStage'
import type { AdFormat } from '@/components/ad/AdScene'

/**
 * Recording canvas for the social ad. Not linked from anywhere on the site.
 *
 * ?clean=1   hides the control bar, for a clean screen capture
 * ?scale=1   renders the canvas at its true pixel size instead of fitting the window
 * ?sound=1   opens on a start button, since browsers need a gesture before audio
 * ?format=   "16:9" (default) or "9:16"
 */
export default async function AdPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const format: AdFormat = params.format === '9:16' ? '9:16' : '16:9'

  return (
    <AdStage
      clean={params.clean === '1'}
      native={params.scale === '1'}
      sound={params.sound === '1'}
      initialFormat={format}
    />
  )
}
