/** @jsx createElement */

import {createElement, createOption, compile} from 'elliptical'
import createProcess from './process'
import createStore from './store'
import Observable from 'zen-observable'

export default function createParser (element) {
  const store = createStore()
  const root = <base>{element}</base>

  let currentObserver
  let currentInput
  const process = createProcess(store.register)
  let traverse = compile(root, process)

  function compileAndTraverse () {
    traverse = compile(root, process)
    const outputs = Array.from(traverse(createOption({text: currentInput})))
    currentObserver.next(outputs)
  }

  store.data.subscribe({
    next () {
      if (currentObserver) {
        compileAndTraverse()
      }
      traverse = compile(root, process)
    }
  })

  return {
    watch (input) {
      if (currentObserver) {
        currentObserver.complete()
      }

      return new Observable((observer) => {
        currentObserver = observer
        currentInput = input
        compileAndTraverse()
      })
    },
    parse (input) {
      return Array.from(traverse(createOption({text: input})))
    },
    store
  }
}
