// @custom — product-specific config override
// Override any values from @system/info.ts here.
// This file is NEVER overwritten during template sync.

import type { info as SystemInfo } from '../@system/info'

export const customInfo: Partial<typeof SystemInfo> = {
  // name: 'MyProduct',
  // tagline: 'The best product for your workflow',
  // url: 'https://myproduct.com',
  // supportEmail: 'support@myproduct.com',
}
