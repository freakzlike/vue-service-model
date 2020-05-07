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
    <!-- or directly with field -->
    <display-field :field="album.getField('title')"/>
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
    <!-- or directly with field -->
    <input-field :field="album.getField('title')"/>
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

## FieldLabel

In case you just want to render the label of the field you can use the `FieldLabel` component which will resolve the async field label. 

```vue
<template>
  [...]
    <field-label :model="album" field-name="title"/>
    <!-- or directly with field -->
    <field-label :field="album.getField('title')"/>
  [...]
</template>
```