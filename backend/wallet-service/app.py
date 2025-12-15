"""
Wallet Service - Microservice for wallet management
Handles balance, points, and wallet operations
"""
from flask import Flask
from flask_cors import CORS
from flask_graphql import GraphQLView
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))
from config import SERVICE_PORTS, CORS_ORIGINS
from schema import schema

app = Flask(__name__)
CORS(app, origins=CORS_ORIGINS)

# GraphQL endpoint
app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True)
)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    from flask import jsonify
    return jsonify({'status': 'healthy', 'service': 'wallet-service'}), 200

if __name__ == '__main__':
    port = SERVICE_PORTS['wallet']
    app.run(host='0.0.0.0', port=port, debug=True)

