/** @jsx createElement */
/* eslint-env mocha */

import {createElement} from 'elliptical'
import Observable from 'zen-observable'
import {compileAndTraverse} from './_util'
import createStore from '../src/store'

import {spy} from 'sinon'
import chai, {expect} from 'chai'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('dynamic', () => {
  it('calls observe for a specific input', () => {
    const Test = {
      fetch ({props}) {
        expect(props).to.eql({input: 't'})
        return new Observable((observer) => {
          observer.next('test')
        })
      }
    }

    function observe (input) {
      return <Test input={input} />
    }

    function describe ({data}) {
      return <literal text={data} value={data} />
    }

    const store = createStore()
    const grammar = <dynamic observe={observe} describe={describe} />
    const options = compileAndTraverse(grammar, 't', store.register)

    expect(options).to.eql([{
      text: null,
      words: [{text: 't', input: true}, {text: 'est', input: false}],
      result: 'test',
      score: 1,
      qualifiers: []
    }])
  })

  it('calls observe for a specific input, and handles async data', (done) => {
    const Test = {
      fetch () {
        return new Observable((observer) => {
          process.nextTick(() => {
            observer.next('totally')
          })
        })
      }
    }

    function observe (input) {
      return <Test input={input} />
    }

    function describe ({data = 'test'}) {
      return <literal text={data} value={data} />
    }

    const grammar = <dynamic observe={observe} describe={describe} consumeAll />
    const store = createStore()
    const options = compileAndTraverse(grammar, 't', store.register)
    expect(options).to.eql([{
      text: null,
      words: [{text: 't', input: true}, {text: 'est', input: false}],
      result: 'test',
      score: 1,
      qualifiers: []
    }])

    process.nextTick(() => {
      const options = compileAndTraverse(grammar, 't', store.register)
      expect(options).to.eql([{
        text: null,
        words: [{text: 't', input: true}, {text: 'otally', input: false}],
        result: 'totally',
        score: 1,
        qualifiers: []
      }])

      done()
    })
  })

  it('calls fetch for two different inputs on the same parse', () => {
    const Test = {
      fetch ({props}) {
        return new Observable((observer) => {
          observer.next(`${props.input}batman${props.input}`)
        })
      }
    }

    function observe (input) {
      return <Test input={input} />
    }

    function describe ({data}) {
      return <literal text={data} value={data} />
    }

    const grammar = (
      <choice>
        <sequence>
          <literal text='test' />
          <dynamic observe={observe} describe={describe} id='dynamic' consumeAll />
        </sequence>
        <dynamic observe={observe} describe={describe} id='dynamic' consumeAll />
      </choice>
    )
    const store = createStore()

    const options = compileAndTraverse(grammar, 'testb', store.register)
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'test', input: true},
        {text: 'b', input: true},
        {text: 'batmanb', input: false}
      ],
      result: {dynamic: 'bbatmanb'},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [
        {text: 'testb', input: true},
        {text: 'batmantestb', input: false}
      ],
      result: {dynamic: 'testbbatmantestb'},
      score: 1,
      qualifiers: []
    }])
  })

  it('is fine if an observe call returns nothing', () => {
    const Test = {
      fetch ({props}) {
        return new Observable((observer) => {
          observer.next(`${props.input}superman`)
        })
      }
    }

    function observe (input) {
      if (input != null) {
        return <Test input={input} />
      }
    }

    function describe ({data = 'test'}) {
      return <literal text={data} value='aaa' />
    }

    const grammar = (
      <choice>
        <sequence>
          <literal text='test' />
          <dynamic observe={observe} describe={describe} id='dynamic' consumeAll />
        </sequence>
        <dynamic observe={observe} describe={describe} id='dynamic' consumeAll />
      </choice>
    )

    const store = createStore()
    const options = compileAndTraverse(grammar, 'tes', store.register)
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'tes', input: true},
        {text: 't', input: false},
        {text: 'test', input: false}
      ],
      result: {dynamic: 'aaa'},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [
        {text: 'tes', input: true},
        {text: 'superman', input: false}
      ],
      result: {dynamic: 'aaa'},
      score: 1,
      qualifiers: []
    }])
  })

  it('calls observe for multiple splits', () => {
    const observeSpy = spy()

    function observe (input) {
      observeSpy(input)
    }

    const grammar = <dynamic observe={observe} describe={() => {}} splitOn=' ' />
    compileAndTraverse(grammar, 'b t')
    expect(observeSpy).to.have.been.calledTwice
    expect(observeSpy).to.have.been.calledWith('b')
    expect(observeSpy).to.have.been.calledWith('b t')
  })

  it('can be limited', () => {
    function describe (data) {
      return <literal text='b test' />
    }

    const grammar = <dynamic describe={describe} splitOn=' ' limit={1} />

    const store = createStore()
    const options = compileAndTraverse(grammar, 'b test', store.register)
    expect(options).to.have.length(1)
  })

  it('limiting limits splits, not child branches', () => {
    function describe () {
      return <list items={['super', 'bat']} />
    }

    const grammar = (
      <sequence>
        <dynamic describe={describe} limit={1} />
        <literal text='man' />
      </sequence>
    )

    const store = createStore()
    const options = compileAndTraverse(grammar, '', store.register)
    expect(options).to.have.length(2)
  })

  it('can be greedy', () => {
    const Test = {
      fetch ({props}) {
        return new Observable((observer) => {
          observer.next(props.input)
        })
      }
    }

    function observe (input) {
      return <Test input={input} />
    }

    function describe ({data}) {
      return <literal text={data} value={data} />
    }

    const grammar = (
      <sequence>
        <dynamic observe={observe} describe={describe} splitOn=' ' greedy />
        <literal text=' test' />
      </sequence>
    )
    const store = createStore()
    const options = compileAndTraverse(grammar, 'b t', store.register)
    expect(options).to.eql([{
      text: null,
      words: [
        {text: 'b t', input: true},
        {text: ' test', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: []
    }, {
      text: null,
      words: [
        {text: 'b', input: true},
        {text: ' t', input: true},
        {text: 'est', input: false}
      ],
      result: {},
      score: 1,
      qualifiers: []
    }])
  })
})
