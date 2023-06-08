import os
from src.nodes.models import Node,Link
from flask import Blueprint, render_template, jsonify, make_response, json
from flask_login import login_required

core_bp = Blueprint("core", __name__)


@core_bp.route("/")
@login_required
def home():
    return render_template("core/index.html")

@core_bp.route("/get-graph", methods=["POST"])
@login_required
def get_graph():
    nodes = Node.query.all()
    links = Link.query.all()

    nodes_data = [
        {
            "id": node.id,
            "name": node.name,
            "lat": node.latitude,
            "long": node.longitude,
            "status": node.status,
            "ip": node.ip_address,
            "type": node.device_type
        } for node in nodes
    ]

    # Create a dictionary for easy lookup of node coordinates
    node_coordinates = {node["id"]: (node["lat"], node["long"]) for node in nodes_data}

    links_data = [
        {
            "source": link.source,
            "target": link.target,
            "source_coords": node_coordinates[link.source],
            "target_coords": node_coordinates[link.target]
        } for link in links
    ]

    response_data = {"nodes": nodes_data, "links": links_data}
    response = make_response(jsonify(response_data), 200)
    return response


@core_bp.route("/event",)
@login_required
def event():
    return render_template('core/event.html')