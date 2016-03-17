/** @jsx createElement */
import _ from 'lodash'
import {createElement, createOption, compile} from 'elliptical'
import createProcess from '../src/process'

export function text (input) {
  return _.map(input.words, 'text').join('')
}

export function compileAndTraverse (element, input, register) {
  const process = createProcess(register)
  const traverse = compile(<base>{element}</base>, process)
  return Array.from(traverse(createOption({text: input})))
}
