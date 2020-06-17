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
    created () {
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

::: warning
When using direct `field` property, keep in mind that the model will be `null` during loading
:::

To display the loading state of the component, when the data is being fetched, you can use the `loading` slot.

```vue
<template>
  [...]
    <display-field :model="album" field-name="title">
      <template v-slot:loading>
        <span>Loading title...</span>
      </template>
    </display-field>
  [...]
</template>
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
    created () {
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

::: warning
When using direct `field` property, keep in mind that the model will be `null` during loading
:::

To display the loading state of the component, when the data is being fetched, you can use the `loading` slot.

```vue
<template>
  [...]
    <input-field :model="album" field-name="title">
      <template v-slot:loading>
        <span>Loading title...</span>
      </template>
    </input-field>
  [...]
</template>
```

## FieldLabel

In case you just want to render the label of the field you can use the `FieldLabel` component which will resolve the async field label. 
You can use your model instance or the static model class

```vue
<template>
  [...]
    <!-- with model static class -->
    <field-label :model="Album" field-name="title"/>
    <!-- or directly with field -->
    <field-label :field="Album.getField('title')"/>

    <!-- with model instance -->
    <field-label :model="album" field-name="title"/>
    <!-- or directly with field -->
    <field-label :field="album.getField('title')"/>
  [...]
</template>
```