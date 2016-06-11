import _ from 'lodash'
import {substrings} from './string-utils'
import {limitIterator} from './utils'

function * optionsForString (string, option, props, register, traverse) {
  const observation = props.observe
    ? props.observe(string, {props: {}, children: []})
    : undefined

  const currentValue = observation ? register(observation) : undefined

  const description = props.describe
    ? props.describe(
      {props: {}, children: [], data: currentValue}
    ) : undefined

  if (description) {
    yield * traverse(description, option)
  }
}

function * traversesForSubstrings (option, props, register, traverse) {
  const iterations = option.text == null
    ? [undefined]
    : substrings(option.text, props)

  for (let substring of iterations) {
    yield optionsForString(substring, option, props, register, traverse)
  }
}

function * visit (option, {props, register}, traverse) {
  const traverses = traversesForSubstrings(option, props, register, traverse)
  yield * limitIterator(traverses, props.limit)
}

export default {visit}
