var Backbone =  require('backbone');
_ = require('underscore');
var L = require('leaflet');
var Lmarkercluster = require('leaflet-markercluster');

module.exports = Backbone.View.extend({
  FineMarkerView: require('./fineMarker'),
  initialize: function(options) {
    this.proxyView = options.proxyView;
    this.layer = L.markerClusterGroup().addTo(this.proxyView.mapView.map);
    this.subviews = {};
    this.listenTo(this.collection, 'add', this.addModel);
    this.listenTo(this.collection, 'remove', this.removeModel);
    this.render();
  },
  addModel: function(model) {
    this.removeModel(model);
    this.subviews[model.id] = new this.FineMarkerView({
      layer: this.layer,
      model: model
    });
  },
  removeModel: function(model) {
    if (this.subviews[model.id]) {
      this.subviews[model.id].remove();
      delete this.subviews[model.id];
    }
  },
  render: function() {
    this.collection.each(this.addModel, this);
  },
  removeSubviews: function() {
    _.each(this.subviews, this.removeModel, this);
    this.proxyView.mapView.map.removeLayer(this.layer);
  },
  remove: function() {
    this.removeSubviews();
    Backbone.View.prototype.remove.call(this);
  }
});

