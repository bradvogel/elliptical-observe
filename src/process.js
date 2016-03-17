/** @jsx createElement */

import _ from 'lodash'
import {createElement, createOption, compile} from 'elliptical'
import createStore from './store'
import Observable from 'zen-observable'
import Dynamic from './dynamic'

export default function createProcess (register) {
  return function process (element) {
    if (element.type.observe) {
      const source = element.type.observe(element)
      const data = register(source)

      return _.assign({}, element, {data})
    } else if (element.type === Dynamic) {
      return _.assign({}, element, {register})
    }
    return element
  }
}