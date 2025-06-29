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

class RangeEvent extends RngEvent {
  range = 0;
  events = [];

  constructor(range, events) {
    super();
    this.range = range;
    this.events = events;
  }

  resultsFromSeed(seed) {
    for (let i = 0; i < this.range; i++) {
      const [success, resultSeed] = seedYieldsEvents(seed, this.events);

      if (success) {
        return [success, resultSeed];
      } else {
        seed = rngAdv(seed);
      }
    }

    return [false, seed]; // I think it's ok to return the advanced seed here?
  }
}

class OptionEvent extends RngEvent {
  eventSequences = []; // Array of RngEvent sequences

  constructor(eventSequences) {
    super();
    this.eventSequences = eventSequences;
  }

  resultsFromSeed(seed) {
    for (let i = 0; i < this.eventSequences.length; i++) {
      let [success, resultSeed] = seedYieldsEvents(seed, this.eventSequences[i]);

      if (success) {
        return [true, resultSeed];
      }
    }

    return [false, seed];
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

const buildPullEventList = (mismatch, spawnCondition, selectedItem) => {
  let events = [];

  if (selectedItem !== "hrc_stitch") {
    let delay = 12;

    if (mismatch) {
      switch (spawnCondition) {
        case 'ground-spawn':
          delay = 12;
          break;
        case 'aerial-spawn':
          delay = 43;
          break;
        case 'luigi':
          delay = 14; // Why you gotta be like this, luigi
          break;
        case 'seak':
          delay = 5;
          break;
        default:
          delay = 12;
          break;
      }
    }
    
    events.push(new DelayEvent(delay));
  }

  // Check for item or turnip (stitch) pull
  if (selectedItem === "hrc_stitch") {
    const doubleStitchEvents = [
      new IntEvent(128, 1, 127), // turnip pull
      new IntEvent(58, 57, 57),
      new IntEvent(58, 57, 57)
    ]

    events.push(new OptionEvent(
      [
        [
          new DelayEvent(2),
          new IntEvent(10, 0, 0), // long delay
          new DelayEvent(122),
          ...doubleStitchEvents
        ],
        [
          new DelayEvent(2),
          new IntEvent(10, 1, 5), // short delay
          new DelayEvent(119),
          ...doubleStitchEvents
        ],
        [
          new DelayEvent(2),
          new IntEvent(10, 6, 9), // med delay
          new DelayEvent(120),
          ...doubleStitchEvents
        ]
      ]
    ));
  } else if (selectedItem === "targetprey") {
    // Target a bomb -> sword in a specific range, first by adding a delay
    // measured from trial runs https://docs.google.com/spreadsheets/d/1QAKLVQsf37u1Zyv2YzM3rSf8r2cbIqxUoQcaf247aZ8/edit?usp=sharing
    // Bomb pull
    events.push(new IntEvent(128, 0, 0));
    events.push(new IntEvent(6, 0, 1));
    // Delay for run actions
    events.push(new DelayEvent(2246));
    // Finally, add a range event targeting a sword pull, covering 4 standard deviations in run variance
    events.push(new RangeEvent(160, [
      new IntEvent(128, 0, 0),
      new IntEvent(6, 5, 5),
    ]));
  } else if (selectedItem === 'happysquare') {
    // Target a sword -> sword in a specific range
    // Sword pull
    events.push(new IntEvent(128, 0, 0));
    events.push(new IntEvent(6, 5, 5));
    // Delay for run actions
    events.push(new DelayEvent(556));
    // Range event for 4 standard deviations (approx. 17 * 4)
    events.push(new RangeEvent(70, [
      new IntEvent(128, 0, 0),
      new IntEvent(6, 5, 5),
    ]));
  } else {
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
  }

  return events;
}




export { EVENT_SEARCH_MAX_ITERATIONS, seedYieldsEvents, searchForEvent, buildCharacterEvents, buildPullEventList }