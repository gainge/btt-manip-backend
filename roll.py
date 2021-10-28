
# Define the actions + their rolls to serve as the "coins"
class Action:

    def __init__(self, label, rolls, frames = 100, is_css = False):
        self.label = label
        self.rolls = rolls
        self.frames = frames
        self.is_css = is_css

    def getValue(self):
        return int((self.frames / self.rolls) * 1000)

    def __str__(self):
        return f'Action: \'{self.label}\', Rolls: {self.rolls}'


# Define RNG-calling actions in the form (label, rolls, frames, is css action)
# Frame measurements are approximate
# TODO: Adjust roll/frame ratios based on how things feel :P
items = [
    Action('Idle Animation', 1, 360, False),
    Action('Random Tag', 1, 20, True),
    Action('Random Character', 2, 20, True),
    Action('Shield', 9, 40, False),
    Action('Stage Load', 12, 400, True),
    Action('Standing Grab', 15, 35, False),
    Action('Up Tilt', 27, 39, False),
    Action('Upsmash', 40, 45, False),
    Action('Jump Airdodge', 62, 96, False),
    Action('Jump Land', 63, 86, False),         # fairly rough
    Action('Jump Double-Jump Airdodge', 72, 165, False),
    Action('Jump Double-Jump Land', 73, 150, False),
    Action('Jump Fair Land', 88, 96, False),
    Action('Jump Double-Jump Fair Land', 98, 144, False),
    Action('Charged Upsmash', 400, 125, False),
    Action('Charged Downsmash', 430, 140, False),         # SUUPER ROUGH FRAME ESTIMATE
]


MAX = 10000000000
STAGE_LOAD_ROLLS = 12
IN_GAME_THRESHOLD = 40 # approx no. rolls where in-game actions become faster than css manip
idle_animation_action = items[0]
stage_load_action = items[4]


def find_action_sequence(total, actions):
    # Initialize dp array
    dp = [MAX] * (total + 1)
    dp[0] = 0

    for i in range(1, total + 1):
        for action in actions:
            if action.rolls <= i:
                # Does this action offer a more efficient way to achieve the current rolls?
                dp[i] = min(dp[i - action.rolls] + action.getValue(), dp[i])
    
    # Now can we just backtrack like regular
    action_sequence = {}
    remainingValue = dp[total]
    remainingRolls = total

    while remainingRolls > 0:
        for action in reversed(actions):
            if (action.rolls <= remainingRolls and
                dp[remainingRolls - action.rolls] == (remainingValue - action.getValue())
                ):
                # Add to action sequence and decrement remaining rolls
                action_sequence[action] = action_sequence.get(action, 0) + 1
                remainingRolls = remainingRolls - action.rolls
                remainingValue = remainingValue - action.getValue()
                break
    
    return action_sequence



def get_action_string(action, count):
    return f'{count} - {action.label} ({action.rolls})'

def get_results_string(action_sequence, target_rolls):
    num_actions = sum(action_sequence.values())

    lines = []

    lines.append('')
    lines.append('----------------------------------')
    lines.append(f'Achievable in {num_actions} action{"s" if num_actions > 1 else ""}!')
    lines.append('----------------------------------')
    lines.append(f'Target: {target_rolls} rolls')
    lines.append('')

    # Always attempt to print the stage loads first
    if action_sequence.get(stage_load_action):
        lines.append(get_action_string(stage_load_action, action_sequence.get(stage_load_action)))

    # Now iterate normally, skipping stage load
    for action, count in action_sequence.items():
        if action == stage_load_action:
            continue
        else:
            lines.append(get_action_string(action, count))
    lines.append('')

    return '\n'.join(lines)


def getActionSequence(rollCount, isCSSManip):
    adjusted_rolls = rollCount
    available_actions = items

    if not isCSSManip:
        # In-Game, filter out CSS exclusive items
        available_actions = list(filter(lambda x: not x.is_css, items))
    else:
        if rollCount > IN_GAME_THRESHOLD: # Determine if the roll-count is low enough stay in CSS
            adjusted_rolls -= STAGE_LOAD_ROLLS # TODO: add support for IBG, 13 rolls instead of 12
        else:
            # Roll count too low, do not use in-game actions
            available_actions = list(filter(lambda x: x.is_css, items))


    # Determine the action sequence
    action_sequence = find_action_sequence(adjusted_rolls, available_actions)

    # Add in Stage load action if applicable
    if isCSSManip and rollCount > IN_GAME_THRESHOLD:
        action_sequence[stage_load_action] = action_sequence.get(stage_load_action, 0) + 1


    return get_results_string(action_sequence, rollCount)