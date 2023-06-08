from flask import Blueprint, render_template, flash, redirect, url_for
from flask_login import login_required, current_user
from functools import wraps

from src.accounts.models import User
from src.nodes.models import Node,Link
from src import db

admin_bp = Blueprint("admin", __name__)

# Admin Required Decorator
def admin_required(func):
    @wraps(func)
    def decorated_view(*args, **kwargs):
        if not current_user.is_admin:
            flash('You are not authorized to access this page.', 'danger')
            return redirect(url_for("core.home"))
        return func(*args, **kwargs)
    return decorated_view



@admin_bp.route("/admin", methods=['GET', 'POST'])
@login_required
@admin_required
def admin():
    users = User.query.order_by(User.id).all()
    nodes = Node.query.order_by(Node.id).all()
    links = Link.query.order_by(Link.id).all()
    node_dict = {node.id: node.name for node in nodes}
    return render_template('admin/admin.html', users=users, nodes=nodes, links=links, node_dict=node_dict)

