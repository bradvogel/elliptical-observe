import _ from 'lodash'
import Observable from 'zen-observable'

export default function createStore () {
  const items = []
  let observer
  const data = new Observable((newObserver) => {
    observer = newObserver
  })

  return {
    data,
    register (element) {
      const existing = _.find(items, (item) => _.isEqual(element, item.element))

      if (existing) {
        return existing.value
      } else {
        const newItem = {element}
        const thisObservable = element.type(element)

        items.push(newItem)

        thisObservable.subscribe({
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
  }
}
