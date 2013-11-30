var Backbone =  require('backbone');
_ = require('underscore');
var L = require('leaflet');
var common = require('couchmap-common');

/* options:
   mapView: mandatory, the mapView (mapView.map has to be the leaflet object)
*/
module.exports = Backbone.View.extend({
  initialize: function(options) {
    this.options = options;
    this.mapView = options.mapView;
    this.CoarseView = options.CoarseView || require('./coarse');
    this.FineView = options.FineView || require('./fine');

    this.mapView.map.on('moveend', this.update_bbox, this);

    this.listenTo(this.model, {
      'fine': this.render.bind(this, 'fine'),
      'coarse': this.render.bind(this, 'coarse')
    });
    this.update_bbox();
  },
  update_bbox: function() {
    var bbox = common.bbox(this.mapView.map.getBounds());
    var zoom = common.validate_zoom(this.mapView.map.getZoom()+1);
    this.trigger('bbox', bbox, zoom);
    this.model.update(bbox, zoom);
  },
  render: function(mode) {
    if (this.mode!=mode) {
      this.mode = mode;
      this.removeSubviews();
      if (this.mode=='coarse') {
        this.subview = new this.CoarseView(_.extend(this.coarse_options || {}, {
          proxyView: this,
          collection: this.model.get('coarse_coll')
        }));
      } else {
        this.subview = new this.FineView(_.extend(this.fine_options || {}, {
          proxyView: this,
          collection: this.model.get('fine_coll')
        }));
      }
    }
  },
  removeSubviews: function() {
    if (this.subview) {
      this.subview.remove();
    }
  },
  remove: function() {
    this.removeSubviews();
    Backbone.View.prototype.remove.call(this);
  }
});
