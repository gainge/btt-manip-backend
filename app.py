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
    characterSequence = request.args.getlist('seq[]')
    # TODO: validate this list lol
    seed = api.findSeed(characterSequence)
    result = {'seed': seed}
    return jsonify(result)

if __name__ == '__main__':
    print('Running app at: http://localhost:5000/')
    app.run('0.0.0.0')