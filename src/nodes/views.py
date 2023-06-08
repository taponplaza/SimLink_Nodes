from flask import Blueprint, render_template, flash, redirect, url_for, request
from src import db
from .forms import NodeForm, LinkForm
from src.nodes.models import Node,Link
from src.admin.views import admin_required


nodes_bp = Blueprint("nodes", __name__)

@nodes_bp.route('/nodes', methods=['GET', 'POST'])
@admin_required
def nodes():
    form = NodeForm(request.form)
    if form.validate_on_submit():
        existing_node = Node.query.filter_by(name=form.name.data).first()
        if existing_node:
            existing_node.latitude = form.latitude.data
            existing_node.longitude = form.longitude.data
            existing_node.ip_address = form.ip_address.data
            existing_node.device_type = form.device_type.data
            db.session.commit()
            flash("Node has been updated ", "success")
        else:
            node = Node(name=form.name.data,
                        status=form.status.data,
                        latitude=form.latitude.data,
                        longitude=form.longitude.data,
                        ip_address=form.ip_address.data,
                        device_type=form.device_type.data)
            db.session.add(node)
            db.session.commit()
            flash("Node has been added ", "success")

        return redirect(url_for('nodes.nodes'))
    return render_template('nodes/nodes.html', form=form)


@nodes_bp.route('/links', methods=['GET', 'POST'])
@admin_required
def links():
    nodes = Node.query.all()
    form = LinkForm(request.form)

    if form.validate_on_submit():
        source = Node.query.filter_by(id=form.source.data).first()
        target = Node.query.filter_by(id=form.target.data).first()

        if source and target:
            existing_link = Link.query.filter_by(source=form.source.data, target=form.target.data).first()
            if existing_link:
                existing_link.link_type = form.link_type.data
                existing_link.distance = form.distance.data
                existing_link.bandwidth = form.bandwidth.data
                db.session.commit()
                flash("Link has been updated ", "success")
            else:
                link = Link(source=source.id,
                            target=target.id,
                            link_type=form.link_type.data,
                            distance=form.distance.data,
                            bandwidth=form.bandwidth.data)
                db.session.add(link)
                db.session.commit()
                flash("Link has been added ", "success")
        else:
            flash('Error: Source and/or target nodes do not exist', 'danger')
        
        return redirect(url_for('nodes.links'))

    return render_template('nodes/links.html', form=form, nodes=nodes)