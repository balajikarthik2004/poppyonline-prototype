import { useEffect, useRef, useState } from 'react'

/**
 * Runs an async fetcher whenever `deps` change, tracking loading/error state.
 * Guards against setting state after unmount or after a newer call has started.
 */
export function useAsync(fetcher, deps) {
  const [data, setData] = useState(undefined)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(undefined)
  const callId = useRef(0)

  useEffect(() => {
    const currentCall = ++callId.current
    setStatus('loading')
    setError(undefined)

    fetcher()
      .then((result) => {
        if (callId.current !== currentCall) return
        setData(result)
        setStatus('success')
      })
      .catch((err) => {
        if (callId.current !== currentCall) return
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setStatus('error')
      })

    return () => {
      callId.current += 1
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, status, error, isLoading: status === 'loading', isError: status === 'error' }
}
