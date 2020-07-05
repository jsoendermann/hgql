import * as React from 'react'

import { HgqlContext } from './context'
import { HgqlError } from './sendRequestFunction'

export { gql } from './gql'
export { HgqlContext } from './context'
export { SendRequestFunction, createSendRequestFunction, HgqlError } from './sendRequestFunction'

const { useState } = React

interface InitialState {
    state: 'INITIAL'
}
interface LoadingState {
    state: 'LOADING'
}
interface SuccessState<D extends object> {
    state: 'SUCCESS'
    response: D
}
interface ErrorState {
    state: 'ERROR'
    error: HgqlError
}
type HgqlData<D extends object> = InitialState | LoadingState | SuccessState<D> | ErrorState

type ExecuteQueryFunc<V> = (vars: V | undefined) => void

export const useManualQuery = <D extends object, V extends object = never>(
    queryString: string,
    variables?: V
): [HgqlData<D>, ExecuteQueryFunc<V>] => {
    const isMounted = React.useRef(true)
    React.useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
        }
    }, [])

    const sendRequest = React.useContext(HgqlContext)

    const [queryState, setQueryState] = useState<HgqlData<D>>({
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
    variables?: V
): [HgqlData<D>, ExecuteQueryFunc<V>] => {
    const [queryState, executeQuery] = useManualQuery<D, V>(queryString, variables)

    React.useEffect(() => {
        executeQuery(variables)
    }, [queryString])

    return [queryState, executeQuery]
}

export const useMutation = useManualQuery
