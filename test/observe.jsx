/** @jsx createElement */
/* eslint-env mocha */

import {createElement} from 'elliptical'
import createParser from '../src/parser'
import Observable from 'zen-observable'
import {expect} from 'chai'

describe('observe', () => {
  it('calls register', () => {
    const parser = createParser(<literal text='test' />)
  })
})
