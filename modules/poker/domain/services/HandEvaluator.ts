import { Card } from "../entities/Card"

export function evaluateHand(playerCards: Card[], communityCards: Card[]): number {
    let value = 0
    const allCards = [...playerCards, ...communityCards]
    const cardValues = allCards.map(card => card.value).sort((a, b) => b - a)

    let timeCards : Record<number, number> = {}
    cardValues.forEach((value) => {
      timeCards[value] = (timeCards[value] ?? 0 ) + 1
    })

    // high card
    value = cardValues[0]

    // pair
    const pairs = Object.entries(timeCards).filter(([key, count]) => count === 2).sort((a, b) => Number(b[0]) - Number(a[0]))
    if(pairs.length > 0) {
      value = 13 + Number(pairs[0][0])
    }

    // double pair
    if(pairs.length > 1) {
      value = 13 + (7 * Number(pairs[0][0])) + Number(pairs[1][0])
    }

    // three of a kind
    const threeOfAKind = Object.entries(timeCards).filter(([key, count]) => count === 3).sort((a, b) => Number(b[0]) - Number(a[0]))
    if(threeOfAKind.length > 0) {
      value = 400 + Number(threeOfAKind[0][0])
    }

    // straight
    const uniqueCardValues = Object.keys(timeCards).map(Number).sort((a, b) => b - a)
    const isStraight = (values: number[]) => values.length >= 5 && values[0] - values[4] === 4
    if(isStraight(uniqueCardValues)) {
      value = 500 + uniqueCardValues[0]
    }

    // full house
    if(threeOfAKind.length > 0 && pairs.length > 0) {
      value = 600 + (Number(threeOfAKind[0][0])) + Number(pairs[0][0])
    }

    // four of a kind
    const fourOfAKind = Object.entries(timeCards).filter(([key, count]) => count === 4).sort((a, b) => Number(b[0]) - Number(a[0]))
    if(fourOfAKind.length > 0) {
      value = 800 + Number(fourOfAKind[0][0])
    }

    // straight flush
    const suitsCount: Record<Card['suit'], number[]> = { heart: [], spade: [], club: [], diamond: [] }
    allCards.forEach(card => {
      suitsCount[card.suit].push(card.value)
    })
    for (const suitKey in suitsCount) {
      const numbers = suitsCount[suitKey as Card['suit']].sort((a, b) => b - a)
      if(isStraight(numbers)) {
        value = 900 + numbers[0]
        break
      }
    }

    // royal flush
    for (const suitKey in suitsCount) {
      const numbers = suitsCount[suitKey as Card['suit']].sort((a, b) => b - a)
      if(isStraight(numbers) && numbers[0] === 13) {
        value = 1000
        break
      }
    }

    return value
  }