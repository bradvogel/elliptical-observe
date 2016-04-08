import _ from 'lodash'
import Observable from 'zen-observable'

export default function createStore () {
  const items = []
  let observer
  const data = new Observable((newObserver) => {
    observer = newObserver
  })

  function register (element) {
    const existing = _.find(items, (item) => _.isEqual(element, item.element))

    if (existing) {
      return existing.value
    } else {
      const newItem = {element}
      items.push(newItem)

      const fetched = element.type.fetch(element)

      fetched.subscribe({
        next (value) {
          newItem.value = value

          if (observer) {
            observer.next({element, value})
          }
        }
      })

      return newItem.value
    }
  }

  return {data, register}
}
