var Backbone =  require('backbone');
var L = require('leaflet');

module.exports = Backbone.View.extend({
  initialize: function(options) {
    this.layer = options.layer;
    this.iconCreate = options.iconCreate;
    this.listenTo(this.model, 'change', this.render);
    this.render();
  },
  render: function() {
    this.remove();
    var count = this.model.get('count');
    this.marker = L.marker([this.model.get('lat'), this.model.get('lon')],{
      icon: this.iconCreate(count),
      view: this
    })
      .addTo(this.layer);
    this.marker.view = this;
  },
  remove: function() {
    if (this.marker) {
      this.layer.removeLayer(this.marker);
    }
  }
});
