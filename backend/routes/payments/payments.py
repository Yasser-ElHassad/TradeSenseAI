import time
from flask_restful import Resource
from flask import request, g
from extensions import db
from models import Payment, Challenge, User
from utils.auth_utils import token_required

# Pricing plans configuration
PRICING_PLANS = {
    'Starter': {
        'price': 200,
        'currency': 'DH',
        'balance': 5000,
        'balance_currency': 'USD',
        'max_daily_loss_percent': 5.0,
        'max_total_loss_percent': 10.0,
        'profit_target_percent': 10.0
    },
    'Pro': {
        'price': 500,
        'currency': 'DH',
        'balance': 10000,
        'balance_currency': 'USD',
        'max_daily_loss_percent': 5.0,
        'max_total_loss_percent': 10.0,
        'profit_target_percent': 10.0
    },
    'Elite': {
        'price': 1000,
        'currency': 'DH',
        'balance': 25000,
        'balance_currency': 'USD',
        'max_daily_loss_percent': 5.0,
        'max_total_loss_percent': 10.0,
        'profit_target_percent': 10.0
    }
}


class PaymentPlans(Resource):
    """Get available pricing plans endpoint"""
    
    def get(self):
        """Return all available pricing plans"""
        plans = []
        for plan_type, details in PRICING_PLANS.items():
            plans.append({
                'plan_type': plan_type,
                'price': details['price'],
                'currency': details['currency'],
                'balance': details['balance'],
                'balance_currency': details['balance_currency'],
                'max_daily_loss_percent': details['max_daily_loss_percent'],
                'max_total_loss_percent': details['max_total_loss_percent'],
                'profit_target_percent': details['profit_target_percent']
            })
        
        return {
            'plans': plans,
            'message': 'Available pricing plans retrieved successfully'
        }, 200


class MockCheckout(Resource):
    """Mock payment checkout endpoint"""
    
    @token_required
    def post(self):
        """Process mock payment and create challenge"""
        data = request.get_json()
        
        if not data:
            return {'error': 'No data provided'}, 400
        
        plan_type = data.get('plan_type')
        payment_method = data.get('payment_method')
        
        # Validate required fields
        if not plan_type:
            return {'error': 'plan_type is required'}, 400
        
        if not payment_method:
            return {'error': 'payment_method is required'}, 400
        
        # Validate and normalize plan_type (case-insensitive matching)
        if not plan_type or not plan_type.strip():
            return {
                'error': 'Invalid plan_type',
                'message': 'plan_type cannot be empty'
            }, 400
        
        plan_type_input = plan_type.strip()
        plan_type_normalized = None
        
        # Case-insensitive matching against available plans
        for key in PRICING_PLANS.keys():
            if key.lower() == plan_type_input.lower():
                plan_type_normalized = key
                break
        
        if plan_type_normalized not in PRICING_PLANS:
            return {
                'error': 'Invalid plan_type',
                'message': f'Plan type must be one of: {", ".join(PRICING_PLANS.keys())}'
            }, 400
        
        plan_type = plan_type_normalized
        
        # Validate payment_method
        valid_payment_methods = ['CMI', 'Crypto', 'PayPal']
        if payment_method not in valid_payment_methods:
            return {
                'error': 'Invalid payment_method',
                'message': f'Payment method must be one of: {", ".join(valid_payment_methods)}'
            }, 400
        
        # Get current user
        user = g.current_user
        plan_details = PRICING_PLANS[plan_type]
        
        # Simulate 2-second payment processing
        time.sleep(2)
        
        try:
            # Create new Challenge
            challenge = Challenge(
                user_id=user.id,
                plan_type=plan_type,
                starting_balance=plan_details['balance'],
                current_balance=plan_details['balance'],
                status='active',
                max_daily_loss_percent=plan_details['max_daily_loss_percent'],
                max_total_loss_percent=plan_details['max_total_loss_percent'],
                profit_target_percent=plan_details['profit_target_percent']
            )
            
            db.session.add(challenge)
            db.session.flush()  # Flush to get challenge.id
            
            # Create Payment record
            payment = Payment(
                user_id=user.id,
                challenge_id=challenge.id,
                amount=plan_details['price'],
                currency=plan_details['currency'],
                payment_method=payment_method,
                status='completed'
            )
            
            db.session.add(payment)
            db.session.commit()
            
            return {
                'success': True,
                'message': 'Payment processed successfully',
                'challenge_id': challenge.id,
                'payment_id': payment.id,
                'challenge': challenge.to_dict(),
                'payment': payment.to_dict()
            }, 201
        
        except Exception as e:
            db.session.rollback()
            return {
                'error': 'Payment processing failed',
                'message': str(e)
            }, 500


