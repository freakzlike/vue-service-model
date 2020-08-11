# Components

[[toc]]

::: tip
In case you need to achieve more reactivity, then take a look at [Integration of `vue-async-computed`](/guide/installation.html#integration-of-vue-async-computed).
:::

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

### Loading state

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

### Passing additional properties to `prepareDisplayRender`

You can optionally pass additional properties to `prepareDisplayRender` with the property `render-props`. This allows more control on how your custom field should be rendered. 

```vue
<template>
  [...]
    <display-field :field="noteField" :render-props="{ note: 'Warning' }"/>
    <display-field :field="noteField" :render-props="{ note: 'Error' }"/>
  [...]
</template>

<script>
  [...]
  class NoteField extends CharField {
    async prepareDisplayRender (renderProps) {
      const note = renderProps?.note || 'Info'
      const value = await this.value
      return value && `${note}: ${value}`
    }
  }
  [...]
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

### Loading state

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

### Common input properties

There are two common input properties `disabled` and `readonly`. These should always be implemented when creating new field types.

```vue
<template>
  [...]
    <!-- disabled input -->
    <input-field :model="album" field-name="title" disabled/>

    <!-- readonly input -->
    <input-field :model="album" field-name="title" readonly/>
  [...]
</template>
```

### Passing additional properties to `prepareInputRender`

You can optionally pass additional properties to `prepareInputRender` with the property `render-props`. It works the same as for [`DisplayField`](/guide/components.html#passing-additional-properties-to-preparedisplayrender).

```vue
<template>
  [...]
    <input-field :field="myField" :render-props="{ anyOption: 7 }"/>
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