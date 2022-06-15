<template>
    <v-container class="map" fluid>
      <client-only>
        <l-map :zoom="zoom" :center="center" ref="myMap" @ready="doSomethingOnReady()" :maxBounds="bounds">
          
          <l-tile-layer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" :attribution="attribution"></l-tile-layer>
          
          <l-geo-json :geojson="geojson" :options="options"></l-geo-json>
          
          <l-control class="nav-custom-control" position="topright">
            <div style="width:20vw;height:10vh">
              <iframe style="border-radius:12px" 
                    :src="currentSong"
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    allowfullscreen="" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
              </iframe>            
            </div>
          </l-control>
        </l-map>
      </client-only>            
    </v-container>    
</template>

<script>
import L  from 'leaflet';
import {LMap, LTileLayer, LControl } from 'vue2-leaflet';

export default {
  name: 'InspirePage',
  components: {
    LMap,
    LTileLayer,
    LControl
  },
  data(){
    return{            
      attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors and DecideMadrid',
      geojson: null,
      zoom: 16,
      center: [40.41879,-3.6866426],
      bounds: [40, -4.1, 40.6, -3.3],
      currentItem:{},      
      currentSong:null,
    }
  },

  methods: {
    doSomethingOnReady() {
        this.bounds2 = [ this.bounds[1], this.bounds[0], this.bounds[3], this.bounds[2]]
        this.map = this.$refs.myMap.mapObject;        
        const me = this;
        this.map.on('click', (e)=>{me.onClick(e)})
        this.downloadGeoJson()
    },

    async downloadGeoJson() {
      const url = '/.netlify/functions/index'
      const response = await this.$axios.get(url);
      this.data = await response.data;
      
      let index = 0;      
      const geojson = {
        type: "FeatureCollection",
        features: []
      };

      this.total=0

      let headers = []      
      const floatValues =  /[+-]?([0-9]*[.])?[0-9]+/;

      this.data.split('\n').forEach( (l)=>{
        if( index++ == 0){
          headers = l.split(";")
          return
        }
        const fields = l.split(";")
        let properties = {}
        for(var i=0; i<headers.length;i++){
            properties[headers[i]] = fields[i]
        }        
        if( !properties.longitud || !properties.latitud )
          return
        if (properties.longitud.match(floatValues) && !isNaN(properties.longitud)) {        
          let add = {
            type: "Feature",
            properties: properties,
            geometry: {
                type: "Point",
                coordinates: [properties.longitud,properties.latitud]
            }
          }
          geojson.features.push(add)
          this.total++
        }
      })       

      this.geojson = geojson      
            
      const points = turf.voronoi(this.geojson,{
        bbox:this.bounds2
      })      
      const voronoi = {
        type: "FeatureCollection",
        features: []
      };
      points.features.forEach( (x)=>{
        voronoi.features.push(x)
      })
      L.geoJSON(voronoi).addTo(this.map)

      this.$nextTick(() => this.centerAtStartup())
    },

    centerAtStartup(){
      this.zoom = 20;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition( (position)=>{
          this.$nextTick( ()=> this.flyTo([position.coords.longitude, position.coords.latitude]) )
        }, ()=>{
          this.$nextTick(() => this.flyTo())
        });
      } else {
        this.$nextTick(() => this.flyTo())
      }      
    },

    flyTo( coordinates ){
      if( !coordinates ){
        const random =Math.floor(Math.random()*this.total)                  
        this.currentItem = this.geojson.features[random]
      }else{
        var targetPoint = turf.point(coordinates);
        var nearest = turf.nearestPoint(targetPoint, this.geojson);
        this.currentItem = nearest;
      }      
      this.currentSong = this.currentItem.properties.link
      this.map.flyTo(L.latLng(this.currentItem.geometry.coordinates[1], this.currentItem.geometry.coordinates[0]), 14)
    },

    onClick(e){
        var popLocation= e.latlng;
        this.flyTo([popLocation.lng, popLocation.lat])
    }

  },

  computed:{
    options() {
      return {
        onEachFeature: this.onEachFeatureFunction
      };
    },
    onEachFeatureFunction() {
      return (feature, layer) => {
        if( !feature.properties )
          return
        layer.on({
            click: ()=>{
              this.currentSong = feature.properties.link
            }            
        });  
      };
    },       
  },

  async mounted(){        
  },

}
</script>

<style >

.crop-text {  
  overflow-wrap: break-word;
  text-overflow: ellipsis;
  overflow: hidden;
}

.card-details{
  height:5vh;
  background-color: black; 
}

</style>
