import { createContext } from 'react'

import { SendRequestFunction } from './sendRequestFunction'

export const HgqlContext = createContext<SendRequestFunction>(() => {
  throw new Error('Invalid hgql client')
})
HgqlContext.displayName = 'HgqlContext'
