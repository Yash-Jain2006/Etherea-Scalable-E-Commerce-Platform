from marshmallow import Schema, fields, validate

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    email = fields.Email(required=True, validate=validate.Length(max=255))
    password = fields.Str(required=True, load_only=True, validate=validate.Length(min=8))
    full_name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    role = fields.Str(dump_only=True)
    is_active = fields.Bool(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)
