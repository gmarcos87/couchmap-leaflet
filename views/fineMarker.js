var Backbone =  require('backbone');
var L = require('leaflet');

module.exports = Backbone.View.extend({
  initialize: function(options) {
    this.layer = options.layer;
    this.listenTo(this.model, 'change', this.render);
    this.render();
  },
  render: function() {
    this.removeMarker();
    this.marker = L.marker([this.model.get('lat'), this.model.get('lon')],{
      title: this.model.id
    })
      .addTo(this.layer);
  },
  removeMarker: function() {
    if (this.marker) {
      this.layer.removeLayer(this.marker);
      this.marker = undefined;
    }
  },
  remove: function() {
    this.removeMarker();
    Backbone.View.prototype.remove.call(this);
  }
});

