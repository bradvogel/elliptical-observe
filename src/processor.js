/** @jsx createElement */

import _ from 'lodash'
import {createElement, compile} from 'elliptical'
import createStore from './store'
import Dynamic from './dynamic'

export default function createProcessor (register, processor) {
  return function process (element) {
    if (element.type.observe) {
      let source = element.type.observe(element)

      if (processor) {
        source = processor(source)
      }
      let oldData = register(source)
      let desc
      if (element.type.describe) {
        desc = element.type.describe(_.assign({}, element, {data: oldData}))
      }

      function visit (option, e, traverse) {
        const data = register(source)
        if (oldData !== data) {
          oldData = data
          if (element.type.describe) {
            desc = element.type.describe(_.assign({}, element, {data}))
          }
        }
        if (element.type.describe) {
          return traverse(desc, option)
        } else {
          return e.type._oldVisit(option, _.assign({}, e, {data}), traverse)
        }
      }

      const type = _.assign({}, element.type, {
        visit,
        _oldVisit: element.type.visit,
        describe: undefined
      })
      return _.assign({}, element, {type})
    } else if (element.type === "dynamic") {
      return _.assign({}, element, {type: Dynamic, register})
    }
    return element
  }
}