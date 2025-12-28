"""
Transaction Service - Microservice for transaction management
Handles deposits, withdrawals, transfers, and transaction history
"""
from flask import Flask
from flask_cors import CORS
from flask_graphql import GraphQLView
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))
from config import SERVICE_PORTS, CORS_ORIGINS, TRANSACTION_API_KEY
from schema import schema
from flask import request, jsonify, abort
from models import Transaction

app = Flask(__name__)
CORS(app, origins=CORS_ORIGINS)

# Optional debug logging for GraphQL requests. Set DEBUG_GRAPHQL=1 to enable.
@app.before_request
def _log_graphql_request_body():
    try:
        if request.path == '/graphql' and request.method == 'POST':
            data = request.get_data(as_text=True)
            # Log at INFO to ensure visibility in container logs
            app.logger.info('GraphQL request body: %s', data)
    except Exception:
        pass

# GraphQL endpoint
app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True)
)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'transaction-service'}), 200


@app.route('/payments/create', methods=['POST'])
def create_payment_request():
    """Create a pending payment request (external systems can call this)"""
    data = request.get_json() or {}
    amount = data.get('amount')
    description = data.get('description')
    idempotency_key = data.get('idempotency_key')
    qr_payload = data.get('qr_payload')

    # API key protection (optional)
    if TRANSACTION_API_KEY:
        api_key = request.headers.get('X-API-KEY')
        if not api_key or api_key != TRANSACTION_API_KEY:
            abort(401, 'Invalid API key')

    if amount is None:
        abort(400, 'amount is required')
    try:
        amount = float(amount)
    except Exception:
        abort(400, 'amount must be a number')

    if amount <= 0:
        abort(400, 'amount must be greater than zero')

    tx_id = Transaction.create_payment_request(amount, description=description, idempotency_key=idempotency_key, qr_payload=qr_payload)
    return jsonify({'transaction_id': tx_id, 'status': 'pending'}), 201


@app.route('/payments/confirm', methods=['POST'])
def confirm_payment():
    """Confirm a pending payment by idempotency_key (e.g., webhook callback)"""
    data = request.get_json() or {}
    idempotency_key = data.get('idempotency_key')
    provider_reference = data.get('provider_reference')

    if not idempotency_key:
        abort(400, 'idempotency_key is required')

    # API key protection (optional)
    if TRANSACTION_API_KEY:
        api_key = request.headers.get('X-API-KEY')
        if not api_key or api_key != TRANSACTION_API_KEY:
            abort(401, 'Invalid API key')

    try:
        tx_id = Transaction.confirm_payment_by_idempotency(idempotency_key, provider_reference=provider_reference)
        return jsonify({'transaction_id': tx_id, 'status': 'completed'}), 200
    except Exception as e:
        abort(404, str(e))


@app.route('/payments/<int:transaction_id>', methods=['GET'])
def get_payment(transaction_id):
    tx = Transaction.get_by_id(transaction_id)
    if not tx:
        abort(404, 'Transaction not found')
    return jsonify(tx), 200


@app.route('/integrations/food_delivery/charge', methods=['POST'])
def food_delivery_charge():
    """Endpoint for Food Delivery system to charge a user's wallet (transfer to merchant or withdraw).
    Requires X-API-KEY header if TRANSACTION_API_KEY is set.
    """
    data = request.get_json() or {}
    user_id = data.get('user_id')
    amount = data.get('amount')
    merchant_id = data.get('merchant_id')
    idempotency_key = data.get('idempotency_key')
    description = data.get('description')

    # API key protection
    if TRANSACTION_API_KEY:
        api_key = request.headers.get('X-API-KEY')
        if not api_key or api_key != TRANSACTION_API_KEY:
            abort(401, 'Invalid API key')

    if user_id is None or amount is None:
        abort(400, 'user_id and amount are required')

    try:
        amount = float(amount)
    except Exception:
        abort(400, 'amount must be a number')

    if amount <= 0:
        abort(400, 'amount must be greater than zero')

    try:
        if merchant_id:
            tx = Transaction.transfer_atomic(user_id, merchant_id, amount, description=description or f'Charge to merchant {merchant_id}', idempotency_key=idempotency_key)
            if isinstance(tx, dict):
                return jsonify(tx), 201
            return jsonify(Transaction.get_by_id(tx)), 201
        else:
            tx = Transaction.withdraw_atomic(user_id, amount, payment_method='food_delivery', description=description, idempotency_key=idempotency_key)
            return jsonify(Transaction.get_by_id(tx)), 201
    except Exception as e:
        abort(400, str(e))

if __name__ == '__main__':
    port = SERVICE_PORTS['transaction']
    app.run(host='0.0.0.0', port=port, debug=True)

