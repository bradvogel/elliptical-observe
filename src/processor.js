/** @jsx createElement */

import _ from 'lodash'
import {createElement, compile} from 'elliptical'
import createStore from './store'
import Dynamic from './dynamic'

export default function createProcessor (register) {
  return function process (element) {
    if (element.type.observe) {
      const source = element.type.observe(element)
      const data = register(source)

      return _.assign({}, element, {data})
    } else if (element.type === "dynamic") {
      return _.assign({}, element, {type: Dynamic, register})
    }
    return element
  }
}