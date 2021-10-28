import rng
from rng import IntEvent as Int, DelayEvent as Delay

# Define event configs here
# Currently supported event types are INT and DELAY

class ConfigEntry:

    def __init__(self, label, events):
        self.label = label
        self.events = events

    def __str__(self):
        return f'Event: \'{self.label}\', Events: {self.events}'

SEARCH_TYPE_CHARACTER = 'character'

SEARCH_TYPES = [
    SEARCH_TYPE_CHARACTER,
]

entries = [
    ConfigEntry(
        'Peach Startup Beamsword Pull',
        [
            Delay(12),
            Int(128, 0, 0),
            Int(6, 5, 5),
        ]
    ),
    ConfigEntry(
        'Peach Airborne Spawn Beamsword Pull',
        [
            Delay(43),
            Int(128, 0, 0),
            Int(6, 5, 5),
        ]
    ),
    ConfigEntry(
        'Peach Startup Bomb Pull',
        [
            Delay(12),
            Int(128, 0, 0),
            Int(6, 0, 1),
        ]
    ),
]


# TODO: add pose, tag, options for seed location
searchEvents = {
    SEARCH_TYPE_CHARACTER: [
        ConfigEntry(
            'Doc',
            [
                Int(25, 0, 0),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Mario',
            [
                Int(25, 1, 1),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Luigi',
            [
                Int(25, 2, 2),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Bowser',
            [
                Int(25, 3, 3),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Peach',
            [
                Int(25, 4, 4),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Yoshi',
            [
                Int(25, 5, 5),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'DK',
            [
                Int(25, 6, 6),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Falcon',
            [
                Int(25, 7, 7),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Ganon',
            [
                Int(25, 8, 8),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Falco',
            [
                Int(25, 9, 9),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Fox',
            [
                Int(25, 10, 10),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Ness',
            [
                Int(25, 11, 11),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'ICs',
            [
                Int(25, 12, 12),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Kirby',
            [
                Int(25, 13, 13),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Samus',
            [
                Int(25, 14, 14),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Zelda',
            [
                Int(25, 15, 15),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Link',
            [
                Int(25, 16, 16),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Young Link',
            [
                Int(25, 17, 17),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Pichu',
            [
                Int(25, 18, 18),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Pikachu',
            [
                Int(25, 19, 19),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Jigglypuff',
            [
                Int(25, 20, 20),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Mewtwo',
            [
                Int(25, 21, 21),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Mr. G&W',
            [
                Int(25, 22, 22),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Marth',
            [
                Int(25, 23, 23),
                Delay(1),
            ]
        ),
        ConfigEntry(
            'Roy',
            [
                Int(25, 24, 24),
                Delay(1),
            ]
        ),
    ],
}


CHARACTER_IDS = [
    rng.DOC,
    rng.MARIO,
    rng.LUIGI,
    rng.BOWSER,
    rng.PEACH,
    rng.YOSHI,
    rng.DONKEY_KONG,
    rng.CAPTAIN_FALCON,
    rng.GANON,
    rng.FALCO,
    rng.FOX,
    rng.NESS,
    rng.ICE_CLIMBERS,
    rng.KIRBY,
    rng.SAMUS,
    rng.ZELDA,
    rng.LINK,
    rng.YOUNG_LINK,
    rng.PICHU,
    rng.PIKACHU,
    rng.JIGGLYPUFF,
    rng.MEWTWO,
    rng.MR_GAME_AND_WATCH,
    rng.MARTH,
    rng.ROY
]
