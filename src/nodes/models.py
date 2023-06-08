from datetime import datetime

from src import db

class Node(db.Model):
    __tablename__ = "nodes"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    created_on = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.Boolean, nullable=False, default=True)
    last_updated = db.Column(db.DateTime, nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    ip_address = db.Column(db.String, nullable=True)
    temperature = db.Column(db.Float, nullable=True)
    device_type = db.Column(db.String, nullable=True)
    battery_level = db.Column(db.Float, nullable=True)

    def __init__(self, name, status=True, latitude=None, longitude=None, ip_address=None, temperature=None, device_type=None, battery_level=None):
        self.name = name
        self.status = status
        self.created_on = datetime.now()
        self.latitude = latitude
        self.longitude = longitude
        self.ip_address = ip_address
        self.temperature = temperature
        self.device_type = device_type
        self.battery_level = battery_level

    def __repr__(self):
        return f"<name {self.name}>"

class Link(db.Model):
    __tablename__ = "links"

    id = db.Column(db.Integer, primary_key=True)
    source = db.Column(db.Integer, db.ForeignKey('nodes.id'), nullable=False)
    target = db.Column(db.Integer, db.ForeignKey('nodes.id'), nullable=False)
    link_type = db.Column(db.String, nullable=True)
    distance = db.Column(db.Float, nullable=True)
    bandwidth = db.Column(db.Float, nullable=True)
    latency = db.Column(db.Float, nullable=True)
    created_on = db.Column(db.DateTime, nullable=False)
    last_updated = db.Column(db.DateTime, nullable=True)

    def __init__(self, source, target, link_type=None, distance=None, bandwidth=None, latency=None):
        self.source = source
        self.target = target
        self.created_on = datetime.now()
        self.link_type = link_type
        self.distance = distance
        self.bandwidth = bandwidth
        self.latency = latency

    def __repr__(self):
        return f"<source {self.source} target {self.target}>"
