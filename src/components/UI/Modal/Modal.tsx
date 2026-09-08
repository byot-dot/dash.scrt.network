import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useClickOutside from 'hooks/useClickOutside'
import { useEffect, useId, useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'

export type ModalSize = '2xl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs'

interface Props {
  size?: ModalSize
  title?: ReactNode
  subTitle?: ReactNode
  onClose: () => void
  isOpen: boolean
  children?: ReactNode
}

function Modal({ size = 'sm', ...props }: Props) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const subTitleId = useId()

  const sizeClass = () => {
    switch (size) {
      case '2xl':
        return 'max-w-screen-2xl'
      case 'xl':
        return 'max-w-screen-xl'
      case 'lg':
        return 'max-w-screen-lg'
      case 'md':
        return 'max-w-screen-md'
      case 'sm':
        return 'max-w-screen-sm'
      case 'xs':
        return 'max-w-[28rem]'
      default:
        return 'max-w-screen-sm'
    }
  }

  // toggles body scrollability
  useEffect(() => {
    const body: HTMLElement = document.body
    const bodyHasClass: boolean = body.classList.contains('overflow-hidden')
    if (props.isOpen && !bodyHasClass) {
      body.classList.add('overflow-hidden')
    } else if (!props.isOpen && bodyHasClass) {
      body.classList.remove('overflow-hidden')
    }
  }, [props.isOpen])

  useEffect(() => {
    if (!props.isOpen) return

    previouslyFocusedElement.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    modalRef.current?.focus()

    return () => {
      if (previouslyFocusedElement.current?.isConnected) {
        previouslyFocusedElement.current.focus()
      }
    }
  }, [props.isOpen])

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      props.onClose()
      return
    }

    if (event.key !== 'Tab' || !modalRef.current) return

    event.stopPropagation()

    const focusableElements = Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"], [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.getClientRects().length > 0)

    if (focusableElements.length === 0) {
      event.preventDefault()
      modalRef.current.focus()
      return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey && (document.activeElement === firstElement || document.activeElement === modalRef.current)) {
      event.preventDefault()
      lastElement.focus()
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  useClickOutside(modalRef, () => props.onClose())

  if (!props.isOpen) {
    return null
  }

  const labelledBy = props.title ? titleId : props.subTitle ? subTitleId : undefined
  const describedBy = props.title && props.subTitle ? subTitleId : undefined

  return (
    <>
      {/* Outer */}
      <div className="z-50 fixed inset-0 bg-black/80 dark:text-white">
        <div className="absolute inset-0 overflow-y-scroll">
          <div className={`mt-4 md:mt-24 mb-24 ${sizeClass()} mx-auto`}>
            {/* Inner */}
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={labelledBy}
              aria-describedby={describedBy}
              aria-label={!labelledBy ? 'Dialog' : undefined}
              tabIndex={-1}
              onKeyDown={handleKeyDown}
              className="mx-4 bg-white dark:bg-neutral-900 p-8 rounded-2xl"
            >
              {/* Head */}
              <div className={`flex mb-6 ${props.title || props.subTitle ? 'items-center gap-4' : 'justify-end'}`}>
                {/* Title and Subtitle */}
                {(props.title || props.subTitle) && (
                  <div className="text-left flex-1 flex-col">
                    {props.title && (
                      <div id={titleId} className="text-xl font-semibold">
                        {props.title}
                      </div>
                    )}
                    {props.subTitle && (
                      <div
                        id={subTitleId}
                        className="mt-2 text-sm text-neutral-500 dark:text-neutral-500 font-semibold"
                      >
                        {props.subTitle}
                      </div>
                    )}
                  </div>
                )}
                {/* Close Button */}
                <button
                  type="button"
                  aria-label="Close dialog"
                  onClick={props.onClose}
                  className="dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors py-2 px-2.5 rounded-xl"
                >
                  <FontAwesomeIcon icon={faXmark} className="fa-fw" />
                </button>
              </div>

              {/* Body */}
              <div>{props.children}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Modal
