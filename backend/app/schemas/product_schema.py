from marshmallow import Schema, fields, validate

class CategorySchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    slug = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    description = fields.Str()
    created_at = fields.DateTime(dump_only=True)
    product_count = fields.Method("get_product_count", dump_only=True)

    def get_product_count(self, obj):
        return len(obj.products)

class ProductSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=2, max=255))
    slug = fields.Str(required=True, validate=validate.Length(min=2, max=255))
    description = fields.Str()
    price = fields.Decimal(required=True, as_string=True)
    stock_quantity = fields.Int(required=True, validate=validate.Range(min=0))
    image_url = fields.Str(allow_none=True)
    image_key = fields.Str(allow_none=True)
    category_id = fields.Int(required=True)
    category_name = fields.Str(dump_only=True)
    is_active = fields.Bool()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
