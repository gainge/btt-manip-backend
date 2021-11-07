#include <pybind11/pybind11.h>

#include <stdint.h>


// c++ -O3 -Wall -shared -std=c++11 -undefined dynamic_lookup $(python3 -m pybind11 --includes) rng.cpp -o rng$(python3-config --extension-suffix)
namespace py = pybind11;


// Implementation of LCG by Savestate
void rng_adv(uint32_t *seed) {
    *seed = ((*seed * 214013) + 2531011);
}

uint32_t rng_int(uint32_t *seed, uint32_t max) {
    uint32_t top_bits = *seed >> 16;
    return (max * top_bits) >> 16;
}

bool checkSecondChar(uint32_t seed, int secondChar) {
    // Inline for performance
    seed = ((seed * 214013) + 2531011); // rng_adv(&seed);
    seed = ((seed * 214013) + 2531011); // rng_adv(&seed);
    return ((seed >> 16) * 25) >> 16 == secondChar; // (rng_int(&seed, 25) == secondChar)
}

uint32_t advanceSeedN(uint32_t seed, int n) {
    for (int i = 0; i < n; i++) {
        rng_adv(&seed);
    }
    
    return seed;
}

/**
 * @brief Descriptor for a seed event detection
 * 
 */
struct SeedInterval {
    uint32_t startSeed; // Start of search
    uint32_t eventSeed; // Start of detected event
    uint32_t endSeed;   // Seed after event occurs
    uint32_t interval;  // Period between search start and event start
    
    bool success;       // if the search was successful or not
};

enum CHARACTER {
    DOC = 0,
    MARIO,
    LUIGI,
    BOWSER,
    PEACH,
    YOSHI,
    DONKEY_KONG,
    CAPTAIN_FALCON,
    GANON,
    FALCO,
    FOX,
    NESS,
    ICE_CLIMBERS,
    KIRBY,
    SAMUS,
    ZELDA,
    LINK,
    YOUNG_LINK,
    PICHU,
    PIKACHU,
    JIGGLYPUFF,
    MEWTWO,
    MR_GAME_AND_WATCH,
    MARTH,
    ROY
};

class RngEvent {
public:
    virtual ~RngEvent() = default;
    virtual bool resultsFromSeed(uint32_t*) = 0;
};

class DelayEvent : public RngEvent {
public:
    uint32_t delay;
    
    DelayEvent(uint32_t d) {
        delay = d;
    }

    bool resultsFromSeed(uint32_t* seed) override {
        // Consume specified number of RNG rolls
        for (uint32_t i = 0; i < delay; i++) {
            rng_adv(seed);
        }
        
        return true;
    }
};

class IntEvent : public RngEvent {
public:
    uint32_t max;
    uint32_t low;
    uint32_t high;
    
    IntEvent(uint32_t m, uint32_t lo, uint32_t hi) {
        max = m;
        low = lo;
        high = hi;
    }

    bool resultsFromSeed(uint32_t* seed) override {
        rng_adv(seed);
        
        uint32_t result = rng_int(seed, max);
        
        return (result >= low && result <= high);
    }
};

class EventSequence {
public:
    std::vector<RngEvent*> events;
    
    EventSequence() {}
    
    void addEvent(RngEvent* event) {
        events.push_back(event);
    }
};

class CharacterSequence {
public:
    std::vector<CHARACTER> characters;

    CharacterSequence() {}

    void addCharacter(CHARACTER character) {
        characters.push_back(character);
    }
};


/**
 * @brief Determines the difference between two RNG seeds as represented by roll count
 * 
 * @param start Starting seed
 * @param target Target seed
 * @return uint32_t Difference in rolls from starting seed to target seed
 */
uint32_t findSeedDifference(uint32_t start, uint32_t target) {
    if (start == target) return 0;
    
    // Establish pointers to search from both seeds to save time
    uint32_t seedFromStart = start;
    uint32_t seedFromTarget = target;
    uint32_t rollCount = 0;
    
    do {
        rng_adv(&seedFromStart);
        rng_adv(&seedFromTarget);
        rollCount++;
    } while (seedFromStart != target && seedFromTarget != start);
    
    // Check for standard advancement or wraparound
    if (seedFromTarget == start) {
        return -1 * rollCount;
    }
    
    return rollCount;
}

