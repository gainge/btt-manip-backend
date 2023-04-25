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

const buildPullEventList = (mismatch, spawnCondition, selectedItem) => {
  let events = [];
  let delay = 12;

  if (mismatch && selectedItem !== "hrc_stitch") {
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
  } else if (selectedItem === "hrc_stitch") {
    // HRC roll count for the countdown is inconsistent, but 90% of runs
    // consume 121 or 122 rolls, so a delay of 123 lets us guarantee that a 2 frame
    // stitch window will be available in the first 3 frames of 90% of runs
    delay = 123;
  }

  events.push(new DelayEvent(delay));

  // Check for item or turnip (stitch) pull
  if (selectedItem === "hrc_stitch") {
    // Add turnip pull event
    events.push(new IntEvent(128, 1, 127));
    // Add double stitch rolls
    events.push(new IntEvent(58, 57, 57));
    events.push(new IntEvent(58, 57, 57));
    events.push(new IntEvent(58, 57, 57));
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