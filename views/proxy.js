var Backbone =  require('backbone');
_ = require('underscore');
var L = require('leaflet');
var common = require('couchmap-common');

module.exports = Backbone.View.extend({
  initialize: function(options) {
    this.CoarseView = options.CoarseView || require('./coarse');
    this.FineView = options.FineView || require('./fine');

    // create map and add OpenStreetMap tile layer
    this.map = L.map(this.el, {center: [10, 0], zoom: 2} );
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);
    this.map.on('moveend', this.update_bbox, this);

    this.listenTo(this.model, {
      'fine': this.render.bind(this, 'fine'),
      'coarse': this.render.bind(this, 'coarse')
    });
    this.update_bbox();
  },
  update_bbox: function() {
    var bbox = common.bbox(this.map.getBounds());
    var zoom = common.validate_zoom(this.map.getZoom()+1);
    this.trigger('bbox', bbox, zoom);
    this.model.update(bbox, zoom);
  },
  render: function(mode) {
    if (this.mode!=mode) {
      this.mode = mode;
      if (this.subview) {
        this.subview.remove();
      }
      if (this.mode=='coarse') {
        this.subview = new this.CoarseView(_.extend(this.coarse_options || {}, {
          mapView: this,
          collection: this.model.get('coarse_coll')
        }));
      } else {
        this.subview = new this.FineView(_.extend(this.fine_options || {}, {
          mapView: this,
          collection: this.model.get('fine_coll')
        }));
      }
    }
  },
  remove: function() {
    if (this.subview) {
      this.subview.remove();
    }
  }
});
