/* eslint-env mocha */
/** @jsx createElement */

import {createElement, compile} from 'elliptical'
import chai, {expect} from 'chai'
import createProcess from '../src/process'
import {spy} from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('process', () => {
  it('calls register with the results of observe', () => {
    const Test = {
      observe () {
        return 3
      }
    }
    const register = spy()
    const process = createProcess(register)
    compile(<Test />, process)

    expect(register).to.have.been.calledWith(3)
  })

  it('passes props to observe', () => {
    const Test = {
      observe ({props, children}) {
        expect(props).to.eql({num: 3})
        expect(children).to.eql([])
        return props.num + 3
      }
    }
    const register = spy()
    const process = createProcess(register)
    compile(<Test num={3} />, process)

    expect(register).to.have.been.calledWith(6)
  })

  it('passes result of register to describe as data', () => {
    const Test = {}
    const Root = {
      observe () {
        return 3
      },
      describe ({data}) {
        expect(data).to.eql(6)
        return <Test test={data} />
      }
    }

    const register = spy((num) => num + 3)
    const process = createProcess(register)
    compile(<Root />, process)

    expect(register).to.have.been.calledWith(3)
  })
})
