const e=JSON.parse('{"key":"v-0826edd7","path":"/posts/network/tcp-impl.html","title":"谈谈用户态 TCP 协议实现","lang":"zh-CN","frontmatter":{"icon":"edit","title":"谈谈用户态 TCP 协议实现","date":"2022-05-31T00:00:00.000Z","tag":["cpp","tcp"],"category":["network"],"description":"TCP 概述 TCP 协议是目前名气最大、使用最广泛的传输层网络协议。 TCP 是一个可靠的（reliable）、面向连接的（connection-oriented）、基于字节流（byte-stream）、全双工的（full-duplex）协议。 正是因为这些优点，TCP 协议成为了网络协议重点中的重点，是学习、面试、考试上的常客，这也导致了 TCP 的资料很多，但是普遍集中在“形”上面，很多人将三次握手、四次挥手、滑动窗口等知识点背得滚瓜烂熟，但却没有理解 TCP “可靠” 协议的精髓。 因此，本着实践加深理解的初衷，笔者跟随 CS144 这门课，会头到尾实现了一个用户态简易版 TCP 协议。","head":[["meta",{"property":"og:url","content":"https://pedrogao.github.io/posts/network/tcp-impl.html"}],["meta",{"property":"og:site_name","content":"廊中别苑"}],["meta",{"property":"og:title","content":"谈谈用户态 TCP 协议实现"}],["meta",{"property":"og:description","content":"TCP 概述 TCP 协议是目前名气最大、使用最广泛的传输层网络协议。 TCP 是一个可靠的（reliable）、面向连接的（connection-oriented）、基于字节流（byte-stream）、全双工的（full-duplex）协议。 正是因为这些优点，TCP 协议成为了网络协议重点中的重点，是学习、面试、考试上的常客，这也导致了 TCP 的资料很多，但是普遍集中在“形”上面，很多人将三次握手、四次挥手、滑动窗口等知识点背得滚瓜烂熟，但却没有理解 TCP “可靠” 协议的精髓。 因此，本着实践加深理解的初衷，笔者跟随 CS144 这门课，会头到尾实现了一个用户态简易版 TCP 协议。"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-07-04T02:52:32.000Z"}],["meta",{"property":"article:author","content":"pedrogao"}],["meta",{"property":"article:tag","content":"cpp"}],["meta",{"property":"article:tag","content":"tcp"}],["meta",{"property":"article:published_time","content":"2022-05-31T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-07-04T02:52:32.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"谈谈用户态 TCP 协议实现\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2022-05-31T00:00:00.000Z\\",\\"dateModified\\":\\"2024-07-04T02:52:32.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"pedrogao\\",\\"url\\":\\"https://github.com/pedrogao/\\"}]}"]]},"headers":[{"level":2,"title":"TCP 概述","slug":"tcp-概述","link":"#tcp-概述","children":[]},{"level":2,"title":"TCP 简单介绍","slug":"tcp-简单介绍","link":"#tcp-简单介绍","children":[{"level":3,"title":"面向连接","slug":"面向连接","link":"#面向连接","children":[]},{"level":3,"title":"可靠性","slug":"可靠性","link":"#可靠性","children":[]},{"level":3,"title":"基于字节流","slug":"基于字节流","link":"#基于字节流","children":[]},{"level":3,"title":"全双工","slug":"全双工","link":"#全双工","children":[]}]},{"level":2,"title":"Sponge 协议介绍","slug":"sponge-协议介绍","link":"#sponge-协议介绍","children":[{"level":3,"title":"Socket API","slug":"socket-api","link":"#socket-api","children":[]},{"level":3,"title":"用户态协议","slug":"用户态协议","link":"#用户态协议","children":[]},{"level":3,"title":"Sponge 协议概览","slug":"sponge-协议概览","link":"#sponge-协议概览","children":[]}]},{"level":2,"title":"Sponge 协议实现","slug":"sponge-协议实现","link":"#sponge-协议实现","children":[{"level":3,"title":"ByteStream","slug":"bytestream","link":"#bytestream","children":[]},{"level":3,"title":"StreamReassembler","slug":"streamreassembler","link":"#streamreassembler","children":[]},{"level":3,"title":"TCPReceiver","slug":"tcpreceiver","link":"#tcpreceiver","children":[]},{"level":3,"title":"TCPSender","slug":"tcpsender","link":"#tcpsender","children":[]},{"level":3,"title":"TCPConnection","slug":"tcpconnection","link":"#tcpconnection","children":[]}]},{"level":2,"title":"Sponge 使用","slug":"sponge-使用","link":"#sponge-使用","children":[]},{"level":2,"title":"总结","slug":"总结","link":"#总结","children":[]},{"level":2,"title":"参考资料","slug":"参考资料","link":"#参考资料","children":[]}],"git":{"createdTime":1720061552000,"updatedTime":1720061552000,"contributors":[{"name":"MQN-80","email":"3218290253@qq.com","commits":1}]},"readingTime":{"minutes":76.62,"words":22985},"filePathRelative":"posts/network/tcp-impl.md","localizedDate":"2022年5月31日","excerpt":"<h2> TCP 概述</h2>\\n<p>TCP 协议是目前名气最大、使用最广泛的传输层网络协议。</p>\\n<p>TCP 是一个可靠的（reliable）、面向连接的（connection-oriented）、基于字节流（byte-stream）、全双工的（full-duplex）协议。</p>\\n<p>正是因为这些优点，TCP 协议成为了网络协议重点中的重点，是学习、面试、考试上的常客，这也导致了 TCP 的资料很多，但是普遍集中在“形”上面，很多人将三次握手、四次挥手、滑动窗口等知识点背得滚瓜烂熟，但却没有理解 TCP “可靠” 协议的精髓。</p>\\n<p>因此，本着实践加深理解的初衷，笔者跟随 CS144 这门课，会头到尾实现了一个用户态简易版 TCP 协议。</p>","autoDesc":true}');export{e as data};
