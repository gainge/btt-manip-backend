import re
from flask import Flask, render_template, request
import logging
from flask.json import jsonify

import api

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

# config flask server
app = Flask(__name__, static_folder='browser/static', template_folder='browser/templates')

@app.route("/")
def index():
    return render_template('index.html')

@app.route('/seed', methods=['GET'])
def getSeed():
    rawSeq = request.args.getlist('seq[]')
    
    # Validate length
    if len(rawSeq) < 1:
        return 'Invalid sequence length!', 403

    # Validate integer contents
    characterSequence = []
    try:
        characterSequence = [int(x) for x in rawSeq]
    except ValueError:
        logging.error('Error parsing character sequence')
        return 'Invalid character ID(s)', 403
    except Exception as e:
        logging.error(e)
        return 
    
    # Check domain of response
    if not all(x in range(0,25) for x in characterSequence):
        logging.error('Specified character IDs outside valid range!')
        return 'Invalid character ID(s)', 403

    seed = api.findSeed(characterSequence)
    result = {'seed': seed}
    return jsonify(result)

if __name__ == '__main__':
    print('Running app at: http://localhost:5000/')
    app.run(host='0.0.0.0')