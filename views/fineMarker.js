var Backbone =  require('backbone');
var L = require('leaflet');

module.exports = Backbone.View.extend({
  initialize: function(options) {
    this.layer = options.layer;
    this.listenTo(this.model, 'change', this.render);
    this.render();
  },
  render: function() {
    if (this.marker) {
      this.remove();
    }
    this.marker = L.marker([this.model.get('lat'), this.model.get('lon')],{
      title: this.model.id
    })
      .addTo(this.layer);
  },
  remove: function() {
    this.layer.removeLayer(this.marker);
  }
});

