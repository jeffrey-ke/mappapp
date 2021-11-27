from flask import Flask, jsonify, request
import json
app = Flask(__name__)
@app.route('/')
def home():
    return "This is an API for traffic data"

#this is the api call: here is where I receive coordinates, and return a json of the actual traffic data
@app.route('/mappapp', methods=['GET'])
def api():
    val = ('dow' in request.args) and ('lat' in request.args) and ('lng' in request.args)
    if val:
        dow = int(request.args['dow'])
        lat = float(request.args['lat'])
        lng = float(request.args['lng'])
    else:
        return "Error: Not all fields given"

    #morning will be 10am

    #afternoon will be 2pm

    #evening will be 6pm

    result = {"morning": 5, "afternoon": 222, "evening": 12}
    return jsonify(result)
