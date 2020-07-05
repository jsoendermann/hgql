import axios, { AxiosRequestConfig } from 'axios'
import { GraphQLError } from 'graphql'

export type SendRequestFunction = <R extends object, V extends object = object>(
    query: string,
    variables?: V
) => Promise<R>

export class HgqlError extends Error {
    private _graphQLErrors: null | GraphQLError[] = null
    private _responseError: null | { status: number; data: string } = null
    private _errorMessage: null | string = null

    constructor(errorData: any) {
        super()

        if (errorData.response) {
            if (errorData.response.data && Array.isArray(errorData.response.data.errors)) {
                this._graphQLErrors = errorData.response.data.errors.map((d: any) => new GraphQLError(d.message))
            } else {
                this._responseError = {
                    status: errorData.response.status,
                    data: errorData.response.data,
                }
            }
        } else if (typeof errorData === 'string') {
            this._errorMessage = errorData
        }

        this.message = this.toString()
        ;(this as any).__proto__ = HgqlError.prototype
    }

    get type() {
        if (this._graphQLErrors) {
            return 'GRAPHQL'
        } else if (this._responseError) {
            return 'RESPONSE'
        } else if (this._errorMessage) {
            return 'STRING'
        }
        return 'REQUEST'
    }

    get graphQLErrors() {
        return this._graphQLErrors
    }

    get responseError() {
        return this._responseError
    }

    toString() {
        if (this._graphQLErrors) {
            return this._graphQLErrors.map(e => e.message).join('\n')
        } else if (this._responseError) {
            return this._responseError.data
        } else if (this._errorMessage) {
            return this._errorMessage
        } else {
            return "Couldn't connect, make sure you are online."
        }
    }
}

export interface Params {
    getUrl: () => string
    augmentRequest?: (request: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>
    processResponse?: (response: any) => any | Promise<any>
    processError?: (error: HgqlError) => any | Promise<any>
}

const augmentRequestDefault = async (request: AxiosRequestConfig) => request
const processResponseDefault = async (response: any) => response
const processErrorDefault = async (error: Error) => error.message

export const createSendRequestFunction = ({
    getUrl,
    augmentRequest = augmentRequestDefault,
    processResponse = processResponseDefault,
    processError = processErrorDefault,
}: Params): SendRequestFunction => async (query: string, variables?: object) => {
    const request = {
        method: 'POST' as 'POST',
        url: getUrl(),
        data: { query, variables: variables || {} },
    }
    const augmentedRequest = await augmentRequest(request)
    try {
        const { data: response } = await axios(augmentedRequest)
        if (response.errors) {
            throw response.errors
        }
        const processedResponse = await processResponse(response)
        return processedResponse.data
    } catch (error) {
        const jgqlError = new HgqlError(error)
        throw processError(jgqlError)
    }
}
