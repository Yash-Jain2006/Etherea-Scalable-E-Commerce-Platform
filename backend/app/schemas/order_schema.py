from marshmallow import Schema, fields

class OrderItemSchema(Schema):
    id = fields.Int(dump_only=True)
    product_id = fields.Int(required=True)
    product_name = fields.Str(dump_only=True)
    product_image = fields.Str(dump_only=True)
    quantity = fields.Int(required=True)
    unit_price = fields.Decimal(as_string=True, dump_only=True)
    subtotal = fields.Decimal(as_string=True, dump_only=True)

class OrderSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    status = fields.Str(dump_only=True)
    subtotal = fields.Decimal(as_string=True, dump_only=True)
    shipping_fee = fields.Decimal(as_string=True, dump_only=True)
    total = fields.Decimal(as_string=True, dump_only=True)
    payment_method = fields.Str(required=True)
    payment_status = fields.Str(dump_only=True)
    shipping_address = fields.Dict(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    items = fields.List(fields.Nested(OrderItemSchema), dump_only=True)