/**
 * @brief Determines if a specified seed will yield a given event sequence
 * 
 * @param seed The seed in question
 * @param events Event sequence that is being queried
 * @param numEvents Number of events in the passed event array
 * @return true The given seed yields the provided event sequence
 * @return false The given seed does NOT yield the provided event sequence
 */
bool seedYieldsEvents(uint32_t* seed, RngEvent* events[], int numEvents) {
    // Traverse event sequence to validate
    for (int i = 0; i < numEvents; i++) {
        if (!events[i]->resultsFromSeed(seed)) {
            return false;
        }
    }
    
    return true;
}

/**
 * @brief Locates a seed given an array of RNG Events
 * 
 * @param events Event sequence that is being queried
 * @param numEvents Number of events in the passed event array
 * @param startSeed Seed from which to start the search
 * @return SeedInterval Interval struct containing information regarding the detected seed location, if any
 */
SeedInterval findSeed_(RngEvent* events[], int numEvents, uint32_t startSeed) {
    SeedInterval interval;
    interval.startSeed = startSeed;
    interval.success = false;
    
    uint32_t seed = startSeed;
    
    for (long i = 0; i < 0x100000000; i++) {
        uint32_t trialSeed = seed;
        
        if (seedYieldsEvents(&trialSeed, events, numEvents)) {
            // This seed works!
            interval.eventSeed = seed;
            interval.endSeed = trialSeed;
            interval.interval = findSeedDifference(startSeed, seed); // search start to event start
            interval.success = true;
            break;
        }
        
        // Advance seed for next iteration
        rng_adv(&seed);
    }
    
    return interval;
}

SeedInterval findSeed(EventSequence events, uint32_t startSeed) {
    // Workaround for pybind's lack of double pointer binding support lmao
    return findSeed_(events.events.data(), (int) events.events.size(), startSeed);
}

// Define character ranges in the form of {start, length}
// https://www.reddit.com/r/SSBM/comments/71gn1d/the_basics_of_rng_in_melee/?st=jg8erv90&sh=1e004c46
uint32_t CHAR_RANGES[25][2] = {
    {0, 171835392},
    {171835392, 171769856},
    {343605248, 171835392},
    {515440640, 171769856},
    {687210496, 171835392},
    {859045888, 171769856},
    {1030815744, 171835392},
    {1202651136, 171769856},
    {1374420992, 171769856},
    {1546190848, 171835392},
    {1718026240, 171769856},
    {1889796096, 171835392},
    {2061631488, 171769856},
    {2233401344, 171835392},
    {2405236736, 171769856},
    {2577006592, 171835392},
    {2748841984, 171769856},
    {2920611840, 171769856},
    {3092381696, 171835392},
    {3264217088, 171769856},
    {3435986944, 171835392},
    {3607822336, 171769856},
    {3779592192, 171835392},
    {3951427584, 171769856},
    {4123197440, 171769856},
};

/**
 * @brief Detects if a given seed produces a given random character sequence
 * 
 * @param seed The seed in question
 * @param characters Character sequence that is being queried
 * @param numChars Number of characters in the passed event array
 * @return true The given seed yields the provided character sequence
 * @return false The given seed does NOT yield the provided character sequence
 */
bool seedYieldsCharSequence(uint32_t* seed, CHARACTER characters[], int numChars) {
    // Just check each character as we walk through the LCG generation
    for (int i = 0; i < numChars; i++) {
        rng_adv(seed);
        if (rng_int(seed, 25) != characters[i]) return false;
        rng_adv(seed);
    }
    
    return true;
}

/**
 * @brief Searches for a seed that produces the given character sequence
 * 
 * @param characters Character sequence that is being queried
 * @param numChars Number of characters in the passed event array
 * @return long long Detected seed. -1 if no seed found
 */
