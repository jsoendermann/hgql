import * as React from 'react'

import { JgqlContext } from './context'
import { JgqlError } from './sendRequestFunction'

export { gql } from './gql'
export {
  SendRequestFunction,
  createSendRequestFunction,
  JgqlError,
} from './sendRequestFunction'

const { useState } = React

export interface InitialState {
  state: 'INITIAL'
}
export interface LoadingState {
  state: 'LOADING'
}
export interface SuccessState<D extends object> {
  state: 'SUCCESS'
  response: D
}
export interface ErrorState {
  state: 'ERROR'
  error: JgqlError
}
export type JgqlData<D extends object> =
  | InitialState
  | LoadingState
  | SuccessState<D>
  | ErrorState

export type ExecuteQueryFunc<V> = (vars: V | undefined) => void

export const useManualQuery = <D extends object, V extends object = never>(
  queryString: string,
  variables?: V,
): [JgqlData<D>, ExecuteQueryFunc<V>] => {
  const isMounted = React.useRef(true)
  React.useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const sendRequest = React.useContext(JgqlContext)

  const [queryState, setQueryState] = useState<JgqlData<D>>({
    state: 'INITIAL',
  })

  const executeQuery = (vars?: V): void => {
    if (!isMounted.current) {
      return
    }

    setQueryState({ state: 'LOADING' })

    sendRequest<D, V>(queryString, vars || variables || ({} as V))
      .then(data => {
        if (!isMounted.current) {
          return
        }

        setQueryState({ state: 'SUCCESS', response: data })
      })
      .catch(error => {
        if (!isMounted.current) {
          return
        }

        setQueryState({ state: 'ERROR', error })
      })
  }

  return [queryState, executeQuery]
}

export const useQuery = <D extends object, V extends object = never>(
  queryString: string,
  variables?: V,
): [JgqlData<D>, ExecuteQueryFunc<V>] => {
  const [queryState, executeQuery] = useManualQuery<D, V>(
    queryString,
    variables,
  )

  React.useEffect(() => {
    executeQuery(variables)
  }, [queryString])

  return [queryState, executeQuery]
}

export const useMutation = useManualQuery
