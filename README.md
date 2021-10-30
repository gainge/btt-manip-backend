# Peach BTT RNG Manip
Web tool for Melee RNG manipulation in Peach's break the targets.

Use the CSS to locate your seed then perform the specified actions to manip.

# Usage
Every manip consists of two parts:
* Locating the Seed by rolling random characters
* Performing the Manip via in-game actions

To Manip for a pull:

**Roll** random characters in-game and enter them with the UI on the page. Click the "search" button once enough characters have been entered.

![Example of a search being performed](https://i.imgur.com/qGTNOZk.png "Example search")

The first search requires 9 characters, while all subsequent searches require at least 4.

Once the seed is found, an action sequence will be displayed along with corresponding information regarding the RNG event. An example Action sequence may be:
```
----------------------------------
Achievable in 7 actions
----------------------------------
Target: 1077 rolls

1 - Stage Load (12)
2 - Charged Upsmash (400)
2 - Jump Fair Land (88)
1 - Jump Airdodge (62)
1 - Up Tilt (27)
```

**Perform** the specified actions in __Peach's break the targets__ to perform the manip.

For a good (very long) example of what it looks like to manip, see [this video](https://youtu.be/K2MecScQkx8)

***Note*: It's possible for your game's seed and the application's internal seed to become desynced for a number of reasons. If you feel this may have happened, you can always click the "reset" button to re-locate the seed with a new 9-character sequence

# Building Locally
This project uses Flask and Pybind, and can be run locally if you have python installed.

First install the necessary dependencies:


`pip install -r requirements.txt`

Then, build the seed-locating library by following the [build instructions for Pybind.](https://pybind11.readthedocs.io/en/stable/compiling.html?highlight=dynamic_lookup#building-manually)

### For Linux/WSL
`c++ -O3 -Wall -shared -std=c++11 -fPIC $(python3 -m pybind11 --includes) rng.cpp -o rng$(python3-config --extension-suffix)`

### For MacOS
`c++ -O3 -Wall -shared -std=c++11 -undefined dynamic_lookup $(python3 -m pybind11 --includes) rng.cpp -o rng$(python3-config --extension-suffix)`