const t=JSON.parse('{"key":"v-047ef8aa","path":"/posts/optimization/outpoint.html","title":"基于外点法的分式优化问题","lang":"zh-CN","frontmatter":{"icon":"edit","title":"基于外点法的分式优化问题","date":"2023-10-23T00:00:00.000Z","tag":["AI","最优化","外点法"],"category":["optimization"],"description":"1.问题定义 该问题为带约束的优化问题，约束包括等式约束和不等式约束两部分，本问题难点在于两个，一个是待优化变量维数较高，另一个是初始点难以确定，很难给出有效的初始点 2.问题分析 因初始点难以选取，因此我们采用外点法进行优化，因为外点法无需从有效的初始点出发进行迭代，因此我们可以从任意点出发进行迭代求解；接着我们将原先的带约束优化问题改为无约束优化问题，将约束条件乘上惩罚系数与原函数相加，将此作为无约束问题进行求解 外点法具体定义和步骤:","head":[["meta",{"property":"og:url","content":"https://pedrogao.github.io/posts/optimization/outpoint.html"}],["meta",{"property":"og:site_name","content":"廊中别苑"}],["meta",{"property":"og:title","content":"基于外点法的分式优化问题"}],["meta",{"property":"og:description","content":"1.问题定义 该问题为带约束的优化问题，约束包括等式约束和不等式约束两部分，本问题难点在于两个，一个是待优化变量维数较高，另一个是初始点难以确定，很难给出有效的初始点 2.问题分析 因初始点难以选取，因此我们采用外点法进行优化，因为外点法无需从有效的初始点出发进行迭代，因此我们可以从任意点出发进行迭代求解；接着我们将原先的带约束优化问题改为无约束优化问题，将约束条件乘上惩罚系数与原函数相加，将此作为无约束问题进行求解 外点法具体定义和步骤:"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-07-04T12:24:53.000Z"}],["meta",{"property":"article:author","content":"pedrogao"}],["meta",{"property":"article:tag","content":"AI"}],["meta",{"property":"article:tag","content":"最优化"}],["meta",{"property":"article:tag","content":"外点法"}],["meta",{"property":"article:published_time","content":"2023-10-23T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-07-04T12:24:53.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"基于外点法的分式优化问题\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2023-10-23T00:00:00.000Z\\",\\"dateModified\\":\\"2024-07-04T12:24:53.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"pedrogao\\",\\"url\\":\\"https://github.com/pedrogao/\\"}]}"]]},"headers":[{"level":2,"title":"1.问题定义","slug":"_1-问题定义","link":"#_1-问题定义","children":[]},{"level":2,"title":"2.问题分析","slug":"_2-问题分析","link":"#_2-问题分析","children":[]},{"level":2,"title":"3.实际求解","slug":"_3-实际求解","link":"#_3-实际求解","children":[]}],"git":{"createdTime":1720095893000,"updatedTime":1720095893000,"contributors":[{"name":"MQN-80","email":"3218290253@qq.com","commits":1}]},"readingTime":{"minutes":1.2,"words":361},"filePathRelative":"posts/optimization/outpoint.md","localizedDate":"2023年10月23日","excerpt":"<h2> 1.问题定义</h2>\\n<p>该问题为带约束的优化问题，约束包括等式约束和不等式约束两部分，本问题难点在于两个，一个是待优化变量维数较高，另一个是初始点难以确定，很难给出有效的初始点</p>\\n<h2> 2.问题分析</h2>\\n<p>因初始点难以选取，因此我们采用外点法进行优化，因为外点法无需从有效的初始点出发进行迭代，因此我们可以从任意点出发进行迭代求解；接着我们将原先的带约束优化问题改为无约束优化问题，将约束条件乘上惩罚系数与原函数相加，将此作为无约束问题进行求解</p>\\n<blockquote>\\n<p><a href=\\"https://blog.csdn.net/m2xgo/article/details/111147195\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">外点法具体定义和步骤:</a></p>\\n</blockquote>","autoDesc":true}');export{t as data};