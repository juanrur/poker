export enum RoundStates {
  ACTIVE = 'ACTIVE', 
  INCREASED = 'INCREASED',
  COMPLETE = 'COMPLETE'
}

export enum RoundEvents {
  RAISE = 'RAISE',
  ALL_PASSED = 'ALL_PASSED',
  ALL_EQUAL = 'ALL_EQUAL',
  FINISHED_ROUND = 'FINISHED_ROUND'
}


export const machine: any = {
  ACTIVE: {
    ALL_PASSED: RoundStates.COMPLETE,
    RAISE: RoundStates.INCREASED
  },
  INCREASED: {
    ALL_EQUAL: RoundStates.COMPLETE,
  },
  COMPLETE: {
    FINISHED_ROUND: RoundStates.ACTIVE
  }
}

export function transition (currentState: RoundStates, event: RoundEvents) {
  if(!machine[currentState]) return currentState
  
  const nextState = machine[currentState][event]
  
  if(!nextState) return currentState
  
  return nextState 
}