from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, BooleanField, FloatField, IntegerField
from wtforms.validators import DataRequired, NumberRange, Optional, IPAddress

class NodeForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired()])
    status = BooleanField('Status (Online/Offline)', default=True)
    latitude = FloatField('Latitude', validators=[Optional()])
    longitude = FloatField('Longitude', validators=[Optional()])
    ip_address = StringField('IP Address', validators=[Optional(), IPAddress()])
    temperature = FloatField('Temperature', validators=[Optional()])
    device_type = StringField('Device Type', validators=[Optional()])
    battery_level = FloatField('Battery Level', validators=[Optional()])
    submit = SubmitField('Submit')

class LinkForm(FlaskForm):
    source = IntegerField('Source Node ID', validators=[DataRequired(), NumberRange(min=1)])
    target = IntegerField('Target Node ID', validators=[DataRequired(), NumberRange(min=1)])
    link_type = StringField('Link Type', validators=[Optional()])
    distance = FloatField('Distance', validators=[Optional()])
    bandwidth = FloatField('Bandwidth', validators=[Optional()])
    latency = FloatField('Latency', validators=[Optional()])
    submit = SubmitField('Submit')

    def validate(self):
        if self.source.data == self.target.data:
            self.source.errors.append("Source and target nodes cannot be the same.")
            return False

        return True
