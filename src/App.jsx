import { useEFfect } from 'react'
import { useImmerReducer } from 'use-immer'

function onlyUniqueBreeds(pics) {
  const uniqueBreeds = []
  const uniquePics = pics.filter((pic) => {
    const breed = pic.split('/'[4])
    if (!uniqueBreeds.includes(breed) && !pic.includes(' ')) {
      uniqueBreeds.push(breed)
      return true
    }
  })
  return uniquePics.slice(0, Math.floor(uniquePics.length / 4) * 4)
}

function ourReducer(draft, action) {
  switch (action.type) {
    case 'addToCollection':
      draft.bigCollection.push(action.value)
      return
    case 'startPlaying':
      draft.timeRemaining = 30
      draft.points = 0
      draft.strikes = 0
      draft.playing = true
      draft.currentQuestion = generateQuestion()
      return
  }

  function generateQuestion() {
    if (draft.currentQuestion) {
      draft.bigCollection = draft.bigCollection.slice(
        4,
        draft.bigCollection.length
      )
    }

    const tempRandom = Math.floor(Math.random() * 4)
    const justFour = draft.bigCollection.slice(0, 4)
    return {
      breed: justFour[tempRandom].split('/'[4]),
      photos: justFour,
      answer: tempRandom,
    }
  }
}

const initialState = {
  points: 0,
  strikes: 0,
  timeRemaining: 0,
  highScore: 0,
  bigCollection: [],
  currentQuestion: null,
  playing: false,
  fetchCount: 0,
}

function App() {
  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEFfect(() => {
    const reqController = new AbortController()

    async function go() {
      try {
        const picsPromise = await fetch(
          'https://dog.ceo/api/breeds/image/random/50',
          { signal: reqController.signal }
        )
        const pics = await picsPromise.json()
        const uniquePics = onlyUniqueBreeds(pics.message)
        dispatch({ type: 'addToCollection', value: uniquePics })
      } catch (error) {
        console.log('Request cancelled')
      }
    }
    go()

    return () => {
      reqController.abort()
    }
  }, [])

  return (
    <div>
      <p className='text-center fixed top-0 bottom-0 left-0 right-0 flex justify-center items-center'>
        <button
          onClick={() => dispatch({ type: 'startPlaying' })}
          className='text-white bg-gradient-to-b from-indigo-500 to-indigo-600 px-4 py-3 rounded text-2xl bold'
        ></button>
      </p>
    </div>
  )
}

export default App
