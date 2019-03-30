import { createContext } from 'react'

import { SendRequestFunction } from './sendRequestFunction'

export const JgqlContext = createContext<SendRequestFunction>(() => {
  throw new Error('Invalid jgql client')
})
JgqlContext.displayName = 'JgqlContext'