long long locateCharSequence_(CHARACTER characters[], int numChars) {
    if (numChars == 0) return -1; // Invalid seq length
    
    int startingChar = characters[0];
    int secondChar = characters[1];
    uint32_t seed = CHAR_RANGES[startingChar][0];
    uint32_t range = CHAR_RANGES[startingChar][1];
    
    if (numChars == 1) return advanceSeedN(seed, 2); // 1 Char seq, just return first available seed lol
    
    long i = 0;
    
    // find first instance of second char!
    while (!checkSecondChar(seed, secondChar)) {
        seed++; // Walk until we find a valid starting point for the sequence
        i++;
    }
    
    if (numChars == 2) return advanceSeedN(seed, 4); // 2 Char seq, return first available again
    
    // actual seq search loop
    while (true) {
        if (i >= range) break; // OOB check
        
        uint32_t trialSeed = seed;
        // Advance the seed once for the remaining first char roll
        rng_adv(&trialSeed);
        // Then twice more for the known second character
        rng_adv(&trialSeed);
        rng_adv(&trialSeed);
        
        // Validate the rest of the sequence starting at the 3rd character
        if (seedYieldsCharSequence(&trialSeed, &characters[2], numChars - 2)) {
            return (long long) trialSeed; // Return seed produced at end of sequence
        } else {
            // We need to do some seed advancing lol
            // Default is +3 to get to next instance of second character (gap of 2 seeds)
            seed += 3;
            i += 3;
            
            // Validate second char at new position
            if (checkSecondChar(seed, secondChar)) continue; // valid, next loop
            
            // Failed, advance seed and check again further down
            // add additional 110 for total offset 113 (112 seed gap)
            seed += 110;
            i += 110;
            
            if (checkSecondChar(seed, secondChar)) continue; // valid, next loop
            
            // Failed, add 3 more to handle the last case (116 offset, 115 seed gap)
            seed += 3;
            i += 3;
            
            // Assert valid second char one last time
            // If this fails everything I've relied on in the world is shattered
            if (!checkSecondChar(seed, secondChar)) break; // We messed up LOL
        }
    };
    
    return -1;
}


long locateCharSequence(CharacterSequence characters){
    // More pybind bypass stuff to easily use arrays :P
    return locateCharSequence_(characters.characters.data(), (int) characters.characters.size());
}

PYBIND11_MODULE(rng, m) {
    m.doc() = "Python Binding for SSBM RNG Module"; // optional module docstring

    /* Enum Delcarations */
    py::enum_<CHARACTER>(m, "CHARACTER")
        .value("DOC", DOC)
        .value("MARIO", MARIO)
        .value("LUIGI", LUIGI)
        .value("BOWSER", BOWSER)
        .value("PEACH", PEACH)
        .value("YOSHI", YOSHI)
        .value("DONKEY_KONG", DONKEY_KONG)
        .value("CAPTAIN_FALCON", CAPTAIN_FALCON)
        .value("GANON", GANON)
        .value("FALCO", FALCO)
        .value("FOX", FOX)
        .value("NESS", NESS)
        .value("ICE_CLIMBERS", ICE_CLIMBERS)
        .value("KIRBY", KIRBY)
        .value("SAMUS", SAMUS)
        .value("ZELDA", ZELDA)
        .value("LINK", LINK)
        .value("YOUNG_LINK", YOUNG_LINK)
        .value("PICHU", PICHU)
        .value("PIKACHU", PIKACHU)
        .value("JIGGLYPUFF", JIGGLYPUFF)
        .value("MEWTWO", MEWTWO)
        .value("MR_GAME_AND_WATCH", MR_GAME_AND_WATCH)
        .value("MARTH", MARTH)
        .value("ROY", ROY)
        .export_values();


    /* Struct and Class Declarations */
    py::class_<SeedInterval>(m, "SeedInterval")
        .def_readonly("startSeed", &SeedInterval::startSeed)
        .def_readonly("eventSeed", &SeedInterval::eventSeed)
        .def_readonly("endSeed", &SeedInterval::endSeed)
        .def_readonly("interval", &SeedInterval::interval)
        .def_readonly("success", &SeedInterval::success);

    // Bind classes + functions that will be called in python
    py::class_<RngEvent>(m, "RngEvent");

    py::class_<DelayEvent, RngEvent>(m, "DelayEvent")
        .def(py::init<uint32_t>());

    py::class_<IntEvent, RngEvent>(m, "IntEvent")
        .def(py::init<uint32_t, uint32_t, uint32_t>());

    py::class_<EventSequence>(m, "EventSequence")
        .def(py::init<>())
        .def("addEvent", &EventSequence::addEvent);

    py::class_<CharacterSequence>(m, "CharacterSequence")
        .def(py::init<>())
        .def("addCharacter", &CharacterSequence::addCharacter);

    
    /* Method Declarations */
    m.def("locateCharSequence", &locateCharSequence, "Searches for a seed that produces the given character sequence",
          py::arg("characters"));

    m.def("findSeed", &findSeed, "Locates a seed given an array of RNG Events",
          py::arg("events"), py::arg("startSeed"));

}