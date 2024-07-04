const e=JSON.parse('{"key":"v-4067e526","path":"/posts/distribute/rpc.html","title":"tinyrpc 设计与实现","lang":"zh-CN","frontmatter":{"icon":"edit","title":"tinyrpc 设计与实现","date":"2023-08-23T00:00:00.000Z","tag":["rpc"],"category":["distribute"],"description":"探索一个简单、易用RPC框架——tinyrpc的设计与实现 整体设计 RPC（Remote Procedure Call），全称为远程调用。一个完整的RPC架构分为了以下几个核心组件： Server：服务器； Client：客户端； Server Stub：服务端接收到Client发送的数据之后进行消息解包，调用本地方法； Client Stub：将客户端请求的参数、服务名称、服务地址进行打包，统一发送给server方；","head":[["meta",{"property":"og:url","content":"https://pedrogao.github.io/posts/distribute/rpc.html"}],["meta",{"property":"og:site_name","content":"廊中别苑"}],["meta",{"property":"og:title","content":"tinyrpc 设计与实现"}],["meta",{"property":"og:description","content":"探索一个简单、易用RPC框架——tinyrpc的设计与实现 整体设计 RPC（Remote Procedure Call），全称为远程调用。一个完整的RPC架构分为了以下几个核心组件： Server：服务器； Client：客户端； Server Stub：服务端接收到Client发送的数据之后进行消息解包，调用本地方法； Client Stub：将客户端请求的参数、服务名称、服务地址进行打包，统一发送给server方；"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-07-04T02:52:32.000Z"}],["meta",{"property":"article:author","content":"pedrogao"}],["meta",{"property":"article:tag","content":"rpc"}],["meta",{"property":"article:published_time","content":"2023-08-23T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-07-04T02:52:32.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"tinyrpc 设计与实现\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2023-08-23T00:00:00.000Z\\",\\"dateModified\\":\\"2024-07-04T02:52:32.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"pedrogao\\",\\"url\\":\\"https://github.com/pedrogao/\\"}]}"]]},"headers":[{"level":2,"title":"整体设计","slug":"整体设计","link":"#整体设计","children":[]},{"level":2,"title":"详细设计","slug":"详细设计","link":"#详细设计","children":[{"level":3,"title":"代理层","slug":"代理层","link":"#代理层","children":[]},{"level":3,"title":"路由层","slug":"路由层","link":"#路由层","children":[]},{"level":3,"title":"协议层","slug":"协议层","link":"#协议层","children":[]},{"level":3,"title":"序列化层","slug":"序列化层","link":"#序列化层","children":[]},{"level":3,"title":"注册层","slug":"注册层","link":"#注册层","children":[]},{"level":3,"title":"链路层","slug":"链路层","link":"#链路层","children":[]},{"level":3,"title":"容错层","slug":"容错层","link":"#容错层","children":[]}]},{"level":2,"title":"下一步计划","slug":"下一步计划","link":"#下一步计划","children":[]}],"git":{"createdTime":1720061552000,"updatedTime":1720061552000,"contributors":[{"name":"MQN-80","email":"3218290253@qq.com","commits":1}]},"readingTime":{"minutes":9.03,"words":2710},"filePathRelative":"posts/distribute/rpc.md","localizedDate":"2023年8月23日","excerpt":"<blockquote>\\n<p>探索一个简单、易用RPC框架——tinyrpc的设计与实现</p>\\n</blockquote>\\n<h2> 整体设计</h2>\\n<p>RPC（Remote Procedure Call），全称为远程调用。一个完整的RPC架构分为了以下几个核心组件：</p>\\n<ul>\\n<li>Server：服务器；</li>\\n<li>Client：客户端；</li>\\n<li>Server Stub：服务端接收到Client发送的数据之后进行消息解包，调用本地方法；</li>\\n<li>Client Stub：将客户端请求的参数、服务名称、服务地址进行打包，统一发送给server方；</li>\\n</ul>","autoDesc":true}');export{e as data};
