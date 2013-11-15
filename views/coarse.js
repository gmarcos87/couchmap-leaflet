var Backbone =  require('backbone');
_ = require('underscore');
var L = require('leaflet');
var Lmarkercluster = require('leaflet-markercluster');
var common = require('couchmap-common');

module.exports = Backbone.View.extend({
  CoarseMarkerView: require('./coarseMarker'),
  initialize: function(options) {
    this.mapView = options.mapView;
    this.bbox = common.bbox(this.mapView.map.getBounds());
    this.zoom = common.validate_zoom(this.mapView.map.getZoom()+1);
    this.layer = L.markerClusterGroup(
      {
        showCoverageOnHover: false,
        zoomToBoundsOnClick: false,
        maxClusterRadius: 50,
        iconCreateFunction: function(cluster) {
          var count = 0;
          _.each(cluster.getAllChildMarkers(), function(marker) {
            count += marker.options.view.model.get('count');
          });
          return this.iconCreate(count);
        }.bind(this)
      })
      .addTo(this.mapView.map)
      .on('click', function(a) {
        var model = a.layer.options.view.model;
        this.mapView.map.fitBounds([
          [model.get('bbox_south'), model.get('bbox_west')],
          [model.get('bbox_north'), model.get('bbox_east')]
          ]);
      }.bind(this))
      .on('clusterclick', function(a) {
        var models = _.map(a.layer.getAllChildMarkers(), function(marker) {
          return marker.options.view.model;
        });
        var west = _.min(_.map(models, function(model) { return model.get('bbox_west'); }));
        var east = _.max(_.map(models, function(model) { return model.get('bbox_east'); }));
        var south = _.min(_.map(models, function(model) { return model.get('bbox_south'); }));
        var north = _.max(_.map(models, function(model) { return model.get('bbox_north'); }));
        this.mapView.map.fitBounds([
          [south, west],
          [north, east]
          ]);
      }.bind(this));


    this.markers = {};

    this.listenTo(this.mapView, 'bbox', function(bbox, zoom) {
      this.bbox = bbox;
      if (this.zoom!=zoom) {
        this.zoom = zoom;
      }
    });
    this.listenTo(this.collection, 'sync', this.render);
    this.listenTo(this.collection, 'add', this.addModel);
    this.listenTo(this.collection, 'remove', this.removeModel);
    this.render();
  },
  render: function() {
    // add views for the current zoom level
    _.each(this.collection.where({zoom: this.zoom}), this.addModel, this);
    // remove views for other zoom levels
    var remove = this.collection.filter(function(model) {
      return model.get('zoom')!=this.zoom;
    }, this);
    _.each(remove, this.removeModel, this);
  },
  iconCreate: function(count) {
    var size = 'large';
    if (count<10) {
      size = 'small';
    } else if (count<100) {
      size = 'medium';
    }
    return new L.DivIcon({
      html: '<div><span>'+count+'</span></div>',
           className: 'marker-cluster marker-cluster-'+size,
           iconSize: new L.Point(40,40)
    });
  },
  addModel: function(model) {
    var id = model.get('id');
    if (model.get('zoom')==this.zoom && !this.markers[id]) {
      this.markers[id] = new this.CoarseMarkerView({
        layer: this.layer,
        model: model,
        iconCreate: this.iconCreate
      });
    }
  },
  removeModel: function(model) {
    var id = model.get('id');
    if (this.markers[id]) {
      this.markers[id].remove();
      delete this.markers[id];
    }
  },
  remove: function() {
    _.each(this.markers, function(marker, id) {
      marker.remove();
    });
    this.markers = {};
    this.mapView.map.removeLayer(this.layer);
  }
});
