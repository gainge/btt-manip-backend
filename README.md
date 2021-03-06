# Peach BTT RNG Manip
Web tool for Melee RNG manipulation in Peach's break the targets.  Use the CSS to locate your seed then perform the specified actions to manip.

This project is heavily inspired by and based on the previous manip work done by Savestate https://github.com/Savestate2A03/ssbm_rng_manip/. Huge thanks to Savestate and their contributions.

# Usage
Every manip consists of two parts:
* Locating the Seed by rolling random characters
* Performing the Manip via in-game actions

To Manip for a pull:

**Roll** random characters in-game and enter them with the UI on the page. Click the "search" button once enough characters have been entered.

![Example of a search being performed](https://i.imgur.com/qGTNOZk.png "Example search")

The first search requires 9 characters, while all subsequent searches require at least 4.

Once the seed is found, an **action sequence** will be displayed along with corresponding information regarding the RNG event. An example action sequence may be:
```
----------------------------------
Achievable in 7 actions
----------------------------------
Manip Stage: [PEACH]
Target: 1077 rolls

1 - Stage Load (12)
2 - Charged Upsmash (400)
2 - Jump Fair Land (88)
1 - Jump Airdodge Land (62)
1 - Up Tilt (27)
```

**Perform** the specified actions in __Peach's break the targets__ to execute the manip. After completing the manip, your next run will start at the configured pull.

![Example of manip in process](https://i.imgur.com/mqtg0P3.png "Example manip action")

For a good (very long) example of what it looks like to manip, see [this video](https://youtu.be/K2MecScQkx8)

***Note*: It's possible for your game's seed and the application's internal seed to become desynced for a number of reasons. If you feel this may have happened or keep missing pulls, you can always click the "reset" button to re-locate the seed with a new 9-character sequence

# Building Locally
This project uses Flask and Pybind, and can be run locally if you have python installed.

First clone the repository and install the necessary dependencies:


`python3 -m pip install -r requirements.txt`

Then, build the seed-locating library by following the [build instructions for Pybind.](https://pybind11.readthedocs.io/en/stable/compiling.html?highlight=dynamic_lookup#building-manually)

### For Linux/WSL
`c++ -O3 -Wall -shared -std=c++11 -fPIC $(python3 -m pybind11 --includes) rng.cpp -o rng$(python3-config --extension-suffix)`

### For MacOS
`c++ -O3 -Wall -shared -std=c++11 -undefined dynamic_lookup $(python3 -m pybind11 --includes) rng.cpp -o rng$(python3-config --extension-suffix)`

You can then run the project with `python3 app.py` and visit it at `http://localhost:5000`