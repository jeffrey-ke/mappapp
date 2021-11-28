from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import requests

import json
app = Flask(__name__)
CORS(app, supports_credentials=True)

key = 'ZBZ4eiytk908RyTjNkoHinzopH4PN4ID'

@app.route('/')
def home():
    return "This is an API for traffic data"

@app.route('/mappapp', methods=['GET'])
def api():
    val = ('dow' in request.args) and ('lat' in request.args) and ('lng' in request.args)
    if val:
        dow = int(request.args['dow'])
        lat = float(request.args['lat'])
        lng = float(request.args['lng'])
    else:
        return "Error: Not all fields given"
        
    r = requests.get('https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json?point=' + str(lat) + '%2C' + str(lng) + '&key=' + key).json()

    speed = r["flowSegmentData"]["currentSpeed"]
    result = {"morning": speed, "afternoon": speed, "evening": speed}
    return jsonify(result)

if __name__ == '__main__':
   app.run(debug = True)
