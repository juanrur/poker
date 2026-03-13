export function generateCode () {
  const possibleLettersDictionary = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  let code: string = ""
  Array.from({length: 4}, (_, index) => index).forEach(() => {
    code += possibleLettersDictionary[Math.floor(Math.random() * possibleLettersDictionary.length)]
  })

  return code
}