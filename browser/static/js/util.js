const findSeedDifference = (start, target) => {
  if (start == target) return 0;

  let seedFromStart = start;
  let seedFromTarget = target;
  let rollCount = 0;

  do {
    seedFromStart = rngAdv(seedFromStart);
    seedFromTarget = rngAdv(seedFromTarget);
    rollCount++;
  } while (seedFromStart != target && seedFromTarget != start)

  if (seedFromTarget == start) {
    return -1 * rollCount;
  }

  return rollCount;
}

const formatHex = (n) => {
  return n.toString(16).padStart(8, '0');
}

const isInt = (value) => {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
}

/* RNG Seed Functions */
const rngAdv = (seed) => {
  return ((seed * 214013) + 2531011) % 2**32;
}

const rngInt = (seed, max) => {
  let n = Math.floor(seed / 2**16);
  return Math.floor((max * n) / 2**16)
}



export { findSeedDifference, formatHex, isInt, rngAdv, rngInt }