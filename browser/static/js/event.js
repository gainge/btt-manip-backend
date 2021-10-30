import { rngAdv, rngInt, findSeedDifference } from './util.js'

/* RNG Event Classes */
class RngEvent {
  constructor() {}
  resultsFromSeed(seed) {
    return [true, seed];
  }
}

class DelayEvent extends RngEvent {
  delay = 0;

  constructor(delay) {
    super();
    this.delay = delay;
  }

  resultsFromSeed(seed) {
    for (let i = 0; i < this.delay; i++) {
      seed = rngAdv(seed);
    }

    return [true, seed];
  }
}

class IntEvent extends RngEvent {
  max;
  low;
  high;

  constructor(max, low, high) {
    super();
    this.max = max;
    this.low = low;
    this.high = high;
  }

  resultsFromSeed(seed) {
    seed = rngAdv(seed);

    let result = rngInt(seed, this.max);
    let success = (result >= this.low && result <= this.high);

    return [success, seed];
  }
}

const EVENT_SEARCH_MAX_ITERATIONS = 1000000; // 0x100000000 for full range


const seedYieldsEvents = (seed, events) => {
  for (let i = 0; i < events.length; i++) {
    let [success, resultSeed] = events[i].resultsFromSeed(seed);

    if (!success) {
      return [false, resultSeed];
    } else {
      seed = resultSeed;
    }
  }

  return [true, seed];
}

const searchForEvent = (events, startSeed) => {
  let seed = startSeed;

  for (let i = 0; i < EVENT_SEARCH_MAX_ITERATIONS; i++) {
    let trialSeed = seed;

    let [success, resultSeed] = seedYieldsEvents(trialSeed, events);

    if (success) {
      return {
        startSeed: startSeed,
        eventSeed: seed,
        endSeed: resultSeed,
        interval: findSeedDifference(startSeed, seed),
        success: success
      };
    }

    seed = rngAdv(seed);
  }

  return {
    success: false
  }
}


const buildCharacterEvents = (characters) => {
  let events = [];

  for (let i = 0; i < characters.length; i++){
    // Add the character event + delay
    events.push(new IntEvent(25, characters[i], characters[i]));
    events.push(new DelayEvent(1));
  }

  return events;
}

const buildPullEventList = (aerialSpawn, selectedItem) => {
  let events = [];
  
  if (aerialSpawn) { // TODO: add support for IBG lol
    events.push(new DelayEvent(43));
  } else {
    events.push(new DelayEvent(12));
  }

  // Add item pull event
  events.push(new IntEvent(128, 0, 0));

  // Add item specificity based on settings
  switch (selectedItem) {
    case "beamsword":
      events.push(new IntEvent(6, 5, 5));
      break;
    case "bomb":
      events.push(new IntEvent(6, 0, 1));
      break;
    case "saturn":
      events.push(new IntEvent(6, 2, 4));
      break;
    default:
      alert(`unknown item value! [${selectedItem}]`);
      break;
  }

  return events;
}




export { EVENT_SEARCH_MAX_ITERATIONS, seedYieldsEvents, searchForEvent, buildCharacterEvents, buildPullEventList }