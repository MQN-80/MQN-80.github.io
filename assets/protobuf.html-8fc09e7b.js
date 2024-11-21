const t=JSON.parse('{"key":"v-23a61b90","path":"/posts/network/protobuf.html","title":"protobuf应用及反射","lang":"zh-CN","frontmatter":{"icon":"edit","title":"protobuf应用及反射","tag":["protobuf","reflection"],"category":["network"],"description":"1. protobuf简介 Protobuf(pb)是一种常见的数据序列化方式,常常用于进程间序列化信息传递,相对于传统的csv,json等,pb在缩小可读性的基础上,不仅结构体积小,而且解析速度快,其对比如下图所示: 特性\\\\类型 xml json protobuf 数据结构支持 简单结构 简单结构 复杂结构 数据保存方式 文本 文本 二进制 数据保存大小 大 大 小 编解码效率 慢 慢 快 语言支持程度 覆盖主流语言 覆盖主流语言 覆盖主流语言","head":[["meta",{"property":"og:url","content":"https://mqn-80.github.io/posts/network/protobuf.html"}],["meta",{"property":"og:site_name","content":"梦秋年"}],["meta",{"property":"og:title","content":"protobuf应用及反射"}],["meta",{"property":"og:description","content":"1. protobuf简介 Protobuf(pb)是一种常见的数据序列化方式,常常用于进程间序列化信息传递,相对于传统的csv,json等,pb在缩小可读性的基础上,不仅结构体积小,而且解析速度快,其对比如下图所示: 特性\\\\类型 xml json protobuf 数据结构支持 简单结构 简单结构 复杂结构 数据保存方式 文本 文本 二进制 数据保存大小 大 大 小 编解码效率 慢 慢 快 语言支持程度 覆盖主流语言 覆盖主流语言 覆盖主流语言"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-10-19T08:57:04.000Z"}],["meta",{"property":"article:author","content":"MQN-80"}],["meta",{"property":"article:tag","content":"protobuf"}],["meta",{"property":"article:tag","content":"reflection"}],["meta",{"property":"article:modified_time","content":"2024-10-19T08:57:04.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"protobuf应用及反射\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2024-10-19T08:57:04.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"MQN-80\\",\\"url\\":\\"https://github.com/MQN-80\\"}]}"]]},"headers":[],"git":{"createdTime":1729328224000,"updatedTime":1729328224000,"contributors":[{"name":"MQN-80","email":"3218290253@qq.com","commits":1}]},"readingTime":{"minutes":2.64,"words":793},"filePathRelative":"posts/network/protobuf.md","localizedDate":"2024年10月19日","excerpt":"<h1> 1. protobuf简介</h1>\\n<p>Protobuf(pb)是一种常见的数据序列化方式,常常用于进程间序列化信息传递,相对于传统的csv,json等,pb在缩小可读性的基础上,不仅结构体积小,而且解析速度快,其对比如下图所示:</p>\\n<table>\\n<thead>\\n<tr>\\n<th>特性\\\\类型</th>\\n<th>xml</th>\\n<th>json</th>\\n<th>protobuf</th>\\n</tr>\\n</thead>\\n<tbody>\\n<tr>\\n<td>数据结构支持</td>\\n<td>简单结构</td>\\n<td>简单结构</td>\\n<td>复杂结构</td>\\n</tr>\\n<tr>\\n<td>数据保存方式</td>\\n<td>文本</td>\\n<td>文本</td>\\n<td>二进制</td>\\n</tr>\\n<tr>\\n<td>数据保存大小</td>\\n<td>大</td>\\n<td>大</td>\\n<td>小</td>\\n</tr>\\n<tr>\\n<td>编解码效率</td>\\n<td>慢</td>\\n<td>慢</td>\\n<td>快</td>\\n</tr>\\n<tr>\\n<td>语言支持程度</td>\\n<td>覆盖主流语言</td>\\n<td>覆盖主流语言</td>\\n<td>覆盖主流语言</td>\\n</tr>\\n</tbody>\\n</table>","autoDesc":true}');export{t as data};