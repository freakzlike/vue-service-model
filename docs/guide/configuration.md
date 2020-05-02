# Configuration

[[toc]]

## Usage

To make some optional configuration, you need to call `setConfig` with your configuration as js object.
It is recommend to do this in your `main.js` but it is also possible to set or change the configuration during runtime.

You can see the [full configuration structure here](/api/configuration.html).

```js
import {setConfig} from 'vue-service-model'

setConfig({
  events: {
    onSendDetailRequest: params => {
      console.log('onSendDetailRequest', params)
    }
  }
})
```

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

