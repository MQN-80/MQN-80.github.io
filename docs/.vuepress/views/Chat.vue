<template>
    <div>
      <h1>Boost.Beast WebSocket Chat Client</h1>
      <p>
        <a href="http://www.boost.org/libs/beast">Boost.Beast</a>
        <a href="http://www.boost.org/libs/beast/example/websocket/server/chat-multi">Source Code</a>
      </p>
      <div>
        Server URI: 
        <input class="draw-border" v-model="uri" size="47" style="margin-bottom: 5px;" />
        <button class="echo-button" @click="connect">Connect</button>
        <button class="echo-button" @click="disconnect">Disconnect</button>
      </div>
      <div>
        Your Name: 
        <input class="draw-border" v-model="userName" size="47" style="margin-bottom: 5px;" />
      </div>
      <pre id="messages" style="width: 600px; height: 400px; white-space: normal; overflow: auto; border: solid 1px #cccccc; margin-bottom: 5px;">
        {{ messages }}
      </pre>
      <div style="margin-bottom: 5px;">
        Message<br>
        <input class="draw-border" v-model="sendMessage" @keyup.enter="send" size="74" />
        <button class="echo-button" @click="send">Send</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        uri: 'ws://localhost:8080',
        userName: '',
        sendMessage: '',
        messages: '',
        ws: null
      };
    },
    methods: {
      showMessage(msg) {
        this.messages += msg + "\n";
        this.$nextTick(() => {
          let messageElement = this.$el.querySelector("#messages");
          messageElement.scrollTop = messageElement.scrollHeight - messageElement.clientHeight;
        });
      },
      connect() {
        this.ws = new WebSocket(this.uri);
        this.ws.onopen = (ev) => {
          this.showMessage("[connection opened]");
        };
        this.ws.onclose = (ev) => {
          this.showMessage("[connection closed]");
        };
        this.ws.onmessage = (ev) => {
          this.showMessage(ev.data);
        };
        this.ws.onerror = (ev) => {
          this.showMessage("[error]");
          console.log(ev);
        };
      },
      disconnect() {
        this.ws.close();
      },
      send() {
        this.ws.send(this.userName + ": " + this.sendMessage);
        this.sendMessage = "";
      }
    }
  };
  </script>
  
  <style scoped>
  .draw-border {
    border: 1px solid #000;
    padding: 5px;
  }
  
  .echo-button {
    margin: 5px;
  }
  </style>
  