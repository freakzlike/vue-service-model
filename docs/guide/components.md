# Components

[[toc]]

## DisplayField

The `DisplayField` component can be used to display the value of the given field. The property `model` can either be a 
model instance or `null` to allow async loading of the model instance. The component will not render when `null` has 
been passed as `model`. To change the output for specific fields see [Fields rendering](/guide/fields.html#rendering). 

```vue
<template>
  [...]
    <display-field :model="album" field-name="title"/>
  [...]
</template>

<script>
  import {DisplayField} from 'vue-service-model'

  export default {
    components: {DisplayField},
    data () {
      return {
        album: null
      }  
    },
    mounted () {
      this.loadAlbum()    
    },
    methods: {
      async loadAlbum () {
        this.album = await Album.objects.detail(1)
      }
    }
  }
</script>
```

## InputField

The `InputField` component is equal to the `DisplayField`. The input value will directly change the data of your model (using the `valueSetter`). 

```vue
<template>
  [...]
    <input-field :model="album" field-name="title"/>
  [...]
</template>

<script>
  import {InputField} from 'vue-service-model'

  export default {
    components: {InputField},
    data () {
      return {
        album: null
      }  
    },
    mounted () {
      this.loadAlbum()    
    },
    methods: {
      async loadAlbum () {
        this.album = await Album.objects.detail(1)
      }
    }
  }
</script>
```