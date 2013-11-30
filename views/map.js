var Backbone =  require('backbone');
_ = require('underscore');
var L = require('leaflet');

/* options:
   addDefaultLayer: optional (default: true)
   zoomTo: optional (default: 'world'), possible values:
           undefined: no zoom,
           'world': zoom to world bounds
           a bbox object can also be supplied
*/
module.exports = Backbone.View.extend({
  initialize: function(options) {
    this.map = L.map(this.el, options.mapOptions||{});
    options = _.extend({
      addDefaultLayer: true,
      zoomTo: 'world'
    }, options);
    // add default OpenStreetMap tile layer
    if (options.addDefaultLayer) {
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }
    // zoom
    if (options.zoomTo=='world') {
      this.map.fitWorld();
    }
    if (options.zoomTo) {
      if (_.has(options.zoomTo, 'toLeaflet')){
        this.map.fitBounds(options.zoom.toLeaflet());
      }
      if (_.isArray(options.zoomTo)) {
        this.map.fitBounds(options.zoomTo);
      }
    }

    //handle zoomlevelschange (if layers are added/removed)
    this.map.on('zoomlevelschange', function(e) {
      var zoom = this.map.getZoom();
      var min_zoom = this.map.getMinZoom();
      var max_zoom = this.map.getMaxZoom();
      if (zoom<min_zoom) {
        this.map.setZoom(min_zoom);
      }
      if (zoom>max_zoom) {
        this.map.setZoom(max_zoom);
      }
    }.bind(this));
  },
  remove: function() {
    this.map.remove();
    Backbone.View.prototype.remove.call(this);
  }
});
