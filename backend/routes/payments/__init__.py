from flask import Blueprint
from flask_restful import Api
from .payments import (
    PaymentPlans, MockCheckout, PayPalWebhook,
    PaymentList, PaymentDetail, ProcessPayment
)

# Create blueprint
payments_bp = Blueprint('payments', __name__)

# Create API instance
payments_api = Api(payments_bp)

# Register routes
payments_api.add_resource(PaymentPlans, '/plans')
payments_api.add_resource(MockCheckout, '/mock-checkout')
payments_api.add_resource(PayPalWebhook, '/paypal-webhook')
payments_api.add_resource(PaymentList, '')
payments_api.add_resource(PaymentDetail, '/<int:payment_id>')
payments_api.add_resource(ProcessPayment, '/<int:payment_id>/process')

