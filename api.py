import rng
import config
import roll


def buildEventSequenceFromSearch(searchClass, searchIDs):
    seq = rng.EventSequence()

    for ID in searchIDs:
        # obtain the specified search item and loop over its events
        searchEvent = searchClass[ID]
        for rngEvent in searchEvent.events:
            seq.addEvent(rngEvent)

    return seq


def buildEventSequenceFromConfig(configEntry):
    seq = rng.EventSequence()

    for event in configEntry.events:
        seq.addEvent(event)

    return seq


def buildCharacterSequence(charIDs):
    charSeq = rng.CharacterSequence()

    for ID in charIDs:
        charSeq.addCharacter(config.CHARACTER_IDS[int(ID)])

    return charSeq



def findSeed(charcterIDs):
    seq = buildCharacterSequence(charcterIDs)

    # Return the seed that is found
    return rng.locateCharSequence(seq)



def findSeedFromBase(baseSeed, searchType, searchIDs):
    # Validate Search Method
    if searchType not in config.SEARCH_TYPES:
        raise ValueError(f'Specified search type [{searchType}] not supported!')
    # Validate seed
    if baseSeed < 0 or baseSeed >= 2**32:
        raise ValueError(f'Invalid base seed for search! [{baseSeed}]')

    # Build seq of character events from search method
    searchEvents = config.searchEvents[searchType]
    seq = buildEventSequenceFromSearch(searchEvents, searchIDs)

    # Search for event from seed
    interval = rng.findSeed(seq, baseSeed)

    # Return seed after search from interval object
    return interval.endSeed


def findEvent(startSeed, eventIndex):
    # validate eventIndex
    if eventIndex < 0 or eventIndex > len(config.entries):
        raise ValueError(f'Target Event index [{eventIndex}] is invalid!')
    # Validate seed
    if startSeed < 0 or startSeed >= 2**32:
        raise ValueError(f'Invalid base seed for search! [{startSeed}]')

    # build event sequence
    seq = buildEventSequenceFromConfig(config.entries[eventIndex])
    
    # get seedInterval
    interval = rng.findSeed(seq, startSeed)

    # return eventStart + gap
    return interval.eventSeed, interval.interval


def getActionSequence(rollCount, isCSSManip):
    # Just return the string I guess, lol
    return roll.getActionSequence(rollCount, isCSSManip)



# characters = [1, 6, 6, 1, 9, 9, 1, 13]

# print(hex(findSeed(characters)))
# print(hex(findSeedFromBase(0, config.SEARCH_TYPE_CHARACTER, characters)))

# searchSeed = findSeed(characters)

# eventStart, interval = findEvent(searchSeed, 0)

# print()
# print(f'Search Start: {hex(searchSeed)}')
# print(f'Event Start: {hex(eventStart)}')
# print(f'{hex(searchSeed)} => {hex(eventStart)} : {interval} rolls')