class PayPalWebhook(Resource):
    """Handle PayPal IPN (Instant Payment Notification) webhooks"""
    
    def post(self):
        """Process PayPal webhook notifications"""
        data = request.get_json() or request.form.to_dict()
        
        # PayPal IPN verification would typically involve:
        # 1. Sending the notification back to PayPal for verification
        # 2. Verifying the signature
        # 3. Checking the transaction status
        
        # Extract payment information from webhook
        payment_id = data.get('payment_id') or data.get('txn_id')
        payment_status = data.get('payment_status') or data.get('status')
        amount = data.get('amount') or data.get('mc_gross')
        
        if not payment_id:
            return {
                'error': 'Invalid webhook data',
                'message': 'payment_id or txn_id is required'
            }, 400
        
        # Map PayPal payment status to our status
        status_mapping = {
            'Completed': 'completed',
            'Pending': 'pending',
            'Failed': 'failed',
            'Refunded': 'failed',
            'Denied': 'failed',
            'Canceled_Reversal': 'failed',
            'Reversed': 'failed'
        }
        
        our_status = status_mapping.get(payment_status, 'pending')
        
        try:
            # Find payment by ID or transaction ID
            # In a real implementation, you'd store PayPal transaction IDs
            payment = Payment.query.filter_by(id=payment_id).first()
            
            if not payment:
                # Try to find by challenge_id if payment_id references challenge
                return {
                    'error': 'Payment not found',
                    'message': f'Payment with ID {payment_id} not found'
                }, 404
            
            # Update payment status
            payment.status = our_status
            
            # If payment is completed and challenge wasn't created, create it
            if our_status == 'completed' and not payment.challenge_id:
                # This is a safety check - challenge should already exist
                # But in case of webhook arriving before checkout completion
                pass
            
            db.session.commit()
            
            return {
                'success': True,
                'message': 'Webhook processed successfully',
                'payment_id': payment.id,
                'status': payment.status
            }, 200
        
        except Exception as e:
            db.session.rollback()
            return {
                'error': 'Webhook processing failed',
                'message': str(e)
            }, 500


class PaymentList(Resource):
    """Get all payments for current user"""
    
    @token_required
    def get(self):
        """Get all payments for the authenticated user"""
        user = g.current_user
        payments = Payment.query.filter_by(user_id=user.id).order_by(Payment.created_at.desc()).all()
        
        return {
            'payments': [payment.to_dict() for payment in payments],
            'count': len(payments)
        }, 200


class PaymentDetail(Resource):
    """Get or update a specific payment"""
    
    @token_required
    def get(self, payment_id):
        """Get a specific payment"""
        user = g.current_user
        payment = Payment.query.filter_by(id=payment_id, user_id=user.id).first()
        
        if not payment:
            return {
                'error': 'Payment not found',
                'message': f'Payment with ID {payment_id} not found'
            }, 404
        
        return {
            'payment': payment.to_dict(),
            'challenge': payment.challenge.to_dict() if payment.challenge else None
        }, 200
    
    @token_required
    def put(self, payment_id):
        """Update a payment (admin only or for specific status updates)"""
        user = g.current_user
        payment = Payment.query.filter_by(id=payment_id, user_id=user.id).first()
        
        if not payment:
            return {
                'error': 'Payment not found',
                'message': f'Payment with ID {payment_id} not found'
            }, 404
        
        data = request.get_json()
        if not data:
            return {'error': 'No data provided'}, 400
        
        # Only allow status updates in specific cases
        if 'status' in data and user.is_admin:
            payment.status = data['status']
            db.session.commit()
            return {
                'message': 'Payment updated successfully',
                'payment': payment.to_dict()
            }, 200
        
        return {
            'error': 'Unauthorized',
            'message': 'You do not have permission to update this payment'
        }, 403


class ProcessPayment(Resource):
    """Process a payment endpoint (alternative to mock-checkout)"""
    
    @token_required
    def post(self, payment_id):
        """Process a pending payment"""
        user = g.current_user
        payment = Payment.query.filter_by(id=payment_id, user_id=user.id).first()
        
        if not payment:
            return {
                'error': 'Payment not found',
                'message': f'Payment with ID {payment_id} not found'
            }, 404
        
        if payment.status != 'pending':
            return {
                'error': 'Invalid payment status',
                'message': f'Payment is already {payment.status}'
            }, 400
        
        # Process payment (similar to mock-checkout logic)
        try:
            payment.status = 'completed'
            
            # If challenge doesn't exist, create it
            if not payment.challenge_id:
                # Determine plan type from payment amount
                plan_type = None
                for pt, details in PRICING_PLANS.items():
                    if details['price'] == payment.amount:
                        plan_type = pt
                        break
                
                if plan_type:
                    plan_details = PRICING_PLANS[plan_type]
                    challenge = Challenge(
                        user_id=user.id,
                        plan_type=plan_type,
                        starting_balance=plan_details['balance'],
                        current_balance=plan_details['balance'],
                        status='active',
                        max_daily_loss_percent=plan_details['max_daily_loss_percent'],
                        max_total_loss_percent=plan_details['max_total_loss_percent'],
                        profit_target_percent=plan_details['profit_target_percent']
                    )
                    db.session.add(challenge)
                    db.session.flush()
                    payment.challenge_id = challenge.id
            
            db.session.commit()
            
            return {
                'success': True,
                'message': 'Payment processed successfully',
                'payment': payment.to_dict()
            }, 200
        
        except Exception as e:
            db.session.rollback()
            return {
                'error': 'Payment processing failed',
                'message': str(e)
            }, 500
