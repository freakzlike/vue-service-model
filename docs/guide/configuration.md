# Configuration

[[toc]]

## Usage

To make some optional configuration, you need to call `setConfig` with your configuration as js object.
It is recommend to do this in your `main.js` but it is also possible to set or change the configuration during runtime.
When calling `setConfig` the active configuration will be replaced and not be merged.

You can see the [full configuration structure here](/api/configuration.html).

```js
import {setConfig} from 'vue-service-model'

setConfig({
  // Translation keys
  i18n: {
    no: 'Nein', 
    yes: () => Promise.resolve('Ja')
  },

  // Callback events
  events: {
    onSendDetailRequest: params => {
      console.log('onSendDetailRequest', params)
    }
  }
})
```

## i18n translations

You can customize the translations that will be used by `vue-service-model`. You can set a string or a function that will return a string or a promise.
The function will be called with the translation key as argument to allow to map the translation to your translation handling.  

### All keys with default translation

| Key | Default translation |
| --- | ----------- |
| `no` | No |
| `yes` | Yes |

## Events

Some functions in `vue-service-model` will emit events where you can register a callback in the configuration.

### Requests/Response

| Event | Description |
| ----- | ----------- | 
| **onSendDetailRequest** | When doing a detail request (ModelManager.sendDetailRequest) |
| **onSendListRequest** | When doing a list request (ModelManager.sendListRequest) |
| **onSendCreateRequest** | When doing a create request (ModelManager.sendCreateRequest) |
| **onSendUpdateRequest** | When doing a update request (ModelManager.sendUpdateRequest) |
| **onSendPartialUpdateRequest** | When doing a partial update request (ModelManager.sendPartialUpdateRequest) |
| **onSendDeleteRequest** | When doing a delete request (ModelManager.sendDeleteRequest) |
| **onResponseError** | When a error response has been received (ModelManager.handleResponseError) |

## vue-async-computed

In case you want `vue-service-model` to use [`vue-async-computed`](https://github.com/foxbenjaminfox/vue-async-computed) then you can enable it with:
```js
  useAsyncComputed: true
```

