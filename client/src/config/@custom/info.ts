// @custom — Brix product config
import type { info as SystemInfo } from '../@system/info'

export const customInfo: Partial<typeof SystemInfo> = {
  name: 'Brix',
  tagline: 'Product in. Store out.',
  url: import.meta.env.VITE_APP_URL ?? 'https://getbrix.com',
  supportEmail: 'support@getbrix.com',
}
